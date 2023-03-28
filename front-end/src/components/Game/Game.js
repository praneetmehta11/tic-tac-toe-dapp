import "./Game.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeAccount, changeWalletStatus } from "../../actions/walletActions";
import { getGame, getUserActiveGame, getRoomInfo, getContract } from "../../services/CustomEthers.service";
import GameBoard from "../GameBoard/GameBoard";
import MetaMask from "../MetaMask/MetaMask";
import Home from "../Home/Home";

const Game = (props) => {
  const isConnected = useSelector((state) => state.wallet.isConnected);

  return (
    <div className="game-container">
      {!isConnected && <MetaMask></MetaMask>}
      {isConnected && <Home></Home>}
    </div>
  );
};

export default Game;
