const mongoose = require("mongoose");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const auditLogService = require("./auditLog.service");
const { BadRequestError, NotFoundError } = require("../errors");
const { parsePaginationParams, formatPaginatedResponse } = require("../utils/pagination");

const createOrganization = async ({ name, creatorId }) => {
  const existingOrg = await Organization.findOne({ name, createdBy: creatorId });
  if (existingOrg) {
    throw new BadRequestError("You have already created an organization with this name");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [organization] = await Organization.create(
      [{ name, createdBy: creatorId }],
      { session }
    );

    await OrganizationMember.create(
      [{ user: creatorId, organization: organization._id, role: "OWNER" }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    try {
      await auditLogService.logAuditEvent({
        action: "ORGANIZATION_CREATED",
        entityType: "Organization",
        entityId: organization._id,
        performedBy: creatorId,
        newValue: { name: organization.name },
      });
    } catch (auditError) {
      console.error("Failed to log audit event:", auditError);
    }

    return organization;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getOrganizationMembers = async ({ orgId, requesterId, page, limit }) => {
  const { skip, page: validPage, limit: validLimit } = parsePaginationParams({ page, limit });

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  const [members, total] = await Promise.all([
    OrganizationMember.find({ organization: orgId })
      .populate("user", "name email")
      .select("role joinedAt user")
      .skip(skip)
      .limit(validLimit)
      .sort({ joinedAt: -1 }),
    OrganizationMember.countDocuments({ organization: orgId }),
  ]);

  const formattedMembers = members.map((member) => ({
    id: member._id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinedAt: member.joinedAt,
  }));

  return formatPaginatedResponse(formattedMembers, validPage, validLimit, total);
};

const crypto = require("crypto");

const generateInviteCode = async ({ orgId, requesterId }) => {
  const membership = await OrganizationMember.findOne({
    user: requesterId,
    organization: orgId,
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    throw new BadRequestError("Only owners or admins can generate invite codes");
  }

  let attempts = 0;
  const maxAttempts = 3;
  let organization = null;

  while (attempts < maxAttempts) {
    try {
      const inviteCode = crypto.randomBytes(12).toString("hex").toUpperCase();
      const inviteCodeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      organization = await Organization.findByIdAndUpdate(
        orgId,
        { inviteCode, inviteCodeExpiresAt },
        { new: true }
      );

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      break;
    } catch (err) {
      attempts++;
      if (err.code === 11000 && attempts < maxAttempts) {
        continue;
      }
      throw err;
    }
  }

  try {
    await auditLogService.logAuditEvent({
      action: "ORGANIZATION_INVITE_CODE_GENERATED",
      entityType: "Organization",
      entityId: orgId,
      performedBy: requesterId,
      newValue: { expiresAt: organization.inviteCodeExpiresAt },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return {
    inviteCode: organization.inviteCode,
    expiresAt: organization.inviteCodeExpiresAt,
  };
};

const joinOrganizationByCode = async ({ inviteCode, userId }) => {
  if (!inviteCode) {
    throw new BadRequestError("Invite code is required");
  }

  const organization = await Organization.findOne({ inviteCode });
  if (!organization) {
    throw new NotFoundError("Invalid or non-existent invite code");
  }

  if (organization.inviteCodeExpiresAt && new Date() > organization.inviteCodeExpiresAt) {
    throw new BadRequestError("Invite code has expired");
  }

  const existingMembership = await OrganizationMember.findOne({
    user: userId,
    organization: organization._id,
  });

  if (existingMembership) {
    const error = new Error("You are already a member of this organization");
    error.statusCode = 409;
    throw error;
  }

  await OrganizationMember.create({
    user: userId,
    organization: organization._id,
    role: "MEMBER",
  });

  try {
    await auditLogService.logAuditEvent({
      action: "ORGANIZATION_JOINED_VIA_CODE",
      entityType: "Organization",
      entityId: organization._id,
      performedBy: userId,
      newValue: { role: "MEMBER", method: "INVITE_CODE" },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return {
    organization: {
      id: organization._id,
      name: organization.name,
    },
    status: "JOINED",
    message: "You have successfully joined the organization.",
  };
};

module.exports = {
  createOrganization,
  getOrganizationMembers,
  generateInviteCode,
  joinOrganizationByCode,
};
