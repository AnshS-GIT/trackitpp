const mongoose = require("mongoose");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const auditLogService = require("./auditLog.service");

const User = require("../models/user.model");

const createOrganization = async ({ name, creatorId }) => {
  // Validation: Organization name must be unique per creator
  const existingOrg = await Organization.findOne({ name, createdBy: creatorId });
  if (existingOrg) {
    const error = new Error("You have already created an organization with this name");
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
        newValue: { name: organization.name },
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
  // Check if requester is a member
  const requesterMembership = await OrganizationMember.findOne({
    user: requesterId,
    organization: orgId,
  });

  if (!requesterMembership) {
    const error = new Error("You are not a member of this organization");
    error.statusCode = 403;
    throw error;
  }

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

module.exports = {
  createOrganization,
  inviteMember,
  getOrganizationMembers,
};
