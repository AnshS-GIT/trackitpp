const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const contributionRequestSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
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

// Enforce unique (issue + requestedBy) to prevent duplicate requests
contributionRequestSchema.index({ issue: 1, requestedBy: 1 }, { unique: true });

module.exports = mongoose.model("ContributionRequest", contributionRequestSchema);
