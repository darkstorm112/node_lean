const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

/**
 * 认证服务
 */
class AuthService {
  /**
   * 用户注册
   */
  async register(userData) {
    const { username, password, email, realName, phone } = userData;

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

    // 分配默认角色（员工）
    const employeeRole = await Role.findOne({ where: { code: 'employee' } });
    if (employeeRole) {
      await user.addRole(employeeRole);
    }

    logger.info(`新用户注册成功: ${username}`);

    // 返回用户信息（不包含密码）
    return this.sanitizeUser(user);
  }

  /**
   * 用户登录
   */
  async login(username, password, ip) {
    // 查找用户
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name']
      }]
    });

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status === 'inactive') {
      throw new Error('账号未激活');
    }
    if (user.status === 'locked') {
      throw new Error('账号已被锁定');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 更新最后登录时间和IP
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: ip
    });

    // 生成 JWT Token
    const token = this.generateToken(user);

    logger.info(`用户登录成功: ${username}, IP: ${ip}`);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * 生成 JWT Token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      roles: user.roles ? user.roles.map(r => r.code) : []
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  /**
   * 验证 JWT Token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token已过期');
      }
      throw new Error('无效的Token');
    }
  }

  /**
   * 修改密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await user.update({ password: hashedPassword });

    logger.info(`用户修改密码成功: ${user.username}`);
  }

  /**
   * 获取用户完整信息（包含角色和权限）
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'code', 'name', 'description']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.update(updateData);

    logger.info(`用户更新信息成功: ${user.username}`);

    return this.sanitizeUser(user);
  }

  /**
   * 移除敏感信息
   */
  sanitizeUser(user) {
    const userObj = user.toJSON();
    delete userObj.password;
    delete userObj.deletedAt;
    return userObj;
  }
}

module.exports = new AuthService();
