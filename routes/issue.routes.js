const express = require("express");
const {
  createNewIssue,
  getIssues,
} = require("../controllers/issue.controller");

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

module.exports = router;
