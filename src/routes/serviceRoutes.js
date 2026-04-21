const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createService,
  updateService,
  deleteService,
  searchServices,
  getAllServices,
  getSingleService,
  getServicesByProvider,
} = require("../controllers/serviceController");

const router = express.Router();

router.post("/", protect, createService);
router.get("/", getAllServices);
router.get("/search", searchServices);
router.get("/provider/:providerId", getServicesByProvider);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);
router.get("/:id", getSingleService);

module.exports = router;
