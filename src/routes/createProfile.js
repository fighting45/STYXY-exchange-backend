const UserProfile = require("../models/UserProfile");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, fullname, speciality, loginType } = req.body;

    const existingUser = await UserProfile.findOne({ email }).maxTimeMS(10000);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newUserProfile = new UserProfile({
      email,
      fullname,
      speciality,
      loginType,
    });

    await newUserProfile.save();
    console.log(" ✅ User profile saved");

    res.status(201).json({
      message: "Profile created successfully",
      userProfile: newUserProfile,
    });
  } catch (error) {
    console.log("Error creating profile:", error);
    res.status(500).json({ message: "Error creating profile", error });
  }
});

router.get("/:userID", async (req, res) => {
  console.log("GET /profiles/:userID route hit!!");
  try {
    const { userID } = req.params;
    const userProfile = await UserProfile.findOne({ userID })
      .maxTimeMS(10000)
      .lean()
      .exec();

    if (!userProfile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(200).json({
      message: "Profile retrieved successfully",
      userProfile: userProfile,
    });
  } catch (error) {
    console.err("Error retrieving profile", error);
    res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
});

router.put("/:userID", async (req, res) => {
  console.log("PUT /profiles/:userID route hit");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  const { userID } = req.params;
  const { email, fullname, speciality, loginType } = req.body;

  if (!email || !fullname || !speciality || !loginType) {
    console.log("Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userID },
      {
        email,
        fullname,
        speciality,
        loginType,
      },
      {
        new: true,
        runValidators: true,
        maxTimeMS: 10000,
      }
    ).exec();

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("User profile updated");

    res.status(200).json({
      message: "Profile updated successfully",
      updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
        error: "Duplicate email address",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

module.exports = router;
