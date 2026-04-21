const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getMyProfile,
  getMyProducts,
  getMyServices,
  getMyReviews,
  getDashboardSummary,
  getPublicUserProfile,
  getUserProducts,
  getUserServices,
  getUserReviews,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.get("/me/products", protect, getMyProducts);
router.get("/me/services", protect, getMyServices);
router.get("/me/reviews", protect, getMyReviews);
router.get("/me/dashboard", protect, getDashboardSummary);
router.get("/:userId/products", getUserProducts);
router.get("/:userId/services", getUserServices);
router.get("/:userId/reviews", getUserReviews);
router.get("/:userId", getPublicUserProfile);

module.exports = router;
