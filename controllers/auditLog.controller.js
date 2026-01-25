const { getAuditLogs } = require("../services/auditLog.service");

const fetchAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;

    const logs = await getAuditLogs({ entityType, entityId });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {fetchAuditLogs,};
