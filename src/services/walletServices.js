const { v4: uuidv4 } = require("uuid");
const cryptoService = require("./cryptoServices");
const privateKeyServices = require("./privateKeyServices");
const Wallet = require("../models/wallet");
const vaultService = require("./vaultService");
const bs58 = require("bs58");

const generateUUID = () => {
  return uuidv4();
};

async function generateWalletFromImages(imageBuffers, network) {
  let kp;
  const ikm = cryptoService.concatImageHashes(imageBuffers);
  const saltUuid = generateUUID();
  const salt = Buffer.from(`solana-salt-${saltUuid}`);
  const seed = cryptoService.deriveSeedHKDF(ikm, {
    salt,
    info: "myapp-v1-image-seed",
    length: 32,
  });
  if (network === "solana") {
    kp = cryptoService.keypairFromEd25519Seed(seed);
  } else {
    kp = cryptoService.ethKeypairFromSeed(seed);
  }

  return kp;
}

async function createWalletInDB(imagesBuffers, network) {
  let walletAddress;
  let privateKey;
  let userID;

  const kp = await generateWalletFromImages(imagesBuffers, network);

  if (network === "solana") {
    walletAddress = kp.publicKey.toBase58();
    const walletPrivateKey = kp.secretKey;
    const privateKeyBuffer = Buffer.from(walletPrivateKey);
    privateKey = bs58.encode(privateKeyBuffer);
    userID = generateUUID();
  } else {
    walletAddress = kp.address;
    privateKey = kp.privateKey;
    userID = generateUUID();
  }
  const { encryptedPrivateKey, iv } =
    privateKeyServices.encryptPrivateKey(privateKey); //returns iv and the private key
  vaultService.storePrivateKey(userID, encryptedPrivateKey, iv);

  const newWallet = new Wallet({
    userID,
    walletAddress,
    network: network,
  });
  await newWallet.save();
  console.log("Wallet saved successfully:", newWallet);

  return { newWallet, privateKey };
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
