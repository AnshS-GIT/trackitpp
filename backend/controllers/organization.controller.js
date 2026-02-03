const organizationService = require("../services/organization.service");
const asyncHandler = require("../middleware/asyncHandler");

const createOrganization = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const creatorId = req.user.id;

  if (!name) {
    const error = new Error("Organization name is required");
    error.statusCode = 400;
    throw error;
  }

  const organization = await organizationService.createOrganization({
    name,
    creatorId,
  });

  res.status(201).json({
    id: organization._id,
    name: organization.name,
  });
});

module.exports = {
  createOrganization,
};
