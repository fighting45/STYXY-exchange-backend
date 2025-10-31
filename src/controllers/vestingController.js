const { getContract } = require("../utils/contractsUtils.js");
const {
  sanitizeBigInts,
  formatEtherAmount,
  parseEtherAmount,
} = require("../utils/typeSanitizeUtils.js");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const vesting = getContract(tokenVesting, provider);
