const { decryptPrivateKey } = require("../services/privateKeyServices");
const { getPrivateKey } = require("../services/vaultService");
const walletServices = require("../services/walletServices");

const createWallet = async (req, res) => {
  try {
    // Validate uploaded images
    if (
      !req.files ||
      !req.files.image1 ||
      !req.files.image2 ||
      !req.files.image3
    ) {
      return res.status(400).json({ message: "All three images are required" });
    }
    //validate Network
    const network = req.body.network.toLowerCase();
    if (network !== "solana" && network !== "ethereum") {
      return res.status(400).json({
        message: "Please provide the wallet network 'ethereum' or 'solana",
      });
    }
    // Extract image buffers
    const imageBuffers = [
      req.files.image1[0].buffer,
      req.files.image2[0].buffer,
      req.files.image3[0].buffer,
    ];

    const { newWallet, privateKey } = await walletServices.createWalletInDB(
      imageBuffers,
      network
    );
    if (!newWallet || !privateKey) console.log("No wallet created");
    res.status(201).json({
      message: "Wallet created successfully",
      wallet: {
        walletAddress: newWallet.walletAddress,
        userID: newWallet.userID,
        network: newWallet.network,
        createdAt: newWallet.createdAt,
        walletPrivateKey: privateKey, // Return private key for user to store securely
      },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({
      message: "Error creating wallet",
      error: error.message,
    });
  }
};

// Get Wallet Controller
const getWallet = async (req, res) => {
  try {
    const { userID } = req.params;

    if (!userID) return res.status(400).json({ message: "userID is required" });

    const wallet = await walletServices.getWalletByUserID(userID);

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const encryptedData = await getPrivateKey(userID);
    if (!encryptedData) {
      return res
        .status(404)
        .json({ message: "Private key not found in the vault" });
    }
    const iv = encryptedData.iv;
    const encryptedPrivateKey = encryptedData.private_key;
    const privateKey = decryptPrivateKey(iv, encryptedPrivateKey);

    res.status(200).json({
      message: "Wallet retrieved successfully",
      wallet: wallet,
      private_key: privateKey,
    });
  } catch (error) {
    console.error("Error retrieving wallet:", error);
    res.status(500).json({
      message: "Error retrieving wallet",
      error: error.message,
    });
  }
};

module.exports = {
  createWallet,
  getWallet,
};
