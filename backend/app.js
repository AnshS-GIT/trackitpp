const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimiter = require("./middleware/rateLimiter");

const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const issueRoutes = require("./routes/issue.routes");
const auditLogRoutes = require("./routes/auditLog.routes");
const organizationRoutes = require("./routes/organization.routes");
const contributionRoutes = require("./routes/contribution.routes");
const proofRoutes = require("./routes/proof.routes");
const proofReviewRoutes = require("./routes/proofReview.routes");

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ["http://localhost:5173", "https://trackitpp.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // In production, you might want to restrict this further
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// 3. Rate Limiting
app.use("/api", rateLimiter);

// 4. Body Parsers
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));

// 5. Sanitization
app.use((req, res, next) => {
  // Sanitize body and params
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  // Skip query sanitization to avoid read-only error
  next();
});
// app.use(xss()); // Removed deprecated package

// 6. Request Logging
app.use(requestLogger);

// 7. Routes
app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", issueRoutes);
app.use("/api", auditLogRoutes);
app.use("/api", organizationRoutes);
app.use("/api", contributionRoutes);
app.use("/api", proofRoutes);
app.use("/api", proofReviewRoutes);

// 8. Error Handler
app.use(errorHandler);

module.exports = app;
