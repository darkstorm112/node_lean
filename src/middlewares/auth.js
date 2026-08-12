const authService = require('../services/authService');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * JWT 认证中间件
 * 验证请求头中的 JWT Token
 * 所有响应的 HTTP 状态码都是 200
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(200).json(error('未提供认证令牌', 401));
    }

    // 验证格式：Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(200).json(error('认证令牌格式错误', 401));
    }

    const token = parts[1];

    // 验证 token
    const decoded = authService.verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
      roles: decoded.roles || []
    };

    next();
  } catch (err) {
    logger.warn('认证失败:', err.message);
    return res.status(200).json(error(err.message || '认证失败', 401));
  }
};

/**
 * 可选认证中间件
 * Token 存在则验证，不存在也允许通过
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = authService.verifyToken(token);
        req.user = {
          id: decoded.id,
          username: decoded.username,
          roles: decoded.roles || []
        };
      }
    }

    next();
  } catch (err) {
    // 可选认证失败不阻止请求
    logger.warn('可选认证失败:', err.message);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
