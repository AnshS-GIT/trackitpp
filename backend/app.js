const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const issueRoutes = require("./routes/issue.routes");
const auditLogRoutes = require("./routes/auditLog.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
