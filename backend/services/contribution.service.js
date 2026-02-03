const ContributionRequest = require("../models/contributionRequest.model");
const Issue = require("../models/issue.model");
const OrganizationMember = require("../models/orgMember.model");
const { logAuditEvent } = require("./auditLog.service");

const requestContribution = async ({ issueId, userId, organizationId }) => {
  // Fetch the issue
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent request if issue is CLOSED or RESOLVED
  if (issue.status === "CLOSED" || issue.status === "RESOLVED") {
    const error = new Error("Cannot request contribution for closed or resolved issues");
    error.statusCode = 409;
    throw error;
  }

  // Check if user is already assigned to the issue
  if (issue.assignedTo && issue.assignedTo.toString() === userId.toString()) {
    const error = new Error("You are already assigned to this issue");
    error.statusCode = 400;
    throw error;
  }

  // Verify user is a member of the organization
  const membership = await OrganizationMember.findOne({
    user: userId,
    organization: organizationId,
  });

  if (!membership) {
    const error = new Error("You are not a member of this organization");
    error.statusCode = 403;
    throw error;
  }

  // Check for existing contribution request
  const existingRequest = await ContributionRequest.findOne({
    issue: issueId,
    requestedBy: userId,
  });

  if (existingRequest) {
    const error = new Error("You have already requested to contribute to this issue");
    error.statusCode = 400;
    throw error;
  }

  // Create contribution request
  const contributionRequest = await ContributionRequest.create({
    issue: issueId,
    requestedBy: userId,
    organization: organizationId,
    status: "PENDING",
  });

  // Create audit log
  try {
    await logAuditEvent({
      action: "ISSUE_CONTRIBUTION_REQUESTED",
      entityType: "Issue",
      entityId: issueId,
      performedBy: userId,
      newValue: {
        contributionRequestId: contributionRequest._id,
        requestedBy: userId,
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return contributionRequest;
};

module.exports = {
  requestContribution,
};
