const express = require("express");
const protect = require("../middleware/auth.middleware");
const organizationController = require("../controllers/organization.controller");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const joinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many attempts to join organization. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/organizations/join", protect, joinLimiter, organizationController.joinOrganization);
router.post("/organizations", protect, organizationController.createOrganization);
router.post("/organizations/:orgId/invite", protect, organizationController.inviteMember);
router.post("/organizations/:orgId/invite-code", protect, organizationController.generateInviteCode);
router.get("/organizations/:orgId/members", protect, organizationController.getMembers);

module.exports = router;
