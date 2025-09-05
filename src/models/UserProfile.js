const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const userProfileSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },
    loginType: {
      type: String,
      enum: ["socials", "web3_Wallet"],
      required: true,
    },
    userID: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
userProfileSchema.index({ userID: 1, email: 1 });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
