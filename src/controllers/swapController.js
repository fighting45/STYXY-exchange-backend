const Transaction = require("../models/transactions");
const Wallet = require("../models/wallet");
const { swap } = require("../services/jupiterSwap");
const { getPrivateKey } = require("../utils/vaultUtils");
const { decryptPrivateKey } = require("../utils/privateKeyUtils");
const { authenticateToken } = require("../auth/authMiddleware");

const solanaSwap = async (req, res) => {
  const { inputMint, outputMint, amount, action, network, walletAddress } =
    req.body;
  const walletInstance = await Wallet.findOne({ walletAddress });
  const userID = walletInstance.userID;
  const { iv, private_key } = await getPrivateKey(userID);

  const privateKey = decryptPrivateKey(iv, private_key);

  const result = await swap(outputMint, inputMint, amount, privateKey);

  if (!result) {
    return res.status(400).json({
      message: "Swap failed",
      success: false,
    });
  }

  res.status(200).json({
    message: "Swap executed successfully",
    success: true,
    result: result,
  });
  const newTransaction = new Transaction({
    walletAddress: walletAddress,
    signature: result,
    mintAddress: outputMint,
    action: action,
    network: network,
  });
  await newTransaction.save();
};

//GET ALL TXS CONTROLLER
const fetchAllTransactions = async (req, res) => {
  const bearer = req.headers.authorization?.split(" ");
  if (!bearer) {
    res.status(401).json({ message: "Access token is missing!" });
  }

  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: "walletAddress is required",
    });
  }
  const token = bearer[1];
  authenticateToken(token, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized Request" });
    }
    const all = await Transaction.find({ walletAddress }).maxTimeMS(100000);
    if (!all) {
      return res.status(400).json({
        message: "Couldnt fetched",
        success: false,
      });
    }
    res.status(200).json({
      message: "Fetch Completed",
      success: true,
      data: all,
    });
  });
};

module.exports = { solanaSwap, fetchAllTransactions };
