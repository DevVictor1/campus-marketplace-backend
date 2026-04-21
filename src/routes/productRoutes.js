const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAllProducts,
  getSingleProduct,
  getProductsBySeller,
} = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/seller/:sellerId", getProductsBySeller);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/:id", getSingleProduct);

module.exports = router;
