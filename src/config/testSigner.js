const { ethers } = require("ethers");
const { send } = require("process");
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privateKey =
  "b6071bc0115a8837cf2d7f3dd44d8ae790decdea0a82a29adec48b01ed696935";
const signer = new ethers.Wallet(privateKey, provider);

async function sendTx(data) {
  try {
    const txResponse = await signer.sendTransaction(data);
    console.log("📤 Transaction sent:", txResponse.hash);

    // Wait for confirmation
    const receipt = await txResponse.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    return txResponse.hash;
  } catch (err) {
    console.error("❌ Transaction failed:", err);
  }
}

module.exports = {
  sendTx,
};
