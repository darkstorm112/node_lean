const { Permission, Role, User } = require('../models');
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
    const { name, code, resource, action, description, page, pageRoute } = permissionData;

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
      description,
      page,
      pageRoute
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

    const { name, description, page, pageRoute } = updateData;

    // 更新权限信息
    await permission.update({
      name: name || permission.name,
      description: description !== undefined ? description : permission.description,
      page: page !== undefined ? page : permission.page,
      pageRoute: pageRoute !== undefined ? pageRoute : permission.pageRoute
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

  /**
   * 检查用户是否拥有指定角色（满足任一即可）
   * @param {string} userId - 用户ID
   * @param {string|string[]} roleCodes - 角色代码（单个或数组）
   * @returns {Promise<boolean>}
   */
  async hasRole(userId, roleCodes) {
    const codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes];

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['code'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return false;
    }

    const userRoleCodes = user.roles.map(role => role.code);
    return codes.some(code => userRoleCodes.includes(code));
  }

  /**
   * 检查用户是否拥有指定权限（满足任一即可）
   * @param {string} userId - 用户ID
   * @param {string|string[]} permissionCodes - 权限代码（单个或数组）
   * @returns {Promise<boolean>}
   */
  async hasPermission(userId, permissionCodes) {
    const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes];

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['code'],
          through: { attributes: [] }
        }],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return false;
    }

    // 收集用户所有角色的所有权限
    const userPermissionCodes = [];
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (!userPermissionCodes.includes(permission.code)) {
          userPermissionCodes.push(permission.code);
        }
      });
    });

    return codes.some(code => userPermissionCodes.includes(code));
  }

  /**
   * 检查用户是否拥有所有指定权限
   * @param {string} userId - 用户ID
   * @param {string|string[]} permissionCodes - 权限代码（单个或数组）
   * @returns {Promise<boolean>}
   */
  async hasAllPermissions(userId, permissionCodes) {
    const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes];

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['code'],
          through: { attributes: [] }
        }],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return false;
    }

    // 收集用户所有角色的所有权限
    const userPermissionCodes = [];
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (!userPermissionCodes.includes(permission.code)) {
          userPermissionCodes.push(permission.code);
        }
      });
    });

    return codes.every(code => userPermissionCodes.includes(code));
  }

  /**
   * 获取用户的所有权限
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>}
   */
  async getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return [];
    }

    // 收集用户所有角色的所有权限（去重）
    const permissionsMap = new Map();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (!permissionsMap.has(permission.id)) {
          permissionsMap.set(permission.id, permission);
        }
      });
    });

    return Array.from(permissionsMap.values());
  }

  /**
   * 获取用户的所有角色
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>}
   */
  async getUserRoles(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return [];
    }

    return user.roles;
  }
}

module.exports = new PermissionService();
