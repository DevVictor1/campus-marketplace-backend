const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Service = require("../models/Service");
const { sendSuccess, sendError } = require("../utils/response");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Users fetched successfully", { users });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching users");
  }
};

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Products fetched successfully", { products });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching products");
  }
};

const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("provider", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Services fetched successfully", { services });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching services");
  }
};

const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user id");
    }

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    await user.deleteOne();

    return sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Server error while deleting user");
  }
};

const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    await product.deleteOne();

    return sendSuccess(res, 200, "Product deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Server error while deleting product");
  }
};

const deleteServiceAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid service id");
    }

    const service = await Service.findById(id);

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    await service.deleteOne();

    return sendSuccess(res, 200, "Service deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Server error while deleting service");
  }
};

module.exports = {
  getAllUsers,
  getAllProductsAdmin,
  getAllServicesAdmin,
  deleteUserAdmin,
  deleteProductAdmin,
  deleteServiceAdmin,
};
