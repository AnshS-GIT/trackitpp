const express = require("express");
const {createNewIssue,getIssues,updateIssueStatusController,assignIssueController,requestAssignmentController,deleteIssueController,} = require("../controllers/issue.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");

const router = express.Router();

router.post(
  "/issues",
  protect,
  authorizeRoles("ENGINEER", "MANAGER"),
  createNewIssue
);

router.get(
  "/issues",
  protect,
  authorizeRoles("ENGINEER", "MANAGER", "AUDITOR", "ADMIN"),
  getIssues
);

router.patch(
  "/issues/:id/status",
  protect,
  authorizeRoles("ENGINEER", "MANAGER", "ADMIN"),
  updateIssueStatusController
);

router.patch(
  "/issues/:id/assign",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  assignIssueController
);

router.post(
  "/issues/:id/request-assignment",
  protect,
  authorizeRoles("ENGINEER"),
  requestAssignmentController
);

router.delete(
  "/issues/:id",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  deleteIssueController
);

module.exports = router;
