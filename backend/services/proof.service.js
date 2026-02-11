const ContributionProof = require("../models/contributionProof.model");
const ContributionRequest = require("../models/contributionRequest.model");
const Issue = require("../models/issue.model");
const { NotFoundError, ConflictError, ForbiddenError } = require("../errors");
const { logAuditEvent } = require("./auditLog.service");

const submitProof = async ({ issueId, userId, organizationId, content, links }) => {
  // Verify the issue exists
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  // Issue must not be CLOSED
  if (issue.status === "CLOSED") {
    throw new ConflictError("Cannot submit proof for closed issues");
  }

  // Check if user has an APPROVED contribution request for this issue
  const approvedRequest = await ContributionRequest.findOne({
    issue: issueId,
    requestedBy: userId,
    status: "APPROVED",
  });

  if (!approvedRequest) {
    throw new ForbiddenError("You must have an approved contribution request to submit proof");
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

const getUserContributionStats = async (userId) => {
  // Count accepted contributions
  const acceptedCount = await ContributionProof.countDocuments({
    contributor: userId,
    status: "ACCEPTED",
  });

  // Count pending submissions (SUBMITTED status)
  const pendingCount = await ContributionProof.countDocuments({
    contributor: userId,
    status: "SUBMITTED",
  });

  return {
    acceptedContributions: acceptedCount,
    pendingSubmissions: pendingCount,
  };
};

module.exports = {
  submitProof,
  getUserContributionStats,
};
