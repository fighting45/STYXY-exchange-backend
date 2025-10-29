const express = require("express");
const router = express.Router();
const stakingController = require("../controllers/stakingController");

router.get("/rewardPool", stakingController.getRewardPoolBalance);
router.get("/stakeInfo", stakingController.getUserStakeInfo);
router.get("/rewardRate", stakingController.getRewardRate);
router.get("/lockupPeriod", stakingController.getLockupPeriod);
router.get("/totalStaked", stakingController.getTotalStaked);
router.post("/stake", stakingController.stake);
router.post("/unstake", stakingController.unstake);
router.post("/claimReward", stakingController.claimRewards);
router.post("/updateAPR", stakingController.updateAPR);
router.post("/addRewards", stakingController.addRewards);
router.post("/lockupPeriod", stakingController.setLockupPeriod);
router.post("/emergencyWithdraw", stakingController.emergencyWithdraw);

module.exports = router;
