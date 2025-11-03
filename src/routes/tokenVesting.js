const express = require("express");
const router = express.Router();

const vestingController = require("../controllers/vestingController");

router.get("/token", vestingController.token);
router.get("/cliffDuration", vestingController.cliffDuration);
router.get("/startTime", vestingController.startTime);
router.get("/allocations", vestingController.allocations);
router.get("/released", vestingController.released);
router.get("/revoked", vestingController.revoked);
router.get("/beneficiaries", vestingController.beneficiaries);
router.get("/totalAllocated", vestingController.totalAllocated);
router.get("/paused", vestingController.paused);
router.get("/releasableAmount", vestingController.releasableAmount);
router.get("/getVestingInfo", vestingController.getVestingInfo);
router.get("/isCliffPassed", vestingController.isCliffPassed);
router.get("/getContractStatus", vestingController.getContractStatus);
router.get("/getBeneficiaries", vestingController.getBeneficiaries);
router.post("/setBeneficiaries", vestingController.setBeneficiaries);
router.post("/fund", vestingController.fund);
router.post("/pause", vestingController.pause);
router.post("/unpause", vestingController.unpause);
router.post("/revokeBeneficiary", vestingController.revokeBeneficiary);
router.post("/unrevokeBeneficiary", vestingController.unrevokeBeneficiary);
router.post("/release", vestingController.release);
module.exports = router;
