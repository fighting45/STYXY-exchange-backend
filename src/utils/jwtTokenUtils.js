const jwt = require("jsonwebtoken");
require("dotenv").config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(user, accessTokenSecret, { expiresIn: "15m" });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret);
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
