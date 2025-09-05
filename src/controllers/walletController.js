const crypto = require("crypto");
const nacl = require("tweetnacl");
const { Keypair } = require("@solana/web3.js");
const Wallet = require("../models/wallet");
const UserProfile = require("../models/UserProfile");

// Hash an image's bytes using SHA-256 (32 bytes)
function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest();
}

// Take exactly 3 image byte-buffers, SHA-256 each, and concat (96 bytes)
function concatImageHashes(imagesBuffers) {
  if (imagesBuffers.length !== 3) throw new Error("Provide exactly 3 images");
  const hashes = imagesBuffers.map(sha256);
  return Buffer.concat(hashes);
}

// Derive a 32-byte seed via HKDF-SHA256, ensuring output is a Buffer of length 32
function deriveSeedHKDF(
  ikmBuffer,
  { salt, info = "solana-image-seed", length = 32 } = {}
) {
  if (!salt) {
    salt = crypto.randomBytes(16);
  }

  let derived = crypto.hkdfSync
    ? crypto.hkdfSync("sha256", ikmBuffer, salt, Buffer.from(info), length)
    : crypto.pbkdf2Sync(ikmBuffer, salt, 100_000, length, "sha256");

  // Normalize: convert ArrayBuffer or TypedArray -> Buffer
  if (derived instanceof ArrayBuffer) {
    derived = Buffer.from(derived);
  } else if (ArrayBuffer.isView(derived)) {
    derived = Buffer.from(
      derived.buffer,
      derived.byteOffset,
      derived.byteLength
    );
  } else if (!Buffer.isBuffer(derived)) {
    derived = Buffer.from(derived);
  }

  if (derived.length !== length) {
    throw new Error(
      `KDF output length mismatch: got ${derived.length}, expected ${length}`
    );
  }

  return derived;
}

// Build a Solana Keypair from a 32-byte seed
function keypairFromEd25519Seed(seed32) {
  if (seed32.length !== 32) throw new Error("seed must be 32 bytes");

  const kp = nacl.sign.keyPair.fromSeed(seed32);
  const secretKey = Buffer.from(kp.secretKey); // 64 bytes
  return Keypair.fromSecretKey(secretKey);
}
function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

const generateUUID = () => {
  return uuidv4();
};

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

    // Extract image buffers
    const imageBuffers = [
      req.files.image1[0].buffer,
      req.files.image2[0].buffer,
      req.files.image3[0].buffer,
    ];

    // Generate wallet using your existing logic
    const ikm = concatImageHashes(imageBuffers);
    const saltUuid = generateUUID();
    const salt = Buffer.from(`solana-salt-${saltUuid}`);
    const seed = deriveSeedHKDF(ikm, {
      salt,
      info: "myapp-v1-image-seed",
      length: 32,
    });

    console.log("Derived seed:", seed.toString("hex"));
    console.log("Type:", seed.constructor.name, "Length:", seed.length);

    const kp = keypairFromEd25519Seed(seed);
    const walletAddress = kp.publicKey.toBase58();

    console.log("Generated Solana PublicKey:", walletAddress);

    // Convert images to base64 for storage
    const images = {
      image1: bufferToBase64(imageBuffers[0]),
      image2: bufferToBase64(imageBuffers[1]),
      image3: bufferToBase64(imageBuffers[2]),
    };

    // Create new wallet
    const newWallet = new Wallet({
      userID,
      walletAddress,
      images,
      network: "solana",
    });

    await newWallet.save();
    console.log("✅ Solana wallet created successfully");

    res.status(201).json({
      message: "Wallet created successfully",
      wallet: {
        walletID: newWallet.walletID,
        walletAddress: newWallet.walletAddress,
        userID: newWallet.userID,
        network: newWallet.network,
        isActive: newWallet.isActive,
        createdAt: newWallet.createdAt,
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

    if (!userID) {
      return res.status(400).json({ message: "userID is required" });
    }

    console.log("Fetching wallet for userID:", userID);

    // Find wallet by userID
    const wallet = await Wallet.findOne({ userID })
      .maxTimeMS(10000)
      .select("-images") // Exclude images from response for performance
      .lean()
      .exec();

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({
      message: "Wallet retrieved successfully",
      wallet: wallet,
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
