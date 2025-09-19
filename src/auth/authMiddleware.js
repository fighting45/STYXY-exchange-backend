const { verifyAccessToken } = require("../utils/jwtTokenUtils");

const authenticateToken = (token, callback) => {
  try {
    const user = verifyAccessToken(token);
    callback(null, user); // No error, pass the user to the callback
  } catch (err) {
    callback(err, null); // Pass the error if token is invalid
  }
};

module.exports = { authenticateToken };
