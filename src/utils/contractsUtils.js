const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// load addresses map once
const addressesPath = path.join(
  __dirname,
  "..",
  "config",
  "addresses",
  "addresses.json"
);
const ADDRESSES = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

// helper to load ABI file
function loadAbi(contractName) {
  const abiPath = path.join(
    __dirname,
    "..",
    "config",
    "abis",
    `${contractName}.json`
  );
  if (!fs.existsSync(abiPath))
    throw new Error(`ABI not found for ${contractName} at ${abiPath}`);
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return artifact.abi || artifact;
}

function getContract(contractName, providerOrSigner, network = "sepolia") {
  const networkMap = ADDRESSES[network];
  if (!networkMap)
    throw new Error(`No addresses found for network: ${network}`);
  const address = networkMap[contractName];
  if (!address)
    throw new Error(`No address found for ${contractName} on ${network}`);
  const abi = loadAbi(contractName);
  return new ethers.Contract(address, abi, providerOrSigner);
}

module.exports = { getContract };
