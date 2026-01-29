const express = require("express");
const { fetchAuditLogs } = require("../controllers/auditLog.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");

const router = express.Router();

router.get(
  "/audit-logs",
  protect,
  authorizeRoles("ADMIN", "AUDITOR"),
  fetchAuditLogs
);

module.exports = router;
