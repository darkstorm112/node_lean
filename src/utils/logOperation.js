const logService = require('../services/logService');

/**
 * 记录操作日志的工具函数
 */
const logOperation = async (userId, action, resource, resourceId, detail, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await logService.createLog({
      userId,
      action,
      resource,
      resourceId,
      ip,
      userAgent,
      detail
    });
  } catch (error) {
    // 日志记录失败不应该影响主业务
    console.error('记录操作日志失败:', error);
  }
};

module.exports = {
  logOperation
};
