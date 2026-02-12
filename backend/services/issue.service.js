const Issue = require("../models/issue.model");
const { logAuditEvent } = require("./auditLog.service");
const OrganizationMember = require("../models/orgMember.model");
const { ForbiddenError, NotFoundError, BadRequestError } = require("../errors");
const { parsePaginationParams, formatPaginatedResponse } = require("../utils/pagination");

const createIssue = async ({
  title,
  description,
  priority,
  createdBy,
  assignedTo,
  organization,
}) => {
  // Validate that user belongs to the organization
  const membership = await OrganizationMember.findOne({
    user: createdBy,
    organization,
  });

  if (!membership) {
    throw new ForbiddenError("You are not a member of this organization");
  }

  const issue = await Issue.create({
    title,
    description,
    priority,
    createdBy,
    assignedTo,
    organization,
  });

  return issue;
};
const listIssues = async ({ userId, role, organization, page, limit }) => {
  // Parse and validate pagination params
  const { skip, page: validPage, limit: validLimit } = parsePaginationParams({ page, limit });

  let query = { organization, deletedAt: null };

  if (role === "ENGINEER") {
    query.$or = [{ createdBy: userId }, { assignedTo: userId }];
  }

  // Execute query with pagination and get total count
  const [issues, total] = await Promise.all([
    Issue.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .skip(skip)
      .limit(validLimit)
      .sort({ createdAt: -1 }),
    Issue.countDocuments(query),
  ]);

  // Apply visibility-based masking for assigned users
  const Organization = require("../models/organization.model");
  
  const processedIssues = await Promise.all(
    issues.map(async (issue) => {
      const issueObj = issue.toObject();
      
      // Check if organization is PRIVATE
      if (issue.organization) {
        const org = await Organization.findById(issue.organization);
        
        if (org && org.visibility === "PRIVATE") {
          // Get requester's role in organization
          const requesterMembership = await OrganizationMember.findOne({
            user: userId,
            organization: org._id,
          });
          
          // Mask assignedTo for MEMBER and AUDITOR roles
          if (requesterMembership && 
              ["MEMBER", "AUDITOR"].includes(requesterMembership.role)) {
            issueObj.assignedTo = "Hidden";
          }
        }
      }
      
      return issueObj;
    })
  );

  return formatPaginatedResponse(processedIssues, validPage, validLimit, total);
};

const updateIssueStatus = async ({ issueId, newStatus, user }) => {
  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  const validTransitions = {
    OPEN: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
  };

  if (!validTransitions[issue.status].includes(newStatus)) {
    throw new BadRequestError(
      `Invalid status transition from ${issue.status} to ${newStatus}`
    );
  }

  if (
    newStatus === "CLOSED" &&
    !["MANAGER", "ADMIN"].includes(user.role)
  ) {
    throw new ForbiddenError("Only managers or admins can close issues");
  }

  const oldStatus = issue.status;

  issue.status = newStatus;
  await issue.save();

  await logAuditEvent({
    action: "ISSUE_STATUS_UPDATED",
    entityType: "ISSUE",
    entityId: issue._id,
    performedBy: user.id,
    oldValue: { status: oldStatus },
    newValue: { status: newStatus },
  });

  return issue;
};

const assignIssue = async ({ issueId, assigneeId, user }) => {
  if (!["MANAGER", "ADMIN"].includes(user.role)) {
    throw new ForbiddenError("Only managers or admins can assign issues");
  }

  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  const oldAssignee = issue.assignedTo;

  issue.assignedTo = assigneeId;
  await issue.save();

  await logAuditEvent({
    action: "ISSUE_ASSIGNED",
    entityType: "ISSUE",
    entityId: issue._id,
    performedBy: user.id,
    oldValue: { assignedTo: oldAssignee },
    newValue: { assignedTo: assigneeId },
  });

  return issue;
};
const requestAssignment = async ({ issueId, user }) => {
  if (user.role !== "ENGINEER") {
    throw new ForbiddenError("Only engineers can request assignment");
  }

  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  if (issue.assignedTo) {
    throw new BadRequestError("Issue is already assigned");
  }

  await logAuditEvent({
    action: "ISSUE_ASSIGNMENT_REQUESTED",
    entityType: "ISSUE",
    entityId: issue._id,
    performedBy: user.id,
    oldValue: { assignedTo: null },
    newValue: { requestedBy: user.id },
  });

  return { success: true, message: "Assignment request logged successfully" };
};

const deleteIssue = async ({ issueId, user }) => {
  // Only ADMIN, MANAGER, or OWNER (if logic existed) can delete
  // Assumption from plan: Only ADMIN/MANAGER can delete
  if (!["MANAGER", "ADMIN"].includes(user.role)) {
    throw new ForbiddenError("Only managers or admins can delete issues");
  }

  const issue = await Issue.findOne({ _id: issueId, deletedAt: null });

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  issue.deletedAt = new Date();
  await issue.save();

  await logAuditEvent({
    action: "ISSUE_SOFT_DELETED",
    entityType: "ISSUE",
    entityId: issue._id,
    performedBy: user.id,
    oldValue: { deletedAt: null },
    newValue: { deletedAt: issue.deletedAt },
  });

  return { success: true, message: "Issue deleted successfully" };
};

module.exports = {
  createIssue,
  listIssues,
  updateIssueStatus,
  assignIssue,
  requestAssignment,
  deleteIssue,
};