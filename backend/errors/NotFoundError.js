const AppError = require("./AppError");

/**
 * 404 Not Found Error
 * Used when requested resource does not exist
 */
class NotFoundError extends AppError {
  constructor(message = "Not Found", details = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}

module.exports = NotFoundError;
