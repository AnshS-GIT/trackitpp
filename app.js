const express = require("express");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const issueRoutes = require("./routes/issue.routes");
const auditLogRoutes = require("./routes/auditLog.routes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(healthRoutes);
app.use(userRoutes);
app.use(issueRoutes);
app.use(auditLogRoutes);

app.use(errorHandler);

module.exports = app;
