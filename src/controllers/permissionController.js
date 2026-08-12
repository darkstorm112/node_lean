const permissionService = require('../services/permissionService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 权限管理控制器
 */
class PermissionController {
  /**
   * 获取所有权限
   */
  async getAllPermissions(req, res, next) {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.json(success(permissions));
    } catch (err) {
      logger.error('获取权限列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取权限列表（分页）
   */
  async getPermissionList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, resource, action } = req.query;

      const result = await permissionService.getPermissionList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        resource,
        action
      });

      res.json(success(result));
    } catch (err) {
      logger.error('获取权限列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取权限详情
   */
  async getPermissionDetail(req, res, next) {
    try {
      const { id } = req.params;
      const permission = await permissionService.getPermissionById(parseInt(id));
      res.json(success(permission));
    } catch (err) {
      logger.error('获取权限详情失败:', err);
      next(err);
    }
  }

  /**
   * 创建权限
   */
  async createPermission(req, res, next) {
    try {
      const permission = await permissionService.createPermission(req.body);
      res.status(201).json(success(permission, '权限创建成功', 201));
    } catch (err) {
      logger.error('创建权限失败:', err);
      next(err);
    }
  }

  /**
   * 更新权限
   */
  async updatePermission(req, res, next) {
    try {
      const { id } = req.params;
      const permission = await permissionService.updatePermission(parseInt(id), req.body);
      res.json(success(permission, '权限更新成功'));
    } catch (err) {
      logger.error('更新权限失败:', err);
      next(err);
    }
  }

  /**
   * 删除权限
   */
  async deletePermission(req, res, next) {
    try {
      const { id } = req.params;
      await permissionService.deletePermission(parseInt(id));
      res.json(success(null, '权限删除成功'));
    } catch (err) {
      logger.error('删除权限失败:', err);
      next(err);
    }
  }
}

module.exports = new PermissionController();
