const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const walletSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      default: () => uuidv4(),
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletPrivateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletID: {
      type: String,
      unique: true,
      index: true,
    },
    images: {
      image1: {
        type: String, // Base64 encoded image or URL
        required: true,
      },
      image2: {
        type: String,
        required: true,
      },
      image3: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    network: {
      type: String,
      enum: ["ethereum", "polygon", "bsc", "arbitrum", "solana"],
      default: "solana",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index
walletSchema.index({ userID: 1, walletAddress: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
