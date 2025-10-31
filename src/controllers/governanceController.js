const req = require("express/lib/request.js");
const { getContract } = require("../utils/contractsUtils.js");
const {
  sanitizeBigInts,
  formatEtherAmount,
  parseEtherAmount,
} = require("../utils/typeSanitizeUtils.js");
const { sendTx } = require("../config/testSigner.js");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const governance = getContract("Governance", provider);

const getProposal = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "No id provided" });
    }
    const result = await governance.getProposal(id);
    const mapResult = {
      proposer: result[0],
      target: result[1],
      value: formatEtherAmount(result[2]),
      data: result[3],
      description: result[4],
      startBlock: result[5].toString(),
      endBlock: result[6].toString(),
      forVotes: formatEtherAmount(result[7]),
      againstVotes: formatEtherAmount(result[8]),
      abstainVotes: formatEtherAmount(result[9]),
      executed: result[10],
    };
    console.log("This is result", result);
    res.status(200).json({
      success: true,
      message: "fetched proposal via ID",
      result: mapResult,
    });
  } catch (err) {
    console.error("Error fetching proposal", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const proposalsCount = async (req, res) => {
  try {
    const result = await governance.proposalsCount();
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Couldn't fetch proposal counts",
      });
    }

    res.status(200).json({
      success: true,
      result: result.toString(),
    });
  } catch (err) {
    console.error("Couldnt fetch proposal count", err);
    res.status(500).json({
      message: err,
    });
  }
};

const state = async (req, res) => {
  try {
    const { proposalId } = req.body;
    console.log(proposalId);
    if (!proposalId) {
      return res.status(400).json({
        message: "No proposal ID has been input",
      });
    }
    const state = await governance.state(proposalId);
    console.log(state);
    if (!state) {
      return res.status(400).json({
        message: "Invalid proposal Id or state function couldnt be called",
      });
    }
    res.status(200).json({
      success: true,
      state: state,
    });
  } catch (err) {
    console.error("Failed state", err);
    res.status(500).json({
      message: err,
    });
  }
};

const hasVoted = async (req, res) => {
  try {
    const { proposalId, address } = req.body;
    if (!proposalId || !address) {
      return res.status(400).json({
        message:
          "Pls provide proposalId and address to check if user has already voted!",
      });
    }
    const state = await governance.hasVoted(proposalId, address);

    res.status(200).json({
      success: true,
      state: state,
    });
  } catch (err) {
    console.error("Failed to fetch if user has voted or not!", err);
    res.status(500).json({
      message: err,
    });
  }
};

const votingPeriod = async (req, res) => {
  try {
    const votingPeriod = await governance.votingPeriod();
    if (!votingPeriod) {
      return res.status(400).json({
        message: "voting period fetch failed",
        success: false,
      });
    }
    res.status(200).json({
      message: "voting period fetched successfully",
      success: true,
      result: votingPeriod.toString(),
    });
  } catch (err) {
    console.error("Failed to fetch all voting period", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const proposalThreshold = async (req, res) => {
  try {
    const proposalThreshold = await governance.proposalThreshold();
    console.log("This is the proposal threshold", proposalThreshold);
    if (!proposalThreshold) {
      return res.status(400).json({
        message: "proposalThreshold fetch failed",
        success: false,
      });
    }
    res.status(200).json({
      message: "proposalThreshold fetched successfully",
      success: true,
      result: proposalThreshold.toString(),
    });
  } catch (err) {
    console.error("Failed to fetch proposalThreshold", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const quorumVotes = async (req, res) => {
  try {
    const quorumVotes = await governance.quorumVotes();
    if (!quorumVotes) {
      return res.status(400).json({
        message: "quorumVotes fetch failed",
        success: false,
      });
    }
    res.status(200).json({
      message: "quorumVotes fetched successfully",
      success: true,
      result: quorumVotes.toString(),
    });
  } catch (err) {
    console.error("Failed to fetch quorumVotes", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

//------------POST endpoints----------------

const execute = async (req, res) => {
  try {
    const { proposalId } = req.body;
    if (!proposalId) {
      return res.status(400).json({
        message: "No proposal ID has been input",
      });
    }
    const txData = await governance.execute.populateTransaction(proposalId);
    res.status(200).json({
      to: governance.target, // address of contract
      data: txData,
    });
  } catch (err) {
    console.error("Couldnt execute the proposal", err);
    res.status(500).json({
      message: err,
    });
  }
};

const castVote = async (req, res) => {
  try {
    const { proposalId, support } = req.body;
    if (!proposalId || !support) {
      return res.status(400).json({
        message: "No proposal ID or support for vote has been provided",
      });
    }
    const txData = await governance.castVote.populateTransaction(
      proposalId,
      support
    );

    if (!txData) {
      return res.status(400).json({
        message: "Couldnt call the castVote function of the contact",
      });
    }
    res.status(200).json({
      success: true,
      data: txData,
    });
  } catch (err) {
    console.error("Failed to cast vote", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const propose = async (req, res) => {
  try {
    const { target, value, data, description } = req.body;
    if (!target || !value || !data || !description) {
      return res.status(400).json({
        message: "Pls provide all fields to propose!",
      });
    }
    //smart contract expects hex data so
    if (!data.abi || !data.functionName) {
      return res.status(400).json({
        message: "Make sure to provide function name, ABI and args to propose!",
      });
    }
    const args = data.args;
    const spreadArgs = [...args];
    const encodedData = new ethers.Interface(data.abi).encodeFunctionData(
      data.functionName,
      spreadArgs
    );
    const txData = await governance.propose.populateTransaction(
      target,
      parseEtherAmount(value),
      encodedData,
      description
    );
    if (!txData) {
      return res.status(400).json({
        message: "Couldnt call propose of governance contract!",
      });
    }
    const txHash = await sendTx(txData); //remove in production
    res.status(200).json({
      success: true,
      data: txData,
      testHash: txHash, //remove in production
    });
  } catch (err) {
    console.error("Failed to propose!", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getProposal,
  proposalsCount,
  state,
  hasVoted,
  votingPeriod,
  proposalThreshold,
  quorumVotes,
  execute,
  castVote,
  propose,
};
