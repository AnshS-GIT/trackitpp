const AuditLog = require("../models/auditLog.model");
const { parsePaginationParams, formatPaginatedResponse } = require("../utils/pagination");

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

const getAuditLogs = async ({ entityType, entityId, page, limit }) => {
  // Parse and validate pagination params
  const { skip, page: validPage, limit: validLimit } = parsePaginationParams({ page, limit });

  const query = {};

  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;

  // Execute query with pagination and get total count
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("performedBy", "name email role")
      .skip(skip)
      .limit(validLimit)
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments(query),
  ]);

  return formatPaginatedResponse(logs, validPage, validLimit, total);
};

module.exports = {logAuditEvent,getAuditLogs,};