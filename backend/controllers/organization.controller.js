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
    success: true,
    data: {
      id: organization._id,
      name: organization.name,
    },
  });
});

const getMembers = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { page, limit } = req.query;
  const requesterId = req.user.id;

  const result = await organizationService.getOrganizationMembers({
    orgId,
    requesterId,
    page,
    limit,
  });

  res.json(result);
});

const generateInviteCode = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const requesterId = req.user.id;

  const result = await organizationService.generateInviteCode({
    orgId,
    requesterId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const joinOrganization = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const result = await organizationService.joinOrganizationByCode({
    inviteCode: code,
    userId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  createOrganization,
  getMembers,
  generateInviteCode,
  joinOrganization,
};
