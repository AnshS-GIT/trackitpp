const AppError = require("./AppError");

/**
 * 400 Bad Request Error
 * Used when request parameters are invalid
 */
class BadRequestError extends AppError {
  constructor(message = "Bad Request", details = null) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

module.exports = BadRequestError;
