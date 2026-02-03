const contributionService = require("../services/contribution.service");
const asyncHandler = require("../middleware/asyncHandler");

const requestContribution = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const userId = req.user.id;
  const organizationId = req.headers["x-organization-id"];

  if (!organizationId) {
    const error = new Error("Organization context is required");
    error.statusCode = 400;
    throw error;
  }

  const contributionRequest = await contributionService.requestContribution({
    issueId,
    userId,
    organizationId,
  });

  res.status(201).json({
    success: true,
    message: "Contribution request submitted successfully",
    data: {
      requestId: contributionRequest._id,
      status: contributionRequest.status,
    },
  });
});

module.exports = {
  requestContribution,
};
