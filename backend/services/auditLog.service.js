const AuditLog = require("../models/auditLog.model");

const logAuditEvent = async ({
  action,
  entityType,
  entityId,
  performedBy,
  oldValue,
  newValue,
}) => {
  await AuditLog.create({
    action,
    entityType,
    entityId,
    performedBy,
    oldValue,
    newValue,
  });
};

const getAuditLogs = async ({ entityType, entityId }) => {
  const query = {};

  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;

  const logs = await AuditLog.find(query)
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 });

  return logs;
};

module.exports = {logAuditEvent,getAuditLogs,};