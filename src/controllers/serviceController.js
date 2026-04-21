const mongoose = require("mongoose");
const Service = require("../models/Service");
const { sendSuccess, sendError } = require("../utils/response");
const {
  getPaginationOptions,
  getSortOption,
  buildPaginatedData,
} = require("../utils/queryHelpers");

const createService = async (req, res) => {
  try {
    const { title, description, price, category, location, availability } = req.body;

    if (!title || !description || price === undefined || !category) {
      return sendError(res, 400, "Title, description, price, and category are required");
    }

    if (Number(price) < 0) {
      return sendError(res, 400, "Price cannot be negative");
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return sendError(res, 401, "Authenticated user is required to create a service");
    }

    const service = await Service.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      provider: req.user._id,
      location,
      availability,
    });

    const populatedService = await service.populate("provider", "name email role");

    return sendSuccess(res, 201, "Service created successfully", {
      service: populatedService,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while creating service");
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, location, availability } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid service id");
    }

    const service = await Service.findById(id);

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You are not allowed to update this service");
    }

    if (price !== undefined && Number(price) < 0) {
      return sendError(res, 400, "Price cannot be negative");
    }

    if (title !== undefined) {
      service.title = title.trim();
    }

    if (description !== undefined) {
      service.description = description.trim();
    }

    if (price !== undefined) {
      service.price = Number(price);
    }

    if (category !== undefined) {
      service.category = category.trim();
    }

    if (location !== undefined) {
      service.location = location;
    }

    if (availability !== undefined) {
      service.availability = availability;
    }

    const updatedService = await service.save();
    await updatedService.populate("provider", "name email role");

    return sendSuccess(res, 200, "Service updated successfully", {
      service: updatedService,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while updating service");
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid service id");
    }

    const service = await Service.findById(id);

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You are not allowed to delete this service");
    }

    await service.deleteOne();

    return sendSuccess(res, 200, "Service deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Server error while deleting service");
  }
};

const searchServices = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      location,
      availability,
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

    if (availability) {
      filters.availability = availability;
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

    const totalItems = await Service.countDocuments(filters);
    const services = await Service.find(filters)
      .populate("provider", "name email role")
      .sort(sortConfig.sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(
      res,
      200,
      "Services fetched successfully",
      buildPaginatedData(services, totalItems, pagination.page, pagination.limit)
    );
  } catch (error) {
    return sendError(res, 500, "Server error while searching services");
  }
};

const getAllServices = async (req, res) => {
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

    const totalItems = await Service.countDocuments();
    const services = await Service.find()
      .populate("provider", "name email role")
      .sort(sortConfig.sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(
      res,
      200,
      "Services fetched successfully",
      buildPaginatedData(services, totalItems, pagination.page, pagination.limit)
    );
  } catch (error) {
    return sendError(res, 500, "Server error while fetching services");
  }
};

const getSingleService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid service id");
    }

    const service = await Service.findById(id).populate(
      "provider",
      "name email role"
    );

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    return sendSuccess(res, 200, "Service fetched successfully", { service });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching service");
  }
};

const getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return sendError(res, 400, "Invalid provider id");
    }

    const services = await Service.find({ provider: providerId })
      .populate("provider", "name email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Provider services fetched successfully", {
      services,
    });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching provider services");
  }
};

module.exports = {
  createService,
  updateService,
  deleteService,
  searchServices,
  getAllServices,
  getSingleService,
  getServicesByProvider,
};
