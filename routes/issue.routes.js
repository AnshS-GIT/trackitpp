const express = require("express");
const {createNewIssue,getIssues,updateIssueStatusController,assignIssueController,} = require("../controllers/issue.controller");

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

module.exports = router;
