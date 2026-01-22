const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Access denied");
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = authorizeRoles;
