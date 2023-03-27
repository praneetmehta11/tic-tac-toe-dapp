import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// TODO:- add test cases
describe("TicTacToe", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const TicTacToe = await ethers.getContractFactory("TicTacToe");
    const [owner, otherAccount] = await ethers.getSigners();
    const ticTacToe = await TicTacToe.deploy();
    ticTacToe.addRoomType(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ethers.utils.parseEther("10000"),
      ethers.utils.parseEther("100000")
    );
    return { ticTacToe, owner, otherAccount };
  }

  describe("Deployment", function () {});
});
