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

module.exports = {
  logAuditEvent,
};
