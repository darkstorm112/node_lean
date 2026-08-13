const { Role, Permission } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 角色服务
 */
class RoleService {
  /**
   * 获取角色列表（分页、搜索）
   */
  async getRoleList(params) {
    const { page = 1, pageSize = 10, name, code, status } = params;

    // 构建查询条件
    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }
    if (status) {
      where.status = status;
    }

    // 查询
    const { count, rows } = await Role.findAndCountAll({
      where,
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'name', 'code'],
        through: { attributes: [] }
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']],
      distinct: true  // 关键：使用 distinct 确保 count 只统计角色数量，而不是关联记录数量
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
   * 获取所有角色（不分页）
   */
  async getAllRoles() {
    return await Role.findAll({
      attributes: ['id', 'name', 'code', 'description', 'status'],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * 根据 ID 获取角色
   */
  async getRoleById(id) {
    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'name', 'code', 'resource', 'action'],
        through: { attributes: [] }
      }]
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    return role;
  }

  /**
   * 创建角色
   */
  async createRole(roleData) {
    const { name, code, description, permissionIds } = roleData;

    // 检查角色编码是否已存在
    const existingRole = await Role.findOne({ where: { code } });
    if (existingRole) {
      throw new Error('角色编码已存在');
    }

    // 创建角色
    const role = await Role.create({
      name,
      code,
      description,
      status: 'active'
    });

    // 分配权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(permissions);
    }

    logger.info(`角色创建成功: ${name}`);

    // 返回角色信息（包含权限）
    return this.getRoleById(role.id);
  }

  /**
   * 更新角色
   */
  async updateRole(id, updateData) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('角色不存在');
    }

    // 不允许修改管理员角色的编码和状态
    if (role.code === 'admin') {
      if (updateData.code && updateData.code !== 'admin') {
        throw new Error('不能修改管理员角色编码');
      }
      if (updateData.status && updateData.status !== 'active') {
        throw new Error('不能禁用管理员角色');
      }
    }

    const { name, description, status, permissionIds } = updateData;

    // 更新角色信息
    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description,
      status: status || role.status
    });

    // 更新权限
    if (permissionIds !== undefined) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(permissions);
    }

    logger.info(`角色更新成功: ${role.name}`);

    // 返回更新后的角色信息
    return this.getRoleById(id);
  }

  /**
   * 删除角色
   */
  async deleteRole(id) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('角色不存在');
    }

    // 不允许删除管理员角色
    if (role.code === 'admin') {
      throw new Error('不能删除管理员角色');
    }

    await role.destroy();
    logger.info(`角色删除成功: ${role.name}`);
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(id) {
    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    return role.permissions || [];
  }

  /**
   * 分配角色权限
   */
  async assignPermissions(id, permissionIds) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('角色不存在');
    }

    const permissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    await role.setPermissions(permissions);
    logger.info(`角色权限分配成功: ${role.name}, 权限数量: ${permissions.length}`);
  }
}

module.exports = new RoleService();
