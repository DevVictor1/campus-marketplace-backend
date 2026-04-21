const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return sendError(res, 400, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone,
      location,
    });

    return sendSuccess(res, 201, "User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        rating: user.rating,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error during registration");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        rating: user.rating,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Server error during login");
  }
};

module.exports = {
  registerUser,
  loginUser,
};
