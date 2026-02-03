const proofReviewService = require("../services/proofReview.service");
const asyncHandler = require("../middleware/asyncHandler");

const reviewProof = asyncHandler(async (req, res) => {
  const { proofId } = req.params;
  const { decision } = req.body;
  const reviewerId = req.user.id;

  if (!decision) {
    const error = new Error("Decision is required");
    error.statusCode = 400;
    throw error;
  }

  const result = await proofReviewService.reviewProof({
    proofId,
    reviewerId,
    decision,
  });

  res.status(200).json({
    success: true,
    message: `Proof ${decision.toLowerCase()} successfully`,
    data: {
      proofId: result.proof._id,
      status: result.proof.status,
      issueUpdated: result.issueUpdated,
    },
  });
});

module.exports = {
  reviewProof,
};
