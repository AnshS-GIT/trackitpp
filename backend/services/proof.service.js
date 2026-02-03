const ContributionProof = require("../models/contributionProof.model");
const ContributionRequest = require("../models/contributionRequest.model");
const Issue = require("../models/issue.model");
const { logAuditEvent } = require("./auditLog.service");

const submitProof = async ({ issueId, userId, organizationId, content, links }) => {
  // Verify the issue exists
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue not found");
    error.statusCode = 404;
    throw error;
  }

  // Issue must not be CLOSED
  if (issue.status === "CLOSED") {
    const error = new Error("Cannot submit proof for closed issues");
    error.statusCode = 409;
    throw error;
  }

  // Check if user has an APPROVED contribution request for this issue
  const approvedRequest = await ContributionRequest.findOne({
    issue: issueId,
    requestedBy: userId,
    status: "APPROVED",
  });

  if (!approvedRequest) {
    const error = new Error("You must have an approved contribution request to submit proof");
    error.statusCode = 403;
    throw error;
  }

  // Create contribution proof (multiple submissions allowed)
  const proof = await ContributionProof.create({
    issue: issueId,
    contributor: userId,
    organization: organizationId,
    content,
    links: links || [],
    status: "SUBMITTED",
  });

  // Create audit log
  try {
    await logAuditEvent({
      action: "CONTRIBUTION_PROOF_SUBMITTED",
      entityType: "Issue",
      entityId: issueId,
      performedBy: userId,
      newValue: {
        proofId: proof._id,
        contributor: userId,
        status: "SUBMITTED",
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return proof;
};

module.exports = {
  submitProof,
};
