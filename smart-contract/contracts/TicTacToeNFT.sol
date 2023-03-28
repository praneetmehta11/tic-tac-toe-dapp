// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicTacTioNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    constructor() ERC721("TicTacTioNFT", "TTT-NFT") {}

    function safeMint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
        _setTokenURI(
            tokenId,
            "https://toppng.com/uploads/preview/winners-logo-winners-11563201425qcneaffa9o.png"
        );
    }

    // The following functions are overrides required by Solidity.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override onlyOwner {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(false, "not alloed to transfer NFT");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        require(false, "not alloed to transfer NFT");
    }
}
