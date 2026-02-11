const ContributionRequest = require("../models/contributionRequest.model");
const Issue = require("../models/issue.model");
const OrganizationMember = require("../models/orgMember.model");
const { NotFoundError, ConflictError, BadRequestError, ForbiddenError } = require("../errors");
const { logAuditEvent } = require("./auditLog.service");

const requestContribution = async ({ issueId, userId, organizationId }) => {
  // Fetch the issue
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  // Prevent request if issue is CLOSED or RESOLVED
  if (issue.status === "CLOSED" || issue.status === "RESOLVED") {
    throw new ConflictError("Cannot request contribution for closed or resolved issues");
  }

  // Check if user is already assigned to the issue
  if (issue.assignedTo && issue.assignedTo.toString() === userId.toString()) {
    throw new BadRequestError("You are already assigned to this issue");
  }

  // Verify user is a member of the organization
  const membership = await OrganizationMember.findOne({
    user: userId,
    organization: organizationId,
  });

  if (!membership) {
    throw new ForbiddenError("You are not a member of this organization");
  }

  // Check for existing contribution request
  const existingRequest = await ContributionRequest.findOne({
    issue: issueId,
    requestedBy: userId,
  });

  if (existingRequest) {
    throw new BadRequestError("You have already requested to contribute to this issue");
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
