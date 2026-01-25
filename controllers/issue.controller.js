const { createIssue,listIssues } = require("../services/issue.service");

const createNewIssue = async (req, res, next) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    const issue = await createIssue({
      title,
      description,
      priority,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    const issues = await listIssues({
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {createNewIssue,getIssues,};
