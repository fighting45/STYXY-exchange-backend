const express = require("express");
const router = express.Router();
const governanceController = require("../controllers/governanceController");

router.get("/proposal", governanceController.getProposal);
router.get("/proposalsCount", governanceController.proposalsCount);
router.get("/state", governanceController.state);
router.get("/hasVoted", governanceController.hasVoted);
router.get("/votingPeriod", governanceController.votingPeriod);
router.get("/proposalThreshold", governanceController.proposalThreshold);
router.get("/quorumVotes", governanceController.quorumVotes);
router.post("/execute", governanceController.execute);
router.post("/castVote", governanceController.castVote);
router.post("/propose", governanceController.propose);

module.exports = router;
