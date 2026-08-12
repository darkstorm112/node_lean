const roleService = require('../services/roleService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 角色管理控制器
 */
class RoleController {
  /**
   * 获取角色列表（分页）
   */
  async getRoleList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, name, code, status } = req.query;

      const result = await roleService.getRoleList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        name,
        code,
        status
      });

      res.json(success(result));
    } catch (err) {
      logger.error('获取角色列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取所有角色（不分页）
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await roleService.getAllRoles();
      res.json(success(roles));
    } catch (err) {
      logger.error('获取所有角色失败:', err);
      next(err);
    }
  }

  /**
   * 获取角色详情
   */
  async getRoleDetail(req, res, next) {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(parseInt(id));
      res.json(success(role));
    } catch (err) {
      logger.error('获取角色详情失败:', err);
      next(err);
    }
  }

  /**
   * 创建角色
   */
  async createRole(req, res, next) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).json(success(role, '角色创建成功', 201));
    } catch (err) {
      logger.error('创建角色失败:', err);
      next(err);
    }
  }

  /**
   * 更新角色
   */
  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const role = await roleService.updateRole(parseInt(id), req.body);
      res.json(success(role, '角色更新成功'));
    } catch (err) {
      logger.error('更新角色失败:', err);
      next(err);
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      await roleService.deleteRole(parseInt(id));
      res.json(success(null, '角色删除成功'));
    } catch (err) {
      logger.error('删除角色失败:', err);
      next(err);
    }
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const permissions = await roleService.getRolePermissions(parseInt(id));
      res.json(success(permissions));
    } catch (err) {
      logger.error('获取角色权限失败:', err);
      next(err);
    }
  }

  /**
   * 分配角色权限
   */
  async assignPermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;
      await roleService.assignPermissions(parseInt(id), permissionIds);
      res.json(success(null, '权限分配成功'));
    } catch (err) {
      logger.error('分配权限失败:', err);
      next(err);
    }
  }
}

module.exports = new RoleController();
