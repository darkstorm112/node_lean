const { Log, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 日志服务
 */
class LogService {
  /**
   * 创建操作日志
   */
  async createLog(logData) {
    const { userId, action, resource, resourceId, ip, userAgent, detail } = logData;

    try {
      const log = await Log.create({
        userId,
        action,
        resource,
        resourceId: resourceId || null,
        ip: ip || null,
        userAgent: userAgent || null,
        detail: detail ? JSON.stringify(detail) : null
      });

      return log;
    } catch (error) {
      logger.error('创建日志失败:', error);
      // 日志记录失败不应该影响主业务，所以只记录错误
    }
  }

  /**
   * 获取日志列表（分页、筛选）
   */
  async getLogList(params) {
    const { page = 1, pageSize = 10, action, resource, userId, startDate, endDate } = params;

    // 构建查询条件
    const where = {};

    if (action) {
      where.action = action;
    }
    if (resource) {
      where.resource = resource;
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // 查询
    const { count, rows } = await Log.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'realName', 'email']
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    // 解析 detail 字段
    const items = rows.map(log => {
      const logData = log.toJSON();
      if (logData.detail) {
        try {
          logData.detail = JSON.parse(logData.detail);
        } catch (error) {
          // 如果解析失败，保持原样
        }
      }
      return logData;
    });

    return {
      items,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据 ID 获取日志
   */
  async getLogById(id) {
    const log = await Log.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'realName', 'email']
      }]
    });

    if (!log) {
      throw new Error('日志不存在');
    }

    const logData = log.toJSON();
    if (logData.detail) {
      try {
        logData.detail = JSON.parse(logData.detail);
      } catch (error) {
        // 如果解析失败，保持原样
      }
    }

    return logData;
  }
}

module.exports = new LogService();
