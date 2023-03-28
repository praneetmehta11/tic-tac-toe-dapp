import { ethers } from "ethers";
import TicTacToeGameAbis from "./../abis/TicTacToeGame.json";
import ERC20Abis from "./../abis/ERC20.json";
let provider = null;
let ticTacToeGameContract = null;

const CONTRACT_ADDRESS = "0x0367d269CB0A6d26B26B4768aAEE7130348CCEfb";

/**
 * we will get access to provider and contract in all the components without reinitialization
 */
export const initEthers = async () => {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  ticTacToeGameContract = new ethers.Contract(CONTRACT_ADDRESS, TicTacToeGameAbis, signer);
};

export const getProvider = () => provider;
export const getContract = () => ticTacToeGameContract;
export const getERC20Contract = (address) => {
  if (provider == null) return new Error("provider not initialized");
  return new ethers.Contract(address, ERC20Abis, provider);
};

export const getUserActiveGame = async (playerAddress) => {
  if (ticTacToeGameContract == null) return new Error("contract not initialized");
  return await ticTacToeGameContract.getUserActiveGame(playerAddress);
};
export const getGame = async (index) => {
  if (ticTacToeGameContract == null) return new Error("contract not initialized");
  return await ticTacToeGameContract.getGame(index);
};
export const getRoomInfo = async (index) => {
  if (ticTacToeGameContract == null) return new Error("contract not initialized");
  return await ticTacToeGameContract.getRoomInfo(index);
};
