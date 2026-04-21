const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const Service = require("../models/Service");
const { sendSuccess, sendError } = require("../utils/response");

const recalculateUserRating = async (targetUserId) => {
  const reviewStats = await Review.aggregate([
    {
      $match: {
        targetUser: new mongoose.Types.ObjectId(targetUserId),
      },
    },
    {
      $group: {
        _id: "$targetUser",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const nextRating =
    reviewStats.length > 0 ? Number(reviewStats[0].averageRating.toFixed(1)) : 0;

  await User.findByIdAndUpdate(targetUserId, { rating: nextRating });
};

const createReview = async (req, res) => {
  try {
    const { product, service, rating, comment } = req.body;

    if (!product && !service) {
      return sendError(res, 400, "A review must belong to a product or a service");
    }

    if (product && service) {
      return sendError(res, 400, "A review can belong to only one product or one service");
    }

    if (rating === undefined) {
      return sendError(res, 400, "Rating is required");
    }

    let targetUserId;
    let existingReview;

    if (product) {
      if (!mongoose.Types.ObjectId.isValid(product)) {
        return sendError(res, 400, "Invalid product id");
      }

      const productDoc = await Product.findById(product);

      if (!productDoc) {
        return sendError(res, 404, "Product not found");
      }

      targetUserId = productDoc.seller;
      existingReview = await Review.findOne({
        reviewer: req.user._id,
        product,
      });
    }

    if (service) {
      if (!mongoose.Types.ObjectId.isValid(service)) {
        return sendError(res, 400, "Invalid service id");
      }

      const serviceDoc = await Service.findById(service);

      if (!serviceDoc) {
        return sendError(res, 404, "Service not found");
      }

      targetUserId = serviceDoc.provider;
      existingReview = await Review.findOne({
        reviewer: req.user._id,
        service,
      });
    }

    if (targetUserId.toString() === req.user._id.toString()) {
      return sendError(res, 400, "You cannot review yourself");
    }

    if (existingReview) {
      return sendError(res, 400, "You have already reviewed this item");
    }

    const review = await Review.create({
      reviewer: req.user._id,
      targetUser: targetUserId,
      product,
      service,
      rating: Number(rating),
      comment,
    });

    await recalculateUserRating(targetUserId);

    const populatedReview = await Review.findById(review._id)
      .populate("reviewer", "name email role")
      .populate("targetUser", "name email role rating")
      .populate("product", "title")
      .populate("service", "title");

    return sendSuccess(res, 201, "Review created successfully", {
      review: populatedReview,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while creating review");
  }
};

const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const reviews = await Review.find({ targetUser: userId })
      .populate("reviewer", "name email role")
      .populate("product", "title")
      .populate("service", "title")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Reviews fetched successfully", { reviews });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching reviews");
  }
};

module.exports = {
  createReview,
  getReviewsForUser,
};
