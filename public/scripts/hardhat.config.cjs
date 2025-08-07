require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");

const { PrivateKey } = require("@hashgraph/sdk");


const ACCOUNT_ID = '0.0.3745354';

const PRIVATE_KEY = '302e020100300506032b657004220420d083dcf51d7c9d8e5a37225bf75133af0fff4a1156278a2d5de35855e1fc1c0d';

const { OPERATOR_ID, OPERATOR_KEY } = { ACCOUNT_ID, PRIVATE_KEY };

module.exports = {
  solidity: "0.8.19",
  networks: {
    hedera: { 
      url: "https://testnet.hashio.io/api",
      accounts: [OPERATOR_ID, OPERATOR_KEY],
      chainId: 296,
    },
  },
};