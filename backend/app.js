const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

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

const allowedOrigins = [
  "http://localhost:5173",
  "https://trackitpp.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Request logging middleware
app.use(requestLogger);

app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", issueRoutes);
app.use("/api", auditLogRoutes);
app.use("/api", organizationRoutes);
app.use("/api", contributionRoutes);
app.use("/api", proofRoutes);
app.use("/api", proofReviewRoutes);

app.use(errorHandler);

module.exports = app;
