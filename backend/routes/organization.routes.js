const express = require("express");
const protect = require("../middleware/auth.middleware");
const organizationController = require("../controllers/organization.controller");

const router = express.Router();

router.post("/organizations", protect, organizationController.createOrganization);

module.exports = router;
