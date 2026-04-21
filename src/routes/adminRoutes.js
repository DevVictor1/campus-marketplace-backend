const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getAllProductsAdmin,
  getAllServicesAdmin,
  deleteUserAdmin,
  deleteProductAdmin,
  deleteServiceAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/products", protect, adminOnly, getAllProductsAdmin);
router.get("/services", protect, adminOnly, getAllServicesAdmin);
router.delete("/users/:id", protect, adminOnly, deleteUserAdmin);
router.delete("/products/:id", protect, adminOnly, deleteProductAdmin);
router.delete("/services/:id", protect, adminOnly, deleteServiceAdmin);

module.exports = router;
