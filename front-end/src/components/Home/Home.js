import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getContract, getERC20Contract, getGame, getRoomInfo, getUserActiveGame } from "../../services/CustomEthers.service";
import GameBoard from "../GameBoard/GameBoard";
import "./Home.css";

const Home = (props) => {
  const address = useSelector((state) => state.wallet.walletAddress);
  const [gameId, setGameId] = useState(0);
  const [claimPrize, setClaimPrize] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
    betToken: "",
    tokenName: "",
    tokenSymbol: "",
    betAmount: 0,
    timeLimit: 0,
  });
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    (async () => {
      if (address) {
        const roomInfo = await getRoomInfo(0);
        const token = await getERC20Contract(roomInfo._payToken);
        const decimal = parseInt(await token.decimals());
        setRoomInfo({
          betToken: roomInfo._payToken,
          tokenName: await token.name(),
          tokenSymbol: await token.symbol(),
          betAmount: ethers.utils.formatUnits(roomInfo._betAmount, decimal),
          timeLimit: parseInt(roomInfo._timelimit),
        });
        const gameId = parseInt(await getUserActiveGame(address)) - 1;
        setGameId(gameId);
        if (gameId >= 0) {
          const game = await getGame(gameId);
          if (parseInt(game.balance) === 0) {
            setHasActiveGame(true);
            return;
          }
          if (game.turn !== "0x0000000000000000000000000000000000000000") setWaitingForPlayer(false);
          let currTime = Math.abs(Date.now() / 1000);
          if (game.turn !== "0x0000000000000000000000000000000000000000" && game.turn !== address && currTime > game.deadline && parseInt(game.balance)) {
            setClaimPrize(true);
          } else {
            setHasActiveGame(true);
          }
        }
      }
    })();
  }, [address]);

  useEffect(() => {
    getContract().on("GameStarted", async (id, player1, player2, turn) => {
      const gameId = parseInt(await getUserActiveGame(address)) - 1;
      console.log("event::GameStarted", parseInt(id), gameId);
      if (parseInt(id) !== gameId) return;
      setGameId(gameId);
      setWaitingForPlayer(false);
      setHasActiveGame(true);
    });
    getContract().on("GameCreated", async (id, creator) => {
      const gameId = parseInt(await getUserActiveGame(address)) - 1;
      console.log("event::GameCreated", parseInt(id), creator, gameId);
      if (parseInt(id) !== gameId) return;
      setWaitingForPlayer(true);
      setHasActiveGame(true);
    });
  });

  const claimPrizeHandler = async () => {
    let tx = await getContract().claimPrize(gameId);
    console.log("claimPrize::tx", tx);
  };

  const joinGame = async () => {
    const name = prompt("Enter username");
    let tx = await getContract().joinGame(0, name);
    const receipt = await tx.wait();
    console.log("joinGame::", tx, receipt);
  };
  function renderRoomInfo() {
    return (
      <div>
        <div>
          <table>
            <tbody>
            <tr>
              <td>Token name:</td>
              <td>{roomInfo.tokenName}</td>
            </tr>
            <tr>
              <td>Token symbol:</td>
              <td>{roomInfo.tokenSymbol}</td>
            </tr>
            <tr>
              <td>Bet amount:</td>
              <td>{roomInfo.betAmount}</td>
            </tr>
            <tr>
              <td>time limit:</td>
              <td>{roomInfo.timeLimit} Seconds</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  function renderJoinGame() {
    return (
      <div className="join-game">
        <button className="connect-button" onClick={joinGame}>
          Join Game
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="game-title">
        <h1>Tic Tac Toe</h1>
        {address !== "" && <h5 className="address">Connected {address}</h5>}
      </div>
      <div className="game-container">
        {claimPrize && (
          <button className="connect-button" onClick={claimPrizeHandler}>
            Claim prize
          </button>
        )}
        {roomInfo.betToken !== "" && renderRoomInfo()}
        {!hasActiveGame && !claimPrize && roomInfo.betToken !== "" && renderJoinGame()}
        {hasActiveGame && waitingForPlayer === false && <GameBoard gameId={gameId}></GameBoard>}
        {hasActiveGame && waitingForPlayer === true && (
          <div>
            <h1>Waiting for other player</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
