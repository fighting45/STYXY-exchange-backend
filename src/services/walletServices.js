const { v4: uuidv4 } = require("uuid");
const cryptoService = require("./cryptoServices");
const privateKeyServices = require("./privateKeyServices");
const Wallet = require("../models/wallet");
const vaultService = require("./vaultService");
const bs58 = require("bs58");

const generateUUID = () => {
  return uuidv4();
};

async function generateWalletFromImages(imageBuffers) {
  const ikm = cryptoService.concatImageHashes(imageBuffers);
  const saltUuid = generateUUID();
  const salt = Buffer.from(`solana-salt-${saltUuid}`);
  const seed = cryptoService.deriveSeedHKDF(ikm, {
    salt,
    info: "myapp-v1-image-seed",
    length: 32,
  });

  const kp = cryptoService.keypairFromEd25519Seed(seed);

  return { kp, seed, saltUuid };
}

async function createWalletInDB(imagesBuffers) {
  const { kp } = await generateWalletFromImages(imagesBuffers);
  const walletAddress = kp.publicKey.toBase58();
  const walletPrivateKey = kp.secretKey;
  const privateKeyBuffer = Buffer.from(walletPrivateKey);
  const base58PrivateKey = bs58.encode(privateKeyBuffer);
  const userID = generateUUID();
  const { encryptedPrivateKey, iv } =
    privateKeyServices.encryptPrivateKey(base58PrivateKey); //returns iv and the private key
  vaultService.storePrivateKey(userID, encryptedPrivateKey, iv);
  // const images = imagesBuffers.map((buf) => cryptoService.bufferToBase64(buf)); //if need to store images later into db

  const newWallet = new Wallet({
    userID,
    walletAddress,
    // images: { image1: images[0], image2: images[1], image3: images[2] },
    network: "solana",
  });
  await newWallet.save();
  console.log("Wallet saved successfully:", newWallet);

  return { newWallet, base58PrivateKey };
}

async function getWalletByUserID(userID) {
  const wallet = await Wallet.findOne({ userID })
    .maxTimeMS(10000)
    .select("-images") // Exclude images from response for performance
    .lean()
    .exec();

  return wallet;
}

module.exports = { generateUUID, getWalletByUserID, createWalletInDB };
