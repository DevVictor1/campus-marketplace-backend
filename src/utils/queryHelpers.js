const getPaginationOptions = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  if (!Number.isInteger(page) || page < 1) {
    return {
      error: "page must be a positive integer",
    };
  }

  if (!Number.isInteger(limit) || limit < 1) {
    return {
      error: "limit must be a positive integer",
    };
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getSortOption = (sort = "newest") => {
  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  if (!sortOptions[sort]) {
    return {
      error: "sort must be one of newest, price_asc, or price_desc",
    };
  }

  return {
    sortValue: sort,
    sortOption: sortOptions[sort],
  };
};

const buildPaginatedData = (items, totalItems, page, limit) => {
  return {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit) || 1,
    totalItems,
    results: items,
  };
};

module.exports = {
  getPaginationOptions,
  getSortOption,
  buildPaginatedData,
};
