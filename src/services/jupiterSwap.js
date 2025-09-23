const fetch = require("node-fetch");
const axios = require("axios");
const {
  clusterApiUrl,
  Connection,
  VersionedTransaction,
  Transaction,
} = require("@solana/web3.js");

const connection = new Connection(clusterApiUrl("mainnet-beta"));

async function swap(outputMint, inputMint, amount, privateKey) {
  const url = `https://quote-api.jup.ag/v6/quote?outputMint=${outputMint}&inputMint=${inputMint}&amount=${amount}`;
  let quoteResponse;
  try {
    const x = await fetch(url);
    quoteResponse = await x.json();
    // console.log("Here is the quotation for the swap: ", quoteResponse);
  } catch (err) {
    console.log("Error fetching swap quote", err);
  }

  const swapApiUrl = "https://lite-api.jup.ag/swap/v1/swap";
  const requestBody = {
    userPublicKey: "7rhxnLV8C77o6d8oz26AgK8x8m5ePsdeRawjqvojbjnQ",
    quoteResponse: quoteResponse,
  };
  try {
    const response = await axios.post(swapApiUrl, requestBody);

    const { swapTransaction } = response.data;

    const txBytes = Buffer.from(swapTransaction, "base64");

    // Determine the transaction version
    const versionByte = txBytes[0];
    let transaction;

    if (versionByte === 0) {
      // Legacy transaction
      transaction = Transaction.from(txBytes);
    } else {
      // Versioned transaction
      transaction = VersionedTransaction.deserialize(txBytes);
    }

    const simulationResult = await connection.simulateTransaction(transaction);
    console.log("Following are the simulation results:", simulationResult);

    //sendTransaction here with privateKey
    return transaction.signatures[0];
  } catch (err) {
    console.err("Error making a swap", err);
  }
}

module.exports = { swap };
