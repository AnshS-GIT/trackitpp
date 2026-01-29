const Issue = require("../models/issue.model");
const { logAuditEvent } = require("./auditLog.service");

const createIssue = async ({
  title,
  description,
  priority,
  createdBy,
  assignedTo,
}) => {
  const issue = await Issue.create({
    title,
    description,
    priority,
    createdBy,
    assignedTo,
  });

  return issue;
};
const listIssues = async ({ userId, role }) => {
  let query = {};

  if (role === "ENGINEER") {
    query = {
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    };
  }

  const issues = await Issue.find(query)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  return issues;
};

const updateIssueStatus = async ({ issueId, newStatus, user }) => {
  const issue = await Issue.findById(issueId);

  if (!issue) {
    const error = new Error("Issue not found");
    error.statusCode = 404;
    throw error;
  }

  const validTransitions = {
    OPEN: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
  };

  if (!validTransitions[issue.status].includes(newStatus)) {
    const error = new Error(
      `Invalid status transition from ${issue.status} to ${newStatus}`
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    newStatus === "CLOSED" &&
    !["MANAGER", "ADMIN"].includes(user.role)
  ) {
    const error = new Error("Only managers or admins can close issues");
    error.statusCode = 403;
    throw error;
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
    const error = new Error("Only managers or admins can assign issues");
    error.statusCode = 403;
    throw error;
  }

  const issue = await Issue.findById(issueId);

  if (!issue) {
    const error = new Error("Issue not found");
    error.statusCode = 404;
    throw error;
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


module.exports = {createIssue,listIssues,updateIssueStatus,assignIssue,};