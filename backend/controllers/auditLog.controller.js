const { getAuditLogs } = require("../services/auditLog.service");

const fetchAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId, page, limit } = req.query;

    const result = await getAuditLogs({ entityType, entityId, page, limit });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {fetchAuditLogs,};
