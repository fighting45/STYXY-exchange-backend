const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
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

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
