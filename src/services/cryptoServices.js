const crypto = require("crypto");
const { Wallet } = require("ethers");
const nacl = require("tweetnacl");
const { Keypair } = require("@solana/web3.js");

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
  { salt, info = "solana-image-seed", length = 32 } = {},
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
      derived.byteLength,
    );
  } else if (!Buffer.isBuffer(derived)) {
    derived = Buffer.from(derived);
  }

  if (derived.length !== length) {
    throw new Error(
      `KDF output length mismatch: got ${derived.length}, expected ${length}`,
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
function ethKeypairFromSeed(seed32) {
  if (seed32.length !== 32) throw new Error("seed must be 32 bytes");

  // Use seed as the private key
  const privateKeyHex = seed32.toString("hex");
  const wallet = new Wallet(privateKeyHex);

  return {
    privateKey: privateKeyHex,
    publicKey: wallet.publicKey,
    address: wallet.address,
  };
}

function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

module.exports = {
  concatImageHashes,
  deriveSeedHKDF,
  keypairFromEd25519Seed,
  bufferToBase64,
  ethKeypairFromSeed,
};
