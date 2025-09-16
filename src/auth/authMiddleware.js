const { verifyAccessToken } = require("../services/tokenServices");

const authenticateToken = (token) => {
  verifyAccessToken(token, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Access Token" });
    }

    return res.json(201).json({
      message: "user retrieved successfully",
      data: {
        userProfile: user,
      },
    });
  });
};

module.exports = { authenticateToken };
