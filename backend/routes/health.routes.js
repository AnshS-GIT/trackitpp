const express = require("express");
const router = express.Router();

/**
 * Health check endpoint
 * Returns server status, uptime, and current timestamp
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
