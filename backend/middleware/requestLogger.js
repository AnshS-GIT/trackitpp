const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

/**
 * Request logging middleware
 * Generates unique requestId and logs request details on completion
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  const requestId = uuidv4();

  // Attach to request context
  req.context = { requestId };

  // Capture start time
  const startTime = Date.now();

  // Log on response finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    logger.request({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};

module.exports = requestLogger;
