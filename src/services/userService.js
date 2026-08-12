const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 用户服务
 */
class UserService {
  /**
   * 获取用户列表（分页、搜索）
   */
  async getUserList(params) {
    const { page = 1, pageSize = 10, username, email, status } = params;

    // 构建查询条件
    const where = {};
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (status) {
      where.status = status;
    }

    // 查询
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name'],
        through: { attributes: [] }
      }],
      attributes: { exclude: ['password'] },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
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
   * 根据 ID 获取用户
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description'],
        through: { attributes: [] }
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    const { username, password, email, realName, phone, roleIds } = userData;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      realName,
      phone,
      status: 'active'
    });

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.setRoles(roles);
    } else {
      // 默认分配员工角色
      const employeeRole = await Role.findOne({ where: { code: 'employee' } });
      if (employeeRole) {
        await user.addRole(employeeRole);
      }
    }

    logger.info(`用户创建成功: ${username}`);

    // 返回用户信息（包含角色）
    return this.getUserById(user.id);
  }

  /**
   * 更新用户
   */
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const { email, realName, phone, status, roleIds } = updateData;

    // 如果更新邮箱，检查是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });
      if (existingEmail) {
        throw new Error('邮箱已被其他用户使用');
      }
    }

    // 更新用户信息
    await user.update({
      email: email || user.email,
      realName: realName !== undefined ? realName : user.realName,
      phone: phone !== undefined ? phone : user.phone,
      status: status || user.status
    });

    // 更新角色
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.setRoles(roles);
    }

    logger.info(`用户更新成功: ${user.username}`);

    // 返回更新后的用户信息
    return this.getUserById(id);
  }

  /**
   * 删除用户
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 防止删除管理员账号
    if (user.username === 'admin') {
      throw new Error('不能删除管理员账号');
    }

    await user.destroy();
    logger.info(`用户删除成功: ${user.username}`);
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids) {
    // 查询要删除的用户
    const users = await User.findAll({
      where: { id: ids }
    });

    // 检查是否包含管理员账号
    const hasAdmin = users.some(user => user.username === 'admin');
    if (hasAdmin) {
      throw new Error('不能删除管理员账号');
    }

    // 批量删除
    await User.destroy({
      where: { id: ids }
    });

    logger.info(`批量删除用户成功，数量: ${ids.length}`);
  }

  /**
   * 重置用户密码
   */
  async resetPassword(id, newPassword) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await user.update({ password: hashedPassword });

    logger.info(`用户密码重置成功: ${user.username}`);
  }
}

module.exports = new UserService();
