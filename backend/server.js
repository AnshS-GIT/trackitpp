const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, { port: PORT });
});
