const logService = require('../services/logService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 日志管理控制器
 */
class LogController {
  /**
   * 获取日志列表
   */
  async getLogList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, action, resource, userId, startDate, endDate } = req.query;

      const result = await logService.getLogList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        action,
        resource,
        userId: userId ? parseInt(userId) : undefined,
        startDate,
        endDate
      });

      res.json(success(result));
    } catch (err) {
      logger.error('获取日志列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取日志详情
   */
  async getLogDetail(req, res, next) {
    try {
      const { id } = req.params;
      const log = await logService.getLogById(id);
      res.json(success(log));
    } catch (err) {
      logger.error('获取日志详情失败:', err);
      next(err);
    }
  }
}

module.exports = new LogController();
