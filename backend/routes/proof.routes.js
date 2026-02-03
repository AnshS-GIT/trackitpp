const express = require("express");
const protect = require("../middleware/auth.middleware");
const proofController = require("../controllers/proof.controller");

const router = express.Router();

router.post(
  "/issues/:issueId/proofs",
  protect,
  proofController.submitProof
);

module.exports = router;
