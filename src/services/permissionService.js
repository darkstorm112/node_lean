const { Permission } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 权限服务
 */
class PermissionService {
  /**
   * 获取所有权限
   */
  async getAllPermissions() {
    return await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
  }

  /**
   * 获取权限列表（分页、搜索）
   */
  async getPermissionList(params) {
    const { page = 1, pageSize = 10, resource, action } = params;

    // 构建查询条件
    const where = {};
    if (resource) {
      where.resource = resource;
    }
    if (action) {
      where.action = { [Op.like]: `%${action}%` };
    }

    // 查询
    const { count, rows } = await Permission.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    return {
      items: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据 ID 获取权限
   */
  async getPermissionById(id) {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      throw new Error('权限不存在');
    }

    return permission;
  }

  /**
   * 创建权限
   */
  async createPermission(permissionData) {
    const { name, code, resource, action, description } = permissionData;

    // 检查权限编码是否已存在
    const existingPermission = await Permission.findOne({ where: { code } });
    if (existingPermission) {
      throw new Error('权限编码已存在');
    }

    // 创建权限
    const permission = await Permission.create({
      name,
      code,
      resource,
      action,
      description
    });

    logger.info(`权限创建成功: ${name}`);
    return permission;
  }

  /**
   * 更新权限
   */
  async updatePermission(id, updateData) {
    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new Error('权限不存在');
    }

    const { name, description } = updateData;

    // 更新权限信息
    await permission.update({
      name: name || permission.name,
      description: description !== undefined ? description : permission.description
    });

    logger.info(`权限更新成功: ${permission.name}`);
    return permission;
  }

  /**
   * 删除权限
   */
  async deletePermission(id) {
    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new Error('权限不存在');
    }

    await permission.destroy();
    logger.info(`权限删除成功: ${permission.name}`);
  }
}

module.exports = new PermissionService();
