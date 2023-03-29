import "./GameBoard.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { getContract, getGame } from "../../services/CustomEthers.service";

const Player = ({ name, active = false, symbol }) => {
  return (
    <div className={`player ${active ? "active" : ""}`}>
      {name} ({symbol})
    </div>
  );
};

const GameBoard = ({ gameId }) => {
  const primaryPlayer = useSelector((state) => state.wallet.walletAddress);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [winner, setWinner] = useState("");
  const [gameBoard, setGameBoard] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [turn, setTurn] = useState("");
  const updateBoard = async () => {
    const game = await getGame(gameId);
    setPlayer1(game.player1);
    setPlayer2(game.player2);
    setPlayer1Name(game.player1Name);
    setPlayer2Name(game.player2Name);
    setTurn(game.turn);
    setGameBoard(game.board.map((val) => val.map((val) => parseInt(val))));
  };
  useEffect(() => {
    (async () => {
      await updateBoard();
    })();
  }, [gameId, primaryPlayer]);

  useEffect(() => {
    getContract().on("Move", async (id, playedBy, row, col) => {
      console.log("::move event::", id, gameId);
      if (parseInt(id) !== gameId) return;
      await updateBoard();
    });

    getContract().on("WinnerDeclared", (id, winner) => {
      if (parseInt(id) !== gameId) return;
      let winnerName = winner.toLowerCase() === player1.toLowerCase() ? player1Name : player2Name;
      setWinner(winnerName);
    });

    getContract().on('GameDraw', (id)=>{
      if(parseInt(id) !== gameId) return;
      alert('The game ended in a draw!!! Reload the page to play again');
    })
  });

  async function handleTurn(row, col) {
    if (turn.toLowerCase() !== primaryPlayer.toLowerCase() || gameBoard[row][col] !== 0) return;
    let moveTx = await getContract().play(gameId, row, col);
    console.log("moveTx::", moveTx);
  }

  function renderTicTacToeBoard(gameBoard) {
    return gameBoard.map((row, i) => {
      return (
        <div key={i} className="row">
          {row.map((col, j) => {
            return (
              <div
                key={j + i}
                className="col"
                onClick={() => {
                  handleTurn(i, j);
                }}
              >
                {col === 0 && ""}
                {col === 1 && "X"}
                {col === 2 && "0"}
              </div>
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className="game_board_wrapper">
      <div className="tic_tac_toe">
        <h1 className="text_center">{turn.toLowerCase() === primaryPlayer.toLowerCase() && `Your turn`}</h1>

        <div className="play_arena">
          <div>
            <Player name={player1Name} symbol="X" active={turn === player1} />
          </div>
          <div className="board">{renderTicTacToeBoard(gameBoard)}</div>
          <div>
            <Player name={player2Name} symbol="0" active={turn === player2} />
          </div>
        </div>
        <h1>{winner && `Game Over !!! Winner is ${winner}`}</h1>
        <h2>{winner && "Reload the page to play again"}</h2>
      </div>
    </div>
  );
};

export default GameBoard;
