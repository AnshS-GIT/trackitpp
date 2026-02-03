const express = require("express");
const protect = require("../middleware/auth.middleware");
const contributionController = require("../controllers/contribution.controller");

const router = express.Router();

router.post(
  "/issues/:issueId/contribute",
  protect,
  contributionController.requestContribution
);

module.exports = router;
