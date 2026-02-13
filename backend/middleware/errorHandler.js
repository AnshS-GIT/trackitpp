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

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    logger.error("Duplicate key error", err, {
      requestId,
      method: req.method,
      path: req.path,
    });
    return res.status(409).json({
      code: "DUPLICATE_KEY",
      message: `A record with this ${field} already exists`,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    logger.error("Cast error", err, {
      requestId,
      method: req.method,
      path: req.path,
    });
    return res.status(400).json({
      code: "INVALID_ID",
      message: `Invalid ${err.path}: ${err.value}`,
    });
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
