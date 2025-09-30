require("dotenv").config();
const crypto = require("crypto");

const encryptionKeyBase64 = process.env.ENCRYPTION_KEY; // 32 bytes for AES-256
const encryptionKey = Buffer.from(encryptionKeyBase64, "base64");

function encryptPrivateKey(base58PrivateKey) {
  const iv = crypto.randomBytes(16); // Initialization vector for AES
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encrypted = cipher.update(base58PrivateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { iv: iv.toString("hex"), encryptedPrivateKey: encrypted };
}

function decryptPrivateKey(iv, encryptedPrivateKey) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    Buffer.from(iv, "hex"),
  );

  let decrypted = decipher.update(encryptedPrivateKey, "hex", "utf8");

  try {
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}
module.exports = { encryptPrivateKey, decryptPrivateKey };
