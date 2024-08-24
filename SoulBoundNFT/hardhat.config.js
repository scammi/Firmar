require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 43114,
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc',
        blockNumber: 49641610,
      }
    },
    c: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114
    }
  }
};
