const { createIssue, listIssues, updateIssueStatus, assignIssue, requestAssignment } = require("../services/issue.service");

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

const updateIssueStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedIssue = await updateIssueStatus({
      issueId: id,
      newStatus: status,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

const assignIssueController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    const result = await assignIssue({
      issueId: id,
      assigneeId,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Issue assigned successfully",
      data: result.issue,
    });
  } catch (error) {
    next(error);
  }
};

const requestAssignmentController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await requestAssignment({
      issueId: id,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {createNewIssue,getIssues,updateIssueStatusController,assignIssueController,requestAssignmentController};