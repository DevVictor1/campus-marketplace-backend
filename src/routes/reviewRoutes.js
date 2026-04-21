const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createReview,
  getReviewsForUser,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;
