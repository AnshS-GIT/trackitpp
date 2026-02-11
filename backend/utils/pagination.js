const { BadRequestError } = require("../errors");

/**
 * Parse and validate pagination query parameters
 * @param {Object} query - Query parameters from request
 * @returns {Object} { page, limit, skip }
 */
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  // Validate page
  if (page < 1) {
    throw new BadRequestError("Page must be greater than or equal to 1");
  }

  // Validate limit
  if (limit < 1) {
    throw new BadRequestError("Limit must be greater than or equal to 1");
  }

  // Cap limit at 50
  if (limit > 50) {
    limit = 50;
  }

  // Calculate skip for MongoDB
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format paginated response
 * @param {Array} data - Array of data items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total count of items
 * @returns {Object} Formatted response with data and pagination
 */
const formatPaginatedResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

module.exports = {
  parsePaginationParams,
  formatPaginatedResponse,
};
