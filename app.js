const express = require("express");
const mongoose = require("mongoose");
const createProfileRoute = require("./src/routes/createProfile");
const walletRoute = require("./src/routes/wallet");
const swapRoute = require("./src/routes/swap");
const stakingRoute = require("./src/routes/staking");
const governanceRoute = require("./src/routes/governance");
const vestingRoute = require("./src/routes/tokenVesting");
require("dotenv").config();

const app = express();
app.use(express.json());

const mongoURI = process.env.DB_URI;
mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    heartbeatFrequencyMS: 10000,
  })
  .then(() => console.log("Connected to MongoDB atlas"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

app.use("/profiles", createProfileRoute);
app.use("/wallet", walletRoute);
app.use("/swap", swapRoute);
app.use("/staking", stakingRoute);
app.use("/governance", governanceRoute);
app.use("/vesting", vestingRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
