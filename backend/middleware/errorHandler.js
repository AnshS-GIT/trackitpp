const logger = require("../utils/logger");

/**
 * Global error handler middleware
 * Formats errors into consistent response structure
 */
function errorHandler(err, req, res, _next) {
  const requestId = req.context?.requestId;

  // Handle operational errors (AppError instances)
  if (err.isOperational) {
    // Log operational error
    logger.error("Operational error", err, {
      requestId,
      method: req.method,
      path: req.path,
    });

    const response = {
      code: err.code,
      message: err.message,
    };

    // Include details if present
    if (err.details) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle unexpected errors - log but don't expose details
  logger.error("Unexpected error", err, {
    requestId,
    method: req.method,
    path: req.path,
  });

  const response = {
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    response.originalMessage = err.message;
  }

  return res.status(500).json(response);
}

module.exports = errorHandler;
