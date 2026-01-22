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

module.exports = {
  createIssue,
};
