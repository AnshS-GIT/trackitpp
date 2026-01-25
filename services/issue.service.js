const Issue = require("../models/issue.model");

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

module.exports = {createIssue,listIssues,};