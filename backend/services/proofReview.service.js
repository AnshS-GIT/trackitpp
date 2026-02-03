const ContributionProof = require("../models/contributionProof.model");
const Issue = require("../models/issue.model");
const { logAuditEvent } = require("./auditLog.service");

const reviewProof = async ({ proofId, reviewerId, decision }) => {
  // Validate decision
  if (!["ACCEPTED", "REJECTED"].includes(decision)) {
    const error = new Error("Invalid decision. Must be ACCEPTED or REJECTED");
    error.statusCode = 400;
    throw error;
  }

  // Find the proof
  const proof = await ContributionProof.findById(proofId).populate("issue");
  if (!proof) {
    const error = new Error("Proof not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent re-reviewing
  if (proof.status !== "SUBMITTED") {
    const error = new Error("Proof has already been reviewed");
    error.statusCode = 409;
    throw error;
  }

  // Update proof status
  proof.status = decision;
  proof.reviewedBy = reviewerId;
  proof.reviewedAt = new Date();
  await proof.save();

  // On ACCEPT: Update issue status to RESOLVED
  if (decision === "ACCEPTED") {
    const issue = await Issue.findById(proof.issue);
    if (issue) {
      issue.status = "RESOLVED";
      await issue.save();
    }
  }

  // Create audit log
  try {
    await logAuditEvent({
      action: "CONTRIBUTION_PROOF_REVIEWED",
      entityType: "ContributionProof",
      entityId: proofId,
      performedBy: reviewerId,
      newValue: {
        decision,
        reviewedBy: reviewerId,
        issueId: proof.issue._id,
        issueStatus: decision === "ACCEPTED" ? "RESOLVED" : undefined,
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return {
    proof,
    issueUpdated: decision === "ACCEPTED",
  };
};

module.exports = {
  reviewProof,
};
