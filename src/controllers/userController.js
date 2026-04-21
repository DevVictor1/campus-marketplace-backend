const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Service = require("../models/Service");
const Review = require("../models/Review");
const { sendSuccess, sendError } = require("../utils/response");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return sendSuccess(res, 200, "Profile fetched successfully", { user });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching profile");
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Your products fetched successfully", { products });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching your products");
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .populate("provider", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Your services fetched successfully", { services });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching your services");
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ targetUser: req.user._id })
      .populate("reviewer", "name email role")
      .populate("product", "title")
      .populate("service", "title")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Your reviews fetched successfully", { reviews });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching your reviews");
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const [totalProducts, totalServices, totalReviews, user] = await Promise.all([
      Product.countDocuments({ seller: req.user._id }),
      Service.countDocuments({ provider: req.user._id }),
      Review.countDocuments({ targetUser: req.user._id }),
      User.findById(req.user._id).select("rating"),
    ]);

    return sendSuccess(res, 200, "Dashboard summary fetched successfully", {
      totalProducts,
      totalServices,
      totalReviews,
      averageRating: user?.rating || 0,
    });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching dashboard summary");
  }
};

const getPublicUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const user = await User.findById(userId).select(
      "_id name role location rating createdAt"
    );

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Public user profile fetched successfully", { user });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching public user profile");
  }
};

const getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const products = await Product.find({
      seller: userId,
      status: "available",
    })
      .populate("seller", "name role location rating")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "User products fetched successfully", { products });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching user products");
  }
};

const getUserServices = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const services = await Service.find({ provider: userId })
      .populate("provider", "name role location rating")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "User services fetched successfully", { services });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching user services");
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const reviews = await Review.find({ targetUser: userId })
      .populate("reviewer", "name role rating")
      .populate("product", "title")
      .populate("service", "title")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "User reviews fetched successfully", { reviews });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching user reviews");
  }
};

module.exports = {
  getMyProfile,
  getMyProducts,
  getMyServices,
  getMyReviews,
  getDashboardSummary,
  getPublicUserProfile,
  getUserProducts,
  getUserServices,
  getUserReviews,
};
