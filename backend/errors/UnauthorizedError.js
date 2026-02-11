const AppError = require("./AppError");

/**
 * 401 Unauthorized Error
 * Used when authentication fails or is missing
 */
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details = null) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

module.exports = UnauthorizedError;
