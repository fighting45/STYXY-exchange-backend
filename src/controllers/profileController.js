const UserProfile = require("../models/UserProfile");

const createProfile = async (req, res) => {
  try {
    const { email, fullname, speciality, loginType } = req.body;

    // Validate required fields
    if (!email || !fullname || !speciality || !loginType) {
      return res.status(400).json({
        message: "All fields are required",
        required: ["email", "fullname", "speciality", "loginType"],
      });
    }

    // Check if user already exists
    const existingUser = await UserProfile.findOne({ email }).maxTimeMS(10000);
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Create new user profile
    const newUserProfile = new UserProfile({
      email,
      fullname,
      speciality,
      loginType,
    });

    await newUserProfile.save();
    console.log("✅ User profile created with ID:", newUserProfile.userID);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: {
        userProfile: newUserProfile,
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
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

    res.status(500).json({
      success: false,
      message: "Error creating profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get Profile Controller
const getProfile = async (req, res) => {
  try {
    const { userID } = req.params;

    // Validate userID
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "UserID is required",
      });
    }

    console.log("Fetching profile for userID:", userID);

    // Find user profile
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
  } catch (error) {
    console.error("Error retrieving profile:", error);

    res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Update Profile Controller
const updateProfile = async (req, res) => {
  try {
    const { userID } = req.params;
    const { email, fullname, speciality, loginType } = req.body;

    // Validate userID
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "UserID is required",
      });
    }

    // Validate required fields
    if (!email || !fullname || !speciality || !loginType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        required: ["email", "fullname", "speciality", "loginType"],
      });
    }

    console.log("Updating profile for userID:", userID);
    console.log("Update data:", { email, fullname, speciality, loginType });

    // Update user profile
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

    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Delete Profile Controller (bonus)
const deleteProfile = async (req, res) => {
  try {
    const { userID } = req.params;

    // Validate userID
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "UserID is required",
      });
    }

    console.log("Deleting profile for userID:", userID);

    // Delete user profile
    const deletedProfile = await UserProfile.findOneAndDelete({ userID })
      .maxTimeMS(10000)
      .lean()
      .exec();

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    console.log("✅ User profile deleted successfully");

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: {
        deletedProfile: {
          userID: deletedProfile.userID,
          email: deletedProfile.email,
          fullname: deletedProfile.fullname,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting profile:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get All Profiles Controller (admin function)
const getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching all profiles - Page:", page, "Limit:", limit);

    // Get total count
    const total = await UserProfile.countDocuments();

    // Get profiles with pagination
    const profiles = await UserProfile.find()
      .select("-__v") // Exclude version field
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data: {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving all profiles:", error);

    res.status(500).json({
      success: false,
      message: "Error retrieving profiles",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
};
