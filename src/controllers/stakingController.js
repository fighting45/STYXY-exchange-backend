const { getContract } = require("../utils/contractsUtils.js");
const {
  sanitizeBigInts,
  formatEtherAmount,
  parseEtherAmount,
} = require("../utils/typeSanitizeUtils.js");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const staking = getContract("Staking", provider);
const token = getContract("MyToken", provider);

const getUserStakeInfo = async (req, res) => {
  let user;
  try {
    const { userAddress } = req.body;
    user = userAddress;
    const userStakeInfo = await staking.getStakeInfo(userAddress);

    if (
      Array.isArray(userStakeInfo) &&
      userStakeInfo.length > 0 &&
      userStakeInfo.every((v) => String(v) === "0")
    ) {
      return res.status(400).json({
        message: "StakeInfo fetch failed or wallet doesnt exist",
        success: false,
      });
    }
    const sanitizedResult = sanitizeBigInts(userStakeInfo);
    res.status(200).json({
      message: "StakeInfo fetched successfully",
      success: true,
      user: userAddress,
      result: sanitizedResult,
    });
  } catch (err) {
    console.error(`Couldnt fetch stake info for ${user}`, err);
  }
};

const getRewardRate = async (req, res) => {
  try {
    const currentAPR = (await staking.getAPR()) + "%"; //in %
    if (!currentAPR) {
      return res.status(400).json({
        message: "current staking APR fetch failed",
        success: false,
      });
    }
    res.status(200).json({
      message: "Current staking APR fetched successfully",
      success: true,
      result: currentAPR,
    });
  } catch (err) {
    console.error("Failed to get current Reward rate", err);
  }
};

const getLockupPeriod = async (req, res) => {
  try {
    const lockupPeriod = await staking.lockupPeriod();

    if (!lockupPeriod) {
      return res.status(400).json({
        message: "lockup Period fetch failed",
        success: false,
      });
    }
    res.status(200).json({
      message: "lockup period fetched successfully",
      success: true,
      result: lockupPeriod.toString(), //returns in seconds
    });
  } catch (err) {
    console.error("Failed to get lockup period", err);
  }
};

const getTotalStaked = async (req, res) => {
  try {
    const totalStaked = await staking.totalStaked();
    console.log(totalStaked);
    if (!totalStaked) {
      return res.status(400).json({
        message: "total Staked fetch failed or is 0",
        success: false,
      });
    }
    res.status(200).json({
      message: "total staked fetched successfully",
      success: true,
      result: ethers.formatUnits(totalStaked, 18),
    });
  } catch (err) {
    console.error("Failed to get total staked", err);
  }
};

const getRewardPoolBalance = async (req, res) => {
  try {
    const rewardPool = await staking.rewardPool();
    console.log("This is reward pool", rewardPool);
    if (!rewardPool) {
      return res.status(400).json({
        message: "Couldnt fetch reward pool or pool === 0",
        success: false,
      });
    }
    res.status(200).json({
      message: "reward pool fetched successfully",
      success: true,
      result: formatEtherAmount(rewardPool, 18),
    });
  } catch (err) {
    console.error("Failed to get reward pool"), err;
  }
};

const stake = async (req, res) => {
  let user, stakingAmount;
  try {
    const { amount, userAddress } = req.body;
    if (!userAddress || !amount) {
      return res.status(400).json({ error: "Missing userAddress or amount" });
    }
    user = userAddress;
    stakingAmount = amount;

    const balance = await token.balanceOf(userAddress);

    if (balance < parseEtherAmount(amount)) {
      return res.status(400).json({ error: "Insufficient token balance" });
    }
    const txData = await staking.stake.populateTransaction(
      parseEtherAmount(amount)
    );
    res.status(200).json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error(`Error staking ${stakingAmount} for ${user}`, err);
  }
};

const unstake = async (req, res) => {
  try {
    const { amount, userAddress } = req.body;
    if (!userAddress || !amount) {
      return res.status(400).json({ error: "Missing userAddress or amount" });
    }
    const userStakeInfo = await staking.stakes(userAddress);
    if (!userStakeInfo) {
      return res.status(400).json({
        message: "StakeInfo fetch failed or wallet doesnt exist",
        success: false,
      });
    }
    const unstakeAmount = ethers.parseUnits(amount.toString(), 18);
    if (userStakeInfo.amount < unstakeAmount) {
      return res.status(400).json({ error: "Insufficient funds to unstake" });
    }
    const txData = await staking.unstake.populateTransaction(unstakeAmount);
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error(
      `Error while unstaking ${amount} for user address: ${userAddress}`,
      err
    );
  }
};

const claimRewards = async (req, res) => {
  try {
    const { userAddress } = req.body;
    if (!userAddress) {
      res.status(400).json({ error: "Missing userAddress" });
    }
    const userStakeInfo = await staking.getStakeInfo(userAddress);
    if (!userStakeInfo) {
      return res.status(400).json({
        message: "StakeInfo fetch failed or wallet doesnt exist",
        success: false,
      });
    }
    if (userStakeInfo.pendingRewards === 0) {
      return res.status(400).json({ error: "No rewards to claim" });
    }
    const txData = await staking.claimRewards.populateTransaction();
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error("Error claiming rewards", err);
  }
};

//Only Owner modifier functions
const updateAPR = async (req, res) => {
  try {
    const { newAPR, userAddress } = req.body;
    if (!newAPR || !userAddress) {
      return res.status(400).json({ error: "Missing userAddress or newAPR" });
    }
    const owner = await staking.owner();
    if (userAddress !== owner) {
      return res
        .status(400)
        .json({ error: `Only the owner: ${owner} can call this function` });
    }
    const txData = await staking.updateAPR.populateTransaction(newAPR * 100); // % to basis points conversion
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error("Error updating APR", err);
  }
};

const addRewards = async (req, res) => {
  try {
    const { amount, userAddress } = req.body;
    if (!amount || !userAddress) {
      return res.status(400).json({ error: "Missing userAddress or amount" });
    }
    const owner = await staking.owner();
    if (userAddress !== owner) {
      return res
        .status(400)
        .json({ error: `Only the owner: ${owner} can call this function` });
    }
    const txData = await staking.addRewards.populateTransaction(
      ethers.parseUnits(amount.toString(), 18)
    );
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (error) {
    console.error("Error while adding rewards to rewards pool");
  }
};

const setLockupPeriod = async (req, res) => {
  try {
    const { newLockupPeriod, userAddress } = req.body;
    if (!newLockupPeriod || !userAddress) {
      return res
        .status(400)
        .json({ error: "Missing userAddress or newLockupPeriod" });
    }
    const owner = await staking.owner();
    if (userAddress !== owner) {
      return res
        .status(400)
        .json({ error: `Only the owner: ${owner} can call this function` });
    }
    const txData = await staking.setLockupPeriod.populateTransaction(
      newLockupPeriod * 86400 //days to seconds
    );
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error("Error setting new lockup period", err);
  }
};

const emergencyWithdraw = async (req, res) => {
  try {
    const { tokenAddress, amount, userAddress } = req.body;
    if (!tokenAddress || !amount || !userAddress) {
      return res.status(400).json({
        error: "Missing tokenAddress or withdrawAmount or userAddress",
      });
    }
    const owner = await staking.owner();
    if (userAddress !== owner) {
      return res
        .status(400)
        .json({ error: `Only the owner: ${owner} can call this function` });
    }
    const txData = await staking.emergencyWithdraw.populateTransaction(
      tokenAddress,
      ethers.parseUnits(amount.toString(), 18)
    );
    res.json({
      to: staking.target, // address of contract
      data: txData.data,
      value: "0x0",
    });
  } catch (err) {
    console.error("Error while emergency withdrawing", err);
  }
};

module.exports = {
  getUserStakeInfo,
  getRewardRate,
  getLockupPeriod,
  getTotalStaked,
  stake,
  unstake,
  claimRewards,
  updateAPR,
  addRewards,
  setLockupPeriod,
  emergencyWithdraw,
  getRewardPoolBalance,
};
