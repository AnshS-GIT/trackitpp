const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const contributionProofSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    links: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["SUBMITTED", "ACCEPTED", "REJECTED"],
      default: "SUBMITTED",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  baseOptions
);

module.exports = mongoose.model("ContributionProof", contributionProofSchema);
