const authService = require('../services/authService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 用户注册
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(success(user, '注册成功', 201));
    } catch (err) {
      logger.error('注册失败:', err);
      next(err);
    }
  }

  /**
   * 用户登录
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await authService.login(username, password, ip);

      res.json(success(result, '登录成功'));
    } catch (err) {
      logger.error('登录失败:', err);
      next(err);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.id);
      res.json(success(user));
    } catch (err) {
      logger.error('获取用户信息失败:', err);
      next(err);
    }
  }

  /**
   * 更新当前用户信息
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      res.json(success(user, '更新成功'));
    } catch (err) {
      logger.error('更新用户信息失败:', err);
      next(err);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      res.json(success(null, '密码修改成功'));
    } catch (err) {
      logger.error('修改密码失败:', err);
      next(err);
    }
  }

  /**
   * 登出（可选，如果使用 JWT，前端删除 token 即可）
   */
  async logout(req, res, next) {
    try {
      // JWT 是无状态的，登出由前端处理（删除存储的 token）
      // 这里可以记录登出日志
      logger.info(`用户登出: ${req.user.username}`);
      res.json(success(null, '登出成功'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
