const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 401, "Authorization token is missing");
    }

    if (!authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Authorization token must use Bearer format");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return sendError(res, 401, "Authorization token is missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "User not found for this token");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token");
  }
};

module.exports = protect;
