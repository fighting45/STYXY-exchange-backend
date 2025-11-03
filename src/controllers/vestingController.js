const { getContract } = require("../utils/contractsUtils.js");
const { ethers } = require("ethers");
const {
  sanitizeBigInts,
  formatEtherAmount,
  parseEtherAmount,
} = require("../utils/typeSanitizeUtils.js");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const vesting = getContract("tokenVesting", provider);

const allocations = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the wallet address to check allocations!",
      });
    }
    const data = await vesting.allocations(walletAddress);
    res.status(200).json({
      success: true,
      data: formatEtherAmount(data),
    });
  } catch (err) {
    console.error("Couldnt get allocations with walletaddress provided");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const released = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the wallet address to check release status!",
      });
    }
    const data = await vesting.released(walletAddress);
    res.status(200).json({
      success: true,
      data: sanitizeBigInts(data),
    });
  } catch (err) {
    console.error("Couldnt get relased with walletaddress provided");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const revoked = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the wallet address to check revoked status!",
      });
    }
    const data = await vesting.revoked(walletAddress);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Couldnt get revoked with walletaddress provided");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const beneficiaries = async (req, res) => {
  try {
    const { index } = req.body;
    const data = await vesting.beneficiaries(index);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Couldnt get beneficiaries", err.message);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const totalAllocated = async (req, res) => {
  try {
    const data = await vesting.totalAllocated();
    res.status(200).json({
      success: true,
      data: sanitizeBigInts(data),
    });
  } catch (err) {
    console.error("Couldnt get totalAllocated");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const paused = async (req, res) => {
  try {
    const data = await vesting.paused();
    res.status(200).json({
      success: true,
      isPaused: data,
    });
  } catch (err) {
    console.error("Couldnt get paused status");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const releasableAmount = async (req, res) => {
  try {
    const { beneficiary } = req.body;
    if (!beneficiary) {
      return res.status(400).json({
        success: false,
        message:
          "Didnt provide the wallet address for beneficiary to check releaseable amount!",
      });
    }
    const data = await vesting.releasableAmount(beneficiary);
    res.status(200).json({
      success: true,
      data: sanitizeBigInts(data),
    });
  } catch (err) {
    console.error("Couldnt get releaseable amount for beneficiary!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getVestingInfo = async (req, res) => {
  try {
    const { beneficiary } = req.body;
    if (!beneficiary) {
      return res.status(400).json({
        success: false,
        message:
          "Didnt provide the wallet address for beneficiary to check vesting info!",
      });
    }
    const data = await vesting.getVestingInfo(beneficiary);
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to get vesting info!",
      });
    }
    res.status(200).json({
      success: true,
      data: {
        allocation: sanitizeBigInts(data[0]),
        releasedAmount: sanitizeBigInts(data[1]),
        releasable: sanitizeBigInts(data[2]),
        cliffEndTime: sanitizeBigInts(data[3]),
        isRevoked: data[4],
      },
    });
  } catch (err) {
    console.error("Couldnt get vesting info for beneficiary!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const isCliffPassed = async (req, res) => {
  try {
    const data = await vesting.isCliffPassed();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Couldnt get isCliffpassed!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getContractStatus = async (req, res) => {
  try {
    const data = await vesting.getContractStatus();
    res.status(200).json({
      success: true,
      data: {
        isPaused: data[0],
        isConfigured: data[1],
        currentBalance: sanitizeBigInts(data[2]),
        totalAllocation: sanitizeBigInts(data[3]),
      },
    });
  } catch (err) {
    console.error("Couldnt get contract status!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getBeneficiaries = async (req, res) => {
  try {
    const data = await vesting.getBeneficiaries();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Couldnt get beneficiaries!");
    return res.status(500).json({
      message: err.message,
    });
  }
};
const cliffDuration = async (req, res) => {
  try {
    const data = await vesting.cliffDuration();
    res.status(200).json({
      success: true,
      data: sanitizeBigInts(data),
    });
  } catch (err) {
    console.error("Couldnt get cliff duration!");
    return res.status(500).json({
      message: err.message,
    });
  }
};
const startTime = async (req, res) => {
  try {
    const data = await vesting.startTime();
    res.status(200).json({
      success: true,
      data: sanitizeBigInts(data),
    });
  } catch (err) {
    console.error("Couldnt get start time!");
    return res.status(500).json({
      message: err.message,
    });
  }
};
const token = async (req, res) => {
  try {
    const data = await vesting.token();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Couldnt get token!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

//Post APIs

const setBeneficiaries = async (req, res) => {
  try {
    const { beneficiaries, allocations } = req.body;
    if (!beneficiaries || !allocations) {
      return res.status(400).json({
        success: false,
        message:
          "Didnt provide the addresses for beneficiaries and their allocations!",
      });
    }
    const txData = await vesting.setBeneficiaries.populateTransaction(
      beneficiaries,
      allocations
    );
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to set beneficiaries and allocations!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt set beneficiaries and their allocations");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const fund = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the amount to fund for total allocations!",
      });
    }
    const txData = await vesting.fund.populateTransaction(amount);
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to set beneficiaries and allocations!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt fund the allocations");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const pause = async (req, res) => {
  try {
    const txData = await vesting.pause.populateTransaction();
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to set beneficiaries and allocations!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt pause!");
    return res.status(500).json({
      message: err.message,
    });
  }
};
const unpause = async (req, res) => {
  try {
    const txData = await vesting.unpause.populateTransaction();
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to set beneficiaries and allocations!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt unpause!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const revokeBeneficiary = async (req, res) => {
  try {
    const { beneficiary } = req.body;
    if (!beneficiary) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the wallet address for beneficiary!",
      });
    }
    const txData = await vesting.revokeBeneficiary.populateTransaction(
      beneficiary
    );
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to revoke beneficiaries!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt revoke beneficiary!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const unrevokeBeneficiary = async (req, res) => {
  try {
    const { beneficiary } = req.body;
    if (!beneficiary) {
      return res.status(400).json({
        success: false,
        message:
          "Didnt provide the wallet address for beneficiary to unrevoke!",
      });
    }
    const txData = await vesting.unrevokeBeneficiary.populateTransaction(
      beneficiary
    );
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to unrevoke beneficiaries!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt unrevoke beneficiary!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

const release = async (req, res) => {
  try {
    const { beneficiary } = req.body;
    if (!beneficiary) {
      return res.status(400).json({
        success: false,
        message: "Didnt provide the wallet address for beneficiary to release!",
      });
    }
    const txData = await vesting.release.populateTransaction(beneficiary);
    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Couldnt get the txData to release beneficiary!",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt release beneficiary!");
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getBeneficiaries,
  getContractStatus,
  getVestingInfo,
  isCliffPassed,
  releasableAmount,
  release,
  unrevokeBeneficiary,
  unpause,
  revokeBeneficiary,
  pause,
  fund,
  setBeneficiaries,
  paused,
  revoked,
  allocations,
  beneficiaries,
  totalAllocated,
  released,
  cliffDuration,
  startTime,
  token,
};
