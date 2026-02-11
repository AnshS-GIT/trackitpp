const isProduction = process.env.NODE_ENV === "production";

/**
 * Sanitize sensitive data from logs
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitize = (data) => {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const sensitive = ["password", "token", "authorization", "secret"];
  const sanitized = { ...data };

  sensitive.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};

/**
 * Structured logger with environment awareness
 */
const logger = {
  /**
   * Log info message
   * @param {String} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info: (message, meta = {}) => {
    const log = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...sanitize(meta),
    };
    console.log(JSON.stringify(log));
  },

  /**
   * Log error message
   * @param {String} message - Error message
   * @param {Error} error - Error object
   * @param {Object} meta - Additional metadata
   */
  error: (message, error, meta = {}) => {
    const log = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        code: error?.code,
        stack: !isProduction ? error?.stack : undefined,
      },
      ...sanitize(meta),
    };
    console.error(JSON.stringify(log));
  },

  /**
   * Log HTTP request (development only for verbosity control)
   * @param {Object} data - Request data
   */
  request: (data) => {
    if (!isProduction) {
      const log = {
        level: "request",
        timestamp: new Date().toISOString(),
        ...sanitize(data),
      };
      console.log(JSON.stringify(log));
    }
  },
};

module.exports = logger;
