const express = require("express");
const router = express.Router();
const {
  solanaSwap,
  fetchAllTransactions,
} = require("../controllers/swapController");

router.post("/", solanaSwap);

// router.get("/transaction", );
router.get("/:walletAddress", fetchAllTransactions);

module.exports = router;
