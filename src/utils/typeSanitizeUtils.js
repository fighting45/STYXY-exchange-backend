const { ethers } = require("ethers");
function sanitizeBigInts(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  // ethers.js BigNumber instance
  if (value && typeof value === "object" && value._isBigNumber) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeBigInts);
  }

  if (value && typeof value === "object") {
    const sanitized = {};
    for (const key in value) {
      sanitized[key] = sanitizeBigInts(value[key]);
    }
    return sanitized;
  }

  return value;
}
function parseEtherAmount(value) {
  return ethers.parseUnits(value, 18);
}

function formatEtherAmount(value) {
  return ethers.formatUnits(value, 18);
}
module.exports = { sanitizeBigInts, parseEtherAmount, formatEtherAmount };
