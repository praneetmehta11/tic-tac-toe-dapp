import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    local: {
      chainId: 31337,
      url: "http://127.0.0.1:8545/",
      accounts: ["0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
