const UserProfile = require("../models/UserProfile");
// const {authenticateToken} = require("../auth/authMiddleware");
const profileController = require("../controllers/profileController");

const express = require("express");
const router = express.Router();

router.post("/", profileController.createProfile);

router.get("/:userID", profileController.getProfile);

router.put("/:userID", profileController.updateProfile);

module.exports = router;
