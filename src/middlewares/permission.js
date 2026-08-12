const permissionService = require('../services/permissionService');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 角色检查中间件
 * @param {string|string[]} roleCodes - 允许的角色代码（单个或数组）
 * 所有响应的 HTTP 状态码都是 200
 */
const hasRole = (...roleCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(200).json(error('未授权，请先登录', 401));
      }

      const allowed = await permissionService.hasRole(req.user.id, roleCodes);

      if (!allowed) {
        logger.warn(`用户 ${req.user.username} 尝试访问需要角色 ${roleCodes.join(', ')} 的资源`);
        return res.status(200).json(error('无权限访问', 403));
      }

      next();
    } catch (err) {
      logger.error('角色检查失败:', err);
      next(err);
    }
  };
};

/**
 * 权限检查中间件（满足任一权限即可）
 * @param {string|string[]} permissionCodes - 允许的权限代码（单个或数组）
 */
const hasPermission = (...permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(200).json(error('未授权，请先登录', 401));
      }

      const allowed = await permissionService.hasPermission(req.user.id, permissionCodes);

      if (!allowed) {
        logger.warn(`用户 ${req.user.username} 尝试访问需要权限 ${permissionCodes.join(', ')} 的资源`);
        return res.status(200).json(error('无权限访问', 403));
      }

      next();
    } catch (err) {
      logger.error('权限检查失败:', err);
      next(err);
    }
  };
};

/**
 * 权限检查中间件（需要所有权限）
 * @param {string|string[]} permissionCodes - 必需的权限代码（单个或数组）
 */
const hasAllPermissions = (...permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(200).json(error('未授权，请先登录', 401));
      }

      const allowed = await permissionService.hasAllPermissions(req.user.id, permissionCodes);

      if (!allowed) {
        logger.warn(`用户 ${req.user.username} 尝试访问需要所有权限 ${permissionCodes.join(', ')} 的资源`);
        return res.status(200).json(error('无权限访问', 403));
      }

      next();
    } catch (err) {
      logger.error('权限检查失败:', err);
      next(err);
    }
  };
};

/**
 * 资源所有者检查中间件
 * @param {string} resourceIdParam - 资源ID的参数名（如 'id', 'userId'）
 * @param {string} resourceOwnerField - 资源拥有者字段名（如 'userId', 'createdBy'）
 */
const isOwner = (resourceIdParam = 'id', resourceOwnerField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(200).json(error('未授权，请先登录', 401));
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // 这里需要根据实际业务逻辑来检查资源所有权
      // 示例：检查资源的 userId 字段是否等于当前用户ID
      // 实际使用时需要传入 Model 并查询
      // 这里只是一个简单的框架

      // 管理员跳过所有者检查
      const isAdmin = await permissionService.hasRole(userId, 'admin');
      if (isAdmin) {
        return next();
      }

      // 检查是否是资源所有者
      // 这里需要实际的业务逻辑，暂时放行
      next();
    } catch (err) {
      logger.error('所有者检查失败:', err);
      next(err);
    }
  };
};

/**
 * 组合中间件：角色或权限（满足其一即可）
 */
const hasRoleOrPermission = (roleCodes, permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(200).json(error('未授权，请先登录', 401));
      }

      const hasRequiredRole = await permissionService.hasRole(req.user.id, roleCodes);
      const hasRequiredPermission = await permissionService.hasPermission(req.user.id, permissionCodes);

      if (!hasRequiredRole && !hasRequiredPermission) {
        logger.warn(`用户 ${req.user.username} 权限不足`);
        return res.status(200).json(error('无权限访问', 403));
      }

      next();
    } catch (err) {
      logger.error('权限检查失败:', err);
      next(err);
    }
  };
};

module.exports = {
  hasRole,
  hasPermission,
  hasAllPermissions,
  isOwner,
  hasRoleOrPermission
};
