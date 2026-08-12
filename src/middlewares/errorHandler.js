const logger = require('../utils/logger');
const { error } = require('../utils/response');

/**
 * 统一异常处理中间件
 * 所有响应的 HTTP 状态码都是 200，业务错误通过 code 字段区分
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    error: err.stack,
    user: req.user?.id,
    ip: req.ip
  });

  // 已知的业务错误
  if (err.name === 'ValidationError') {
    return res.status(200).json(error(err.message, 400, err.details));
  }

  if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    return res.status(200).json(error('未授权，请先登录', 401));
  }

  if (err.name === 'ForbiddenError' || err.message === 'Forbidden') {
    return res.status(200).json(error('无权限访问', 403));
  }

  if (err.name === 'NotFoundError') {
    return res.status(200).json(error('资源不存在', 404));
  }

  // 数据库错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(200).json(error('数据已存在', 409));
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(200).json(error('数据验证失败', 400, err.errors));
  }

  // 未知错误
  const errorCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? '服务器错误'
    : err.message;

  res.status(200).json(error(message, errorCode));
};

/**
 * 404 处理
 */
const notFound = (req, res) => {
  res.status(200).json(error('接口不存在', 404));
};

module.exports = {
  errorHandler,
  notFound
};
