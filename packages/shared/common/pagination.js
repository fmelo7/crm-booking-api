const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const normalizePagination = ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) => {
  const normalizedPage = Math.max(Number(page) || DEFAULT_PAGE, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

const paginate = async (model, query = {}, options = {}) => {
  const { page, limit, skip } = normalizePagination(options);
  let findQuery = model.find(query).sort(options.sort || { createdAt: -1 }).skip(skip).limit(limit);

  if (options.populate) {
    findQuery = findQuery.populate(options.populate);
  }

  const [data, total] = await Promise.all([
    findQuery,
    model.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  normalizePagination,
  paginate,
};
