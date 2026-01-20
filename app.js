const express = require("express");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(healthRoutes);

app.use(errorHandler);

module.exports = app;
