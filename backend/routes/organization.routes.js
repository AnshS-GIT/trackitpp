const express = require("express");
const protect = require("../middleware/auth.middleware");
const organizationController = require("../controllers/organization.controller");

const router = express.Router();

router.post("/organizations", protect, organizationController.createOrganization);
router.post("/organizations/:orgId/invite", protect, organizationController.inviteMember);
router.get("/organizations/:orgId/members", protect, organizationController.getMembers);

module.exports = router;
