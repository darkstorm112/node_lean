/**
 * 统一成功响应
 */
const success = (data = null, message = 'success', code = 200) => {
  return {
    code,
    message,
    data
  };
};

/**
 * 统一错误响应
 */
const error = (message = 'error', code = 400, error = null) => {
  return {
    code,
    message,
    error
  };
};

/**
 * 统一分页响应
 */
const paginate = (items, page, pageSize, total) => {
  return success({
    items,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
};

module.exports = {
  success,
  error,
  paginate
};
