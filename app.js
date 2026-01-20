const express = require("express");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/error-test", (req, res, next) => {
  const err = new Error("Test error");
  err.statusCode = 400;
  next(err);
});

app.use(errorHandler);

module.exports = app;
