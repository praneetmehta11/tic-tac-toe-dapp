// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TicTacToeToken is ERC20 {
    constructor() ERC20("TicTacToe", "TTT") {
        _mint(msg.sender, 21000000 * 10 ** decimals());
    }
}
