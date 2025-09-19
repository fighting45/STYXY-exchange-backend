const { generateAccessToken } = require("../utils/jwtTokenUtils");
const { authenticateToken } = require("../auth/authMiddleware");
const UserProfile = require("../models/UserProfile");

const createProfile = async (req, res) => {
  try {
    const { email, fullname, speciality, loginType } = req.body;
    if (!email || !fullname || !speciality || !loginType) {
      return res.status(400).json({
        message: "All fields are required",
        required: ["email", "fullname", "speciality", "loginType"],
      });
    }

    const existingUser = await UserProfile.findOne({ email }).maxTimeMS(10000);
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const newUserProfile = new UserProfile({
      email,
      fullname,
      speciality,
      loginType,
    });

    await newUserProfile.save();
    console.log("✅ User profile created with ID:", newUserProfile.userID);
    const accessToken = generateAccessToken(req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: {
        userProfile: newUserProfile,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
  }
};

// GET Profile Controller
const getProfile = async (req, res) => {
  const { userID } = req.params;
  const bearer = req.headers.authorization?.split(" ");

  if (!bearer) {
    res.status(401).json({ message: "Access token is missing!" });
  }
  if (!userID) {
    return res.status(400).json({
      success: false,
      message: "UserID is required",
    });
  }
  const token = bearer[1];

  authenticateToken(token, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized Request" });
    }

    console.log("Fetching profile for userID:", userID);
    const userProfile = await UserProfile.findOne({ userID })
      .maxTimeMS(10000)
      .lean()
      .exec();

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        userProfile: userProfile,
      },
    });
  });
};

// Update Profile Controller
const updateProfile = async (req, res) => {
  try {
    const bearer = req.headers.authorization?.split(" ");
    if (!bearer) {
      res.status(401).json({ message: "Access token is missing!" });
    }
    const { userID } = req.params;
    const { email, fullname, speciality, loginType } = req.body;

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "UserID is required",
      });
    }

    if (!email || !fullname || !speciality || !loginType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        required: ["email", "fullname", "speciality", "loginType"],
      });
    }
    const token = bearer[1];
    authenticateToken(token, async (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized Request" });
      }
      console.log("Updating profile for userID:", userID);
      console.log("Update data:", { email, fullname, speciality, loginType });

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userID },
        {
          $set: {
            email,
            fullname,
            speciality,
            loginType,
          },
        },
        {
          new: true, // Return updated document
          runValidators: true, // Run schema validators
          maxTimeMS: 10000, // Set timeout
          lean: true, // Return plain object for better performance
        }
      ).exec();

      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      console.log("✅ User profile updated successfully");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          userProfile: updatedProfile,
        },
      });
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    // Handle duplicate key error
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        error: "Duplicate email address",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    // Handle cast errors (invalid ObjectId format)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "Invalid userID",
      });
    }

    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
};
