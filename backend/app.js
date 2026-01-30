const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const issueRoutes = require("./routes/issue.routes");
const auditLogRoutes = require("./routes/auditLog.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://trackitpp.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", issueRoutes);
app.use("/api", auditLogRoutes);

app.use(errorHandler);

module.exports = app;
