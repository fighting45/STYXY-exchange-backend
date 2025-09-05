const express = require("express");
const mongoose = require("mongoose");
const createProfileRoute = require("./src/routes/createProfile");
const walletRoute = require("./src/routes/wallet");
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
