const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    signature: {
      type: String,
      required: true,
      unique: true,
    },
    //baseToken address
    mintAddress: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      emum: ["buy", "sell"],
    },
    network: {
      type: String,
      enum: ["ethereum", "solana"],
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transactions", transactionSchema);

module.exports = Transaction;
