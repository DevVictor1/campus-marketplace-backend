const { sendError } = require("../utils/response");

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, "Authentication is required");
  }

  if (req.user.role !== "admin") {
    return sendError(res, 403, "Admin access only");
  }

  next();
};

module.exports = adminOnly;
