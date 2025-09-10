const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: "http://localhost:8200",
  token: "root",
});

async function storePrivateKey(userID, privateKey, ivHex) {
  try {
    const path = `secret/data/solana_wallets/${userID}`;
    const data = {
      data: {
        // Nested `data` field to match Vault API format
        private_key: privateKey,
        iv: ivHex,
        userID: userID,
      },
    };
    const response = await vault.write(path, data);
    console.log("Private key stored in vault");
  } catch (error) {
    console.error("Error saving the private key into vault:", error);
  }
}

async function getPrivateKey(userID) {
  try {
    const path = `secret/data/solana_wallets/${userID}`;
    const response = await vault.read(path);
    return response.data.data;
  } catch (err) {
    console.error(`Error retrieving the private key from the vault`, err);
  }
}

module.exports = { storePrivateKey, getPrivateKey };
