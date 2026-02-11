const ContributionProof = require("../models/contributionProof.model");
const Issue = require("../models/issue.model");
const { BadRequestError, NotFoundError, ConflictError } = require("../errors");
const { logAuditEvent } = require("./auditLog.service");

const reviewProof = async ({ proofId, reviewerId, decision }) => {
  // Validate decision
  if (![" ACCEPTED", "REJECTED"].includes(decision)) {
    throw new BadRequestError("Invalid decision. Must be ACCEPTED or REJECTED");
  }

  // Find the proof
  const proof = await ContributionProof.findById(proofId).populate("issue");
  if (!proof) {
    throw new NotFoundError("Proof not found");
  }

  // Prevent re-reviewing
  if (proof.status !== "SUBMITTED") {
    throw new ConflictError("Proof has already been reviewed");
  }

  // Update proof status
  proof.status = decision; // Decision is now "APPROVED" or "REJECTED"
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
