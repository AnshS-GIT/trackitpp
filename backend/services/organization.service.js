const mongoose = require("mongoose");
const Organization = require("../models/organization.model");
const OrganizationMember = require("../models/orgMember.model");
const auditLogService = require("./auditLog.service");

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

module.exports = {
  createOrganization,
};
