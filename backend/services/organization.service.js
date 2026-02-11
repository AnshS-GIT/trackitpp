const mongoose = require("mongoose");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const auditLogService = require("./auditLog.service");

const User = require("../models/user.model");

const createOrganization = async ({ name, creatorId, visibility = "PUBLIC" }) => {
  // Validation: Organization name must be unique per creator
  const existingOrg = await Organization.findOne({ name, createdBy: creatorId });
  if (existingOrg) {
    const error = new Error("You have already created an organization with this name");
    error.statusCode = 400;
    throw error;
  }

  // Validate visibility enum
  const validVisibilities = ["PUBLIC", "PRIVATE"];
  if (visibility && !validVisibilities.includes(visibility)) {
    const error = new Error(`Invalid visibility. Must be one of: ${validVisibilities.join(", ")}`);
    error.statusCode = 400;
    throw error;
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
  // Check requester permissions
  const requesterMembership = await OrganizationMember.findOne({
    user: requesterId,
    organization: orgId,
  });

  if (!requesterMembership) {
    const error = new Error("You are not a member of this organization");
    error.statusCode = 403;
    throw error;
  }

  if (!["OWNER", "ADMIN"].includes(requesterMembership.role)) {
    const error = new Error("Only OWNER or ADMIN can invite members");
    error.statusCode = 403;
    throw error;
  }

  // Check if user exists
  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Check for duplicate membership
  const existingMember = await OrganizationMember.findOne({
    user: userToInvite._id,
    organization: orgId,
  });

  if (existingMember) {
    const error = new Error("User is already a member of this organization");
    error.statusCode = 400;
    throw error;
  }

  const newMember = await OrganizationMember.create({
    user: userToInvite._id,
    organization: orgId,
    role: role || "MEMBER",
  });

  // Audit Log
  try {
    await auditLogService.logAuditEvent({
      action: "ORG_MEMBER_INVITED",
      entityType: "Organization",
      entityId: orgId,
      performedBy: requesterId,
      newValue: { user: userToInvite._id, role: newMember.role },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return newMember;
};

const getOrganizationMembers = async ({ orgId, requesterId }) => {
  // Fetch organization to check visibility
  const organization = await Organization.findById(orgId);
  
  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if requester can view members based on visibility rules
  const canView = await canViewMembers(orgId, requesterId);
  
  if (!canView) {
    const error = new Error("Access denied. You cannot view members of this organization.");
    error.statusCode = 403;
    throw error;
  }

  // Fetch and return members
  const members = await OrganizationMember.find({ organization: orgId })
    .populate("user", "name email")
    .select("role joinedAt user");

  return members.map((member) => ({
    id: member._id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinedAt: member.joinedAt,
  }));
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

module.exports = {
  createOrganization,
  inviteMember,
  getOrganizationMembers,
  canViewMembers,
};
