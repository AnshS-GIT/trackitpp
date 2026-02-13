const mongoose = require("mongoose");
const Invitation = require("../models/invitation.model");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const User = require("../models/user.model");
const auditLogService = require("./auditLog.service");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../errors");

/**
 * Create a pending invitation for a user to join an organization.
 */
const createInvitation = async ({ orgId, email, role, requesterId }) => {
  // Validate requester has permission (only OWNER/ADMIN can invite)
  const requesterMembership = await OrganizationMember.findOne({
    user: requesterId,
    organization: orgId,
  });

  if (!requesterMembership) {
    throw new ForbiddenError("You are not a member of this organization");
  }

  if (!["OWNER", "ADMIN"].includes(requesterMembership.role)) {
    throw new ForbiddenError("Only owners or admins can invite members");
  }

  // Find the organization
  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  // Find user to invite
  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    throw new NotFoundError("No user found with this email address");
  }

  // Check if already a member
  const existingMember = await OrganizationMember.findOne({
    user: userToInvite._id,
    organization: orgId,
  });
  if (existingMember) {
    throw new BadRequestError("User is already a member of this organization");
  }

  // Check if there's already a pending invitation
  const existingInvite = await Invitation.findOne({
    organization: orgId,
    invitedUser: userToInvite._id,
    status: "PENDING",
  });
  if (existingInvite) {
    throw new BadRequestError(
      "An invitation is already pending for this user"
    );
  }

  // Create the pending invitation
  const invitation = await Invitation.create({
    organization: orgId,
    invitedUser: userToInvite._id,
    invitedBy: requesterId,
    role: role || "MEMBER",
    status: "PENDING",
  });

  // Audit Log
  try {
    await auditLogService.logAuditEvent({
      action: "ORG_INVITATION_SENT",
      entityType: "Organization",
      entityId: orgId,
      performedBy: requesterId,
      newValue: {
        invitedUser: userToInvite._id,
        role: invitation.role,
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return invitation;
};

/**
 * Get all pending invitations for a user.
 */
const getMyInvitations = async (userId) => {
  const invitations = await Invitation.find({
    invitedUser: userId,
    status: "PENDING",
  })
    .populate("organization", "name visibility")
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });

  return invitations.map((inv) => ({
    id: inv._id,
    organization: {
      id: inv.organization._id,
      name: inv.organization.name,
    },
    invitedBy: {
      name: inv.invitedBy.name,
      email: inv.invitedBy.email,
    },
    role: inv.role,
    createdAt: inv.createdAt,
  }));
};

/**
 * Accept a pending invitation — creates the OrgMember record.
 */
const acceptInvitation = async ({ invitationId, userId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new NotFoundError("Invitation not found");
  }

  if (invitation.invitedUser.toString() !== userId.toString()) {
    throw new ForbiddenError("This invitation is not for you");
  }

  if (invitation.status !== "PENDING") {
    throw new BadRequestError("This invitation has already been responded to");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Mark invitation as accepted
    invitation.status = "ACCEPTED";
    await invitation.save({ session });

    // Create organization membership
    await OrganizationMember.create(
      [
        {
          user: userId,
          organization: invitation.organization,
          role: invitation.role,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Audit Log
    try {
      await auditLogService.logAuditEvent({
        action: "ORG_INVITATION_ACCEPTED",
        entityType: "Organization",
        entityId: invitation.organization,
        performedBy: userId,
        newValue: { role: invitation.role },
      });
    } catch (auditError) {
      console.error("Failed to log audit event:", auditError);
    }

    // Fetch org name for response
    const org = await Organization.findById(invitation.organization).select(
      "name"
    );

    return {
      organization: {
        id: invitation.organization,
        name: org?.name || "Unknown",
      },
      role: invitation.role,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Decline a pending invitation.
 */
const declineInvitation = async ({ invitationId, userId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new NotFoundError("Invitation not found");
  }

  if (invitation.invitedUser.toString() !== userId.toString()) {
    throw new ForbiddenError("This invitation is not for you");
  }

  if (invitation.status !== "PENDING") {
    throw new BadRequestError("This invitation has already been responded to");
  }

  invitation.status = "DECLINED";
  await invitation.save();

  // Audit Log
  try {
    await auditLogService.logAuditEvent({
      action: "ORG_INVITATION_DECLINED",
      entityType: "Organization",
      entityId: invitation.organization,
      performedBy: userId,
    });
  } catch (auditError) {
    console.error("Failed to log audit event:", auditError);
  }

  return { message: "Invitation declined" };
};

module.exports = {
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
};
