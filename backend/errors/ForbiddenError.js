const AppError = require("./AppError");

/**
 * 403 Forbidden Error
 * Used when user lacks permission to access resource
 */
class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details = null) {
    super(message, 403, "FORBIDDEN", details);
  }
}

module.exports = ForbiddenError;
