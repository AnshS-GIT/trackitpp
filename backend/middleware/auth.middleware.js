const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

const protect = (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // If it's already an AppError, just pass it on
    if (error.isOperational) {
      next(error);
    } else {
      // Otherwise wrap JWT errors as UnauthorizedError
      next(new UnauthorizedError("Not authorized, invalid token"));
    }
  }
};

module.exports = protect;
