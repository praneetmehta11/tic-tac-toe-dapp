// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721 {
    function safeMint(address to, uint256 tokenId) external;
}

contract TicTacToeGame is Ownable {
    event GameCreated(uint256 _gameid, address creator);
    event GameStarted(
        uint256 _gameid,
        address player1,
        address player2,
        address _turn
    );
    event Move(uint256 _gameid, address playedBy, uint256 r, uint256 c);
    event WinnerDeclared(uint256 _gameid, address winner);
    event GameDraw(uint256 _gameid);
    event PrizeClaimed(uint256 _gameid, address winner);
    event RoomAdded(uint256 _roomId);

    struct RoomInfo {
        IERC20 payToken;
        uint256 betAmount;
        uint256 timelimit;
        uint256 game;
        bool watingForPlayer;
    }

    struct Game {
        address player1;
        string player1Name;
        address player2;
        string player2Name;
        address turn;
        uint256[3][3] board;
        uint256 deadline;
        bool isRunning;
        uint256 roomId;
        uint256 balance;
    }

    RoomInfo[] private rooms;

    Game[] private games;

    address private nft;

    mapping(address => uint256) userActiveGame;

    function getUserActiveGame(
        address _address
    ) public view returns (uint256 _gameId) {
        return userActiveGame[_address];
    }

    function addRoomType(
        address _paytoken,
        uint256 _betamount,
        uint256 _timelimit
    ) external onlyOwner {
        IERC20 paytoken = IERC20(_paytoken);
        rooms.push(
            RoomInfo({
                payToken: paytoken,
                betAmount: _betamount,
                timelimit: _timelimit,
                game: 0,
                watingForPlayer: false
            })
        );
        paytoken.approve(address(this), 2 ** 256 - 1);
        emit RoomAdded(rooms.length - 1);
    }

    function getRoomsCount() public view returns (uint256 count) {
        return rooms.length;
    }

    function joinGame(uint256 _roomid, string memory _name) external {
        address from = msg.sender;
        require(_roomid >= 0 && _roomid < rooms.length, "invalid room id");
        if (userActiveGame[from] != 0) {
            address winner = getWinner(userActiveGame[from] - 1);
            if (
                winner == address(0) ||
                (winner == from && games[userActiveGame[from] - 1].balance > 0)
            ) {
                revert("can not join the game");
            }
        }
        RoomInfo storage ri = rooms[_roomid];
        require(
            ri.payToken.allowance(msg.sender, address(this)) >= ri.betAmount,
            "you have to approve control of tokens"
        );
        ri.payToken.transferFrom(from, address(this), ri.betAmount);
        if (ri.watingForPlayer == true) {
            ri.watingForPlayer = false;
            Game storage g = games[ri.game];
            g.player2 = from;
            g.player2Name = _name;
            g.turn = _decideTurn(g.player1, g.player2);
            g.balance += ri.betAmount;
            g.isRunning = true;
            g.deadline = block.timestamp + ri.timelimit;
            emit GameStarted(ri.game, g.player1, g.player2, g.turn);
        } else {
            uint256[3][3] memory board;
            games.push(
                Game({
                    player1: from,
                    player1Name: _name,
                    player2: address(0),
                    player2Name: "",
                    turn: address(0),
                    board: board,
                    deadline: 0,
                    isRunning: false,
                    roomId: _roomid,
                    balance: ri.betAmount
                })
            );
            ri.game = (games.length - 1);
            ri.watingForPlayer = true;
            emit GameCreated(games.length - 1, from);
        }
        userActiveGame[from] = games.length;
    }

    function _decideTurn(
        address player1,
        address player2
    ) private view returns (address turn) {
        uint256 _turn = uint256(
            keccak256(abi.encodePacked(player1, player2, block.timestamp))
        );
        if (_turn % 2 == 0) {
            turn = player1;
        } else {
            turn = player2;
        }
    }

    function play(uint256 _gameId, uint256 _r, uint256 _c) external {
        require(
            _gameId >= 0 && _gameId < games.length,
            "validation failed: invalid game id"
        );
        require(_r >= 0 && _r < 3, "validation failed: invalid row index");
        require(_c >= 0 && _c < 3, "validation failed: invalid column index");
        Game storage g = games[_gameId];
        require(
            block.timestamp < g.deadline,
            "validation failed: deadline exceeded"
        );
        require(g.isRunning == true, "game ended");
        address from = msg.sender;
        require(
            g.player1 == from || g.player2 == from,
            "validation failed: wrong room"
        );
        require(g.turn == from, "validation failed: not your turn");
        uint256 player = 1;
        if (g.player2 == from) {
            player = 2;
        }
        require(g.board[_r][_c] == 0, "validation failed: invalid move");
        g.board[_r][_c] = player;
        emit Move(_gameId, from, _r, _c);

        if (_isWinner(_gameId, player) == true) {
            g.isRunning = false;
            delete userActiveGame[g.player1];
            delete userActiveGame[g.player2];
            emit WinnerDecleared(_gameId, from);
            rooms[g.roomId].payToken.transferFrom(
                address(this),
                g.turn,
                g.balance
            );
            IERC721(nft).safeMint(g.turn, _gameId);
            g.balance = 0;
        } else if (_isBoardFull(_gameId) == true) {
            g.isRunning = false;
            rooms[g.roomId].payToken.transferFrom(
                address(this),
                g.player1,
                g.balance / 2
            );
            g.balance -= g.balance / 2;
            rooms[g.roomId].payToken.transferFrom(
                address(this),
                g.player2,
                g.balance
            );
            // transfer money back to both the players
            g.balance = 0;
            delete userActiveGame[g.player1];
            delete userActiveGame[g.player2];
            emit GameDraw(_gameId);
        } else {
            g.turn = g.player1;
            if (player == 1) {
                g.turn = g.player2;
            }
            g.deadline = block.timestamp + rooms[g.roomId].timelimit;
        }
    }

    function _isWinner(
        uint256 _gameId,
        uint256 player
    ) private view returns (bool winner) {
        for (uint256 r = 0; r < 3; r++) {
            if (
                _check(_gameId, player, r, r, r, 0, 1, 2) ||
                _check(_gameId, player, 0, 1, 2, r, r, r)
            ) return true;
        }

        if (
            _check(_gameId, player, 0, 1, 2, 0, 1, 2) ||
            _check(_gameId, player, 0, 1, 2, 2, 1, 0)
        ) return true;
        return false;
    }

    function setNft(address _address) external onlyOwner {
        nft = _address;
    }

    function _check(
        uint256 _gameId,
        uint256 player,
        uint256 r1,
        uint256 r2,
        uint256 r3,
        uint256 c1,
        uint256 c2,
        uint256 c3
    ) private view returns (bool check) {
        Game storage g = games[_gameId];
        if (
            g.board[r1][c1] == player &&
            g.board[r2][c2] == player &&
            g.board[r3][c3] == player
        ) return true;
        return false;
    }

    function _isBoardFull(
        uint256 _gameId
    ) private view returns (bool isBoardFull) {
        Game storage g = games[_gameId];
        uint256 count = 0;
        for (uint256 r = 0; r < 3; r++)
            for (uint256 c = 0; c < 3; c++) if (g.board[r][c] > 0) count++;
        if (count >= 9) return true;
    }

    function getWinner(uint256 _gameId) public view returns (address _winner) {
        require(
            _gameId >= 0 && _gameId < games.length,
            "validation failed: invalid game id"
        );
        Game storage g = games[_gameId];
        if (_isWinner(_gameId, 1) == true) return g.player1;
        if (_isWinner(_gameId, 2) == true) return g.player2;
        if (block.timestamp > g.deadline) {
            if (g.turn == g.player1) {
                return g.player2;
            } else {
                return g.player1;
            }
        }
        return address(0);
    }

    function isWinner(
        uint256 _gameId,
        address _player
    ) public view returns (bool winner) {
        require(
            _gameId >= 0 && _gameId < games.length,
            "validation failed: invalid game id"
        );
        Game storage g = games[_gameId];
        require(
            g.player1 == _player || g.player2 == _player,
            "validation failed: wrong room"
        );
        uint256 player = 1;
        if (g.player2 == _player) {
            player = 2;
        }

        if (_isWinner(_gameId, player) == true) return true;

        if (block.timestamp > g.deadline) {
            if (g.turn == _player) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    function getRoomInfo(
        uint256 _roomid
    )
        public
        view
        returns (address _payToken, uint256 _betAmount, uint256 _timelimit)
    {
        require(_roomid >= 0 && _roomid < rooms.length, "invalid room id");
        RoomInfo memory ri = rooms[_roomid];
        return (address(ri.payToken), ri.betAmount, ri.timelimit);
    }

    function getGame(
        uint256 _gameId
    )
        public
        view
        returns (
            address player1,
            string memory player1Name,
            address player2,
            string memory player2Name,
            address turn,
            uint256[3][3] memory board,
            uint256 deadline,
            bool isRunning,
            uint256 balance
        )
    {
        require(_gameId >= 0 && _gameId < games.length, "invalid game id");
        Game memory g = games[_gameId];
        return (
            g.player1,
            g.player1Name,
            g.player2,
            g.player2Name,
            g.turn,
            g.board,
            g.deadline,
            g.isRunning,
            g.balance
        );
    }

    function claimPrize(uint256 _gameId) external {
        require(
            _gameId >= 0 && _gameId < games.length,
            "validation failed: invalid game id"
        );
        Game storage g = games[_gameId];
        require(g.balance > 0, "prize already claimed");
        require(block.timestamp > g.deadline, "winner not declared yet");
        address from = msg.sender;
        address winner;
        if (g.turn == g.player1) {
            winner = g.player2;
        } else {
            winner = g.player1;
        }
        require(from == winner, "validation failed: you are not a winner");
        emit PrizeClaimed(_gameId, from);
        rooms[g.roomId].payToken.transferFrom(address(this), from, g.balance);
        IERC721(nft).safeMint(from, _gameId);
        g.balance = 0;
    }
}
