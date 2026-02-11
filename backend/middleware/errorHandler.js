/**
 * Global error handler middleware
 * Formats errors into consistent response structure
 */
function errorHandler(err, req, res, _next) {
  // Handle operational errors (AppError instances)
  if (err.isOperational) {
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
  console.error("Unexpected Error:", err);

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
