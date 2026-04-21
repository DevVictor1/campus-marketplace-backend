const mongoose = require("mongoose");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");
const {
  getPaginationOptions,
  getSortOption,
  buildPaginatedData,
} = require("../utils/queryHelpers");

const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, image, location, status } = req.body;

    if (!title || !description || price === undefined || !category) {
      return sendError(res, 400, "Title, description, price, and category are required");
    }

    if (Number(price) < 0) {
      return sendError(res, 400, "Price cannot be negative");
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return sendError(res, 401, "Authenticated user is required to create a product");
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image,
      seller: req.user._id,
      location,
      status,
    });

    const populatedProduct = await product.populate("seller", "name email role");

    return sendSuccess(res, 201, "Product created successfully", {
      product: populatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while creating product");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, image, location, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You are not allowed to update this product");
    }

    if (price !== undefined && Number(price) < 0) {
      return sendError(res, 400, "Price cannot be negative");
    }

    if (title !== undefined) {
      product.title = title.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (image !== undefined) {
      product.image = image;
    }

    if (location !== undefined) {
      product.location = location;
    }

    if (status !== undefined) {
      product.status = status;
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate("seller", "name email role");

    return sendSuccess(res, 200, "Product updated successfully", {
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while updating product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You are not allowed to delete this product");
    }

    await product.deleteOne();

    return sendSuccess(res, 200, "Product deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Server error while deleting product");
  }
};

const searchProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      location,
      status,
      page,
      limit,
      sort,
    } = req.query;
    const filters = {};
    const pagination = getPaginationOptions({ page, limit });
    const sortConfig = getSortOption(sort);

    if (pagination.error) {
      return sendError(res, 400, pagination.error);
    }

    if (sortConfig.error) {
      return sendError(res, 400, sortConfig.error);
    }

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      filters.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }

    if (status) {
      filters.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};

      if (minPrice !== undefined) {
        if (Number.isNaN(Number(minPrice))) {
          return sendError(res, 400, "minPrice must be a valid number");
        }

        filters.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        if (Number.isNaN(Number(maxPrice))) {
          return sendError(res, 400, "maxPrice must be a valid number");
        }

        filters.price.$lte = Number(maxPrice);
      }
    }

    const totalItems = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .populate("seller", "name email role")
      .sort(sortConfig.sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(
      res,
      200,
      "Products fetched successfully",
      buildPaginatedData(products, totalItems, pagination.page, pagination.limit)
    );
  } catch (error) {
    return sendError(res, 500, "Server error while searching products");
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { page, limit, sort } = req.query;
    const pagination = getPaginationOptions({ page, limit });
    const sortConfig = getSortOption(sort);

    if (pagination.error) {
      return sendError(res, 400, pagination.error);
    }

    if (sortConfig.error) {
      return sendError(res, 400, sortConfig.error);
    }

    const totalItems = await Product.countDocuments();
    const products = await Product.find()
      .populate("seller", "name email role")
      .sort(sortConfig.sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(
      res,
      200,
      "Products fetched successfully",
      buildPaginatedData(products, totalItems, pagination.page, pagination.limit)
    );
  } catch (error) {
    return sendError(res, 500, "Server error while fetching products");
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const product = await Product.findById(id).populate("seller", "name email role");

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, "Product fetched successfully", { product });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching product");
  }
};

const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return sendError(res, 400, "Invalid seller id");
    }

    const products = await Product.find({ seller: sellerId })
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Seller products fetched successfully", {
      products,
    });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching seller products");
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAllProducts,
  getSingleProduct,
  getProductsBySeller,
};
