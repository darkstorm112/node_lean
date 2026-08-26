const userService = require('../services/userService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');
const { logOperation } = require('../utils/logOperation');

/**
 * 用户管理控制器
 */
class UserController {
  /**
   * 获取用户列表
   */
  async getUserList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, username, email, status } = req.query;

      const result = await userService.getUserList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        username,
        email,
        status
      });

      res.json(success(result));
    } catch (err) {
      logger.error('获取用户列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(success(user));
    } catch (err) {
      logger.error('获取用户详情失败:', err);
      next(err);
    }
  }

  /**
   * 创建用户
   */
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);

      // 记录操作日志
      await logOperation(req.user.id, 'create', 'user', user.id, {
        username: user.username,
        email: user.email
      }, req);

      res.status(201).json(success(user, '用户创建成功', 201));
    } catch (err) {
      logger.error('创建用户失败:', err);
      next(err);
    }
  }

  /**
   * 更新用户
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      res.json(success(user, '用户更新成功'));
    } catch (err) {
      logger.error('更新用户失败:', err);
      next(err);
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // 防止删除当前登录用户
      if (id === req.user.id) {
        throw new Error('不能删除当前登录用户');
      }

      await userService.deleteUser(id);
      res.json(success(null, '用户删除成功'));
    } catch (err) {
      logger.error('删除用户失败:', err);
      next(err);
    }
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(req, res, next) {
    try {
      const { ids } = req.body;

      // 防止删除当前登录用户
      if (ids.includes(req.user.id)) {
        throw new Error('不能删除当前登录用户');
      }

      await userService.batchDeleteUsers(ids);
      res.json(success(null, '批量删除成功'));
    } catch (err) {
      logger.error('批量删除用户失败:', err);
      next(err);
    }
  }

  /**
   * 重置用户密码
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      await userService.resetPassword(id, newPassword);
      res.json(success(null, '密码重置成功'));
    } catch (err) {
      logger.error('重置密码失败:', err);
      next(err);
    }
  }
}

module.exports = new UserController();
