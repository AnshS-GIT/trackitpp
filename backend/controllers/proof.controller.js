const proofService = require("../services/proof.service");
const asyncHandler = require("../middleware/asyncHandler");

const submitProof = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { content, links } = req.body;
  const userId = req.user.id;
  const organizationId = req.headers["x-organization-id"];

  if (!organizationId) {
    const error = new Error("Organization context is required");
    error.statusCode = 400;
    throw error;
  }

  if (!content) {
    const error = new Error("Content is required");
    error.statusCode = 400;
    throw error;
  }

  const proof = await proofService.submitProof({
    issueId,
    userId,
    organizationId,
    content,
    links,
  });

  res.status(201).json({
    success: true,
    message: "Proof submitted successfully",
    data: {
      proofId: proof._id,
      status: proof.status,
    },
  });
});

const getMyContributionStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await proofService.getUserContributionStats(userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

module.exports = {
  submitProof,
  getMyContributionStats,
};
