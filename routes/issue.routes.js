const express = require("express");
const { createNewIssue } = require("../controllers/issue.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");

const router = express.Router();

router.post(
  "/issues",
  protect,
  authorizeRoles("ENGINEER", "MANAGER"),
  createNewIssue
);

module.exports = router;
