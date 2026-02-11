const rateLimit = require("express-rate-limit");
const { AppError } = require("../errors");

/**
 * Rate limiter middleware
 * Limits requests to 100 per 15 minutes by default
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(
      new AppError(
        "Too many requests from this IP, please try again later",
        429
      )
    );
  },
});

module.exports = limiter;
