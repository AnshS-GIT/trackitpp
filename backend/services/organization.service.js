const mongoose = require("mongoose");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const auditLogService = require("./auditLog.service");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../errors");
const { parsePaginationParams, formatPaginatedResponse } = require("../utils/pagination");

const User = require("../models/user.model");

const createOrganization = async ({ name, creatorId, visibility = "PUBLIC" }) => {
  // Validation: Organization name must be unique per creator
  const existingOrg = await Organization.findOne({ name, createdBy: creatorId });
  if (existingOrg) {
    throw new BadRequestError("You have already created an organization with this name");
  }

  // Validate visibility enum
  const validVisibilities = ["PUBLIC", "PRIVATE"];
  if (visibility && !validVisibilities.includes(visibility)) {
    throw new BadRequestError(
      `Invalid visibility. Must be one of: ${validVisibilities.join(", ")}`,
      { validValues: validVisibilities, received: visibility }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [organization] = await Organization.create(
      [
        {
          name,
          createdBy: creatorId,
          visibility: visibility || "PUBLIC",
        },
      ],
      { session }
    );

    await OrganizationMember.create(
      [
        {
          user: creatorId,
          organization: organization._id,
          role: "OWNER",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Audit Log
    try {
      await auditLogService.logAuditEvent({
        action: "ORGANIZATION_CREATED",
        entityType: "Organization",
        entityId: organization._id,
        performedBy: creatorId,
        newValue: { 
          name: organization.name,
          visibility: organization.visibility,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit event:", auditError);
      // Don't fail the request if audit logging fails
    }

    return organization;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const inviteMember = async ({ orgId, email, role, requesterId }) => {
  // Delegate to invitation service — creates a PENDING invitation
  // instead of directly adding the user
  const invitationService = require("./invitation.service");
  const invitation = await invitationService.createInvitation({
    orgId,
    email,
    role,
    requesterId,
  });

  return invitation;
};

const getOrganizationMembers = async ({ orgId, requesterId, page, limit }) => {
  // Parse and validate pagination params
  const { skip, page: validPage, limit: validLimit } = parsePaginationParams({ page, limit });

  // Fetch organization to check visibility
  const organization = await Organization.findById(orgId);
  
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  // Check if requester can view members based on visibility rules
  const canView = await canViewMembers(orgId, requesterId);
  
  if (!canView) {
    throw new ForbiddenError("Access denied. You cannot view members of this organization.");
  }

  // Fetch members with pagination and get total count
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

/**
 * Helper function to check if a user can view organization members
 * @param {String} orgId - Organization ID
 * @param {String} userId - User ID to check permissions for
 * @returns {Boolean} - True if user can view members, false otherwise
 */
const canViewMembers = async (orgId, userId) => {
  if (!orgId || !userId) {
    return false;
  }

  // Fetch organization
  const organization = await Organization.findById(orgId);
  if (!organization) {
    return false;
  }

  // PUBLIC organizations: anyone can view members
  if (organization.visibility === "PUBLIC") {
    return true;
  }

  // PRIVATE organizations: only members can view
  if (organization.visibility === "PRIVATE") {
    const membership = await OrganizationMember.findOne({
      user: userId,
      organization: orgId,
    });
    return !!membership;
  }

  return false;
};

const crypto = require("crypto");

const generateInviteCode = async ({ orgId, requesterId }) => {
  // Validate requester permissions (OWNER/ADMIN)
  const membership = await OrganizationMember.findOne({
    user: requesterId,
    organization: orgId,
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    throw new ForbiddenError(
      "Only owners or admins can generate invite codes"
    );
  }

  // Retry up to 3 times in case of duplicate key collision
  let attempts = 0;
  const maxAttempts = 3;
  let organization = null;

  while (attempts < maxAttempts) {
    try {
      // Generate secure random code
      const inviteCode = crypto.randomBytes(12).toString("hex").toUpperCase();
      // Set expiry to 7 days from now
      const inviteCodeExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );

      // Update Organization
      organization = await Organization.findByIdAndUpdate(
        orgId,
        {
          inviteCode,
          inviteCodeExpiresAt,
        },
        { new: true }
      );

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      // Success — break out of retry loop
      break;
    } catch (err) {
      attempts++;
      // If it's a duplicate key error and we have retries left, try again
      if (err.code === 11000 && attempts < maxAttempts) {
        continue;
      }
      throw err;
    }
  }

  // Audit Log
  try {
    await auditLogService.logAuditEvent({
      action: "ORGANIZATION_INVITE_CODE_GENERATED",
      entityType: "Organization",
      entityId: orgId,
      performedBy: requesterId,
      newValue: {
        expiresAt: organization.inviteCodeExpiresAt,
      },
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
  // Validate input
  if (!inviteCode) {
    throw new BadRequestError("Invite code is required");
  }

  // Find organization by code
  const organization = await Organization.findOne({ inviteCode });
  if (!organization) {
    throw new NotFoundError("Invalid or non-existent invite code");
  }

  // Check expiry
  if (
    organization.inviteCodeExpiresAt &&
    new Date() > organization.inviteCodeExpiresAt
  ) {
    throw new BadRequestError("Invite code has expired");
  }

  // Check if user is already a member
  const existingMembership = await OrganizationMember.findOne({
    user: userId,
    organization: organization._id,
  });

  if (existingMembership) {
    // 409 Conflict typically, ensuring we don't duplicate
    const error = new Error("You are already a member of this organization");
    error.statusCode = 409;
    throw error;
  }

  // Create membership
  const membership = await OrganizationMember.create({
    user: userId,
    organization: organization._id,
    role: "MEMBER",
  });

  // Audit Log
  try {
    await auditLogService.logAuditEvent({
      action: "ORGANIZATION_JOINED_VIA_CODE",
      entityType: "Organization",
      entityId: organization._id,
      performedBy: userId,
      newValue: {
        role: "MEMBER",
        method: "INVITE_CODE",
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return {
    organization: {
      id: organization._id,
      name: organization.name,
    },
    role: membership.role,
  };
};

module.exports = {
  createOrganization,
  inviteMember,
  getOrganizationMembers,
  canViewMembers,
  generateInviteCode,
  joinOrganizationByCode,
};
