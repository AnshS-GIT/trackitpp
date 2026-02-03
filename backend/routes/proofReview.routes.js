const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const proofReviewController = require("../controllers/proofReview.controller");

const router = express.Router();

router.patch(
  "/proofs/:proofId/review",
  protect,
  authorizeRoles("ADMIN", "MANAGER"),
  proofReviewController.reviewProof
);

module.exports = router;
