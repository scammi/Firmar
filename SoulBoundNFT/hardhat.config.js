const { avalanche } = require('viem/chains');

require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

console.log(process.env.PRIVATE_KEY);
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 43114,
      // accounts: [process.env.PRIVATE_KEY],
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc',
        blockNumber: 49641610,
      },
    },
    c: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    // Your don't need an API key for Snowtrace
    apiKey: {
      avalanche: "avascan", // apiKey is not required, just set a placeholder
    },
  },
};
