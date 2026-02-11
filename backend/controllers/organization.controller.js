const organizationService = require("../services/organization.service");
const asyncHandler = require("../middleware/asyncHandler");

const createOrganization = asyncHandler(async (req, res) => {
  const { name, visibility } = req.body;
  const creatorId = req.user.id;

  if (!name) {
    const error = new Error("Organization name is required");
    error.statusCode = 400;
    throw error;
  }

  const organization = await organizationService.createOrganization({
    name,
    creatorId,
    visibility,
  });

  res.status(201).json({
    success: true,
    data: {
      id: organization._id,
      name: organization.name,
      visibility: organization.visibility,
    },
  });
});

const inviteMember = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { email, role } = req.body;
  const requesterId = req.user.id;

  if (!email) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  const member = await organizationService.inviteMember({
    orgId,
    email,
    role,
    requesterId,
  });

  res.status(201).json({
    message: "Member invited successfully",
    member,
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

module.exports = {
  createOrganization,
  inviteMember,
  getMembers,
};
