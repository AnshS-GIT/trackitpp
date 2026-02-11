const AppError = require("./AppError");

/**
 * 409 Conflict Error
 * Used when request conflicts with current state (e.g., duplicate resource)
 */
class ConflictError extends AppError {
  constructor(message = "Conflict", details = null) {
    super(message, 409, "CONFLICT", details);
  }
}

module.exports = ConflictError;
