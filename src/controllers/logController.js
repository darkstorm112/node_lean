const logService = require('../services/logService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');
const excelUtil = require('../utils/excelUtilV2');

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

  /**
   * 导出日志到 Excel
   */
  async exportLogs(req, res, next) {
    try {
      const { action, resource, startDate, endDate } = req.query;

      // 获取所有日志（不分页）
      const result = await logService.getLogList({
        page: 1,
        pageSize: 10000,
        action,
        resource,
        startDate,
        endDate
      });

      // 定义 Excel 列
      const columns = [
        { header: '日志ID', key: 'id', width: 10 },
        { header: '操作人', key: 'userName', width: 15 },
        { header: '操作类型', key: 'action', width: 15 },
        { header: '资源类型', key: 'resource', width: 15 },
        { header: '资源ID', key: 'resourceId', width: 12 },
        { header: 'IP地址', key: 'ip', width: 18 },
        { header: '浏览器', key: 'userAgent', width: 40 },
        { header: '操作时间', key: 'createdAt', width: 20 },
        { header: '详细信息', key: 'detail', width: 50 }
      ];

      // 格式化数据
      const formattedData = result.items.map(log => {
        const data = log.toJSON ? log.toJSON() : log;
        return {
          id: data.id,
          userName: data.user?.realName || data.user?.username || '',
          action: getActionLabel(data.action),
          resource: getResourceLabel(data.resource),
          resourceId: data.resourceId || '',
          ip: data.ip || '',
          userAgent: data.userAgent || '',
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString('zh-CN') : '',
          detail: data.detail ? JSON.stringify(data.detail, null, 2) : ''
        };
      });

      // 生成 Excel
      const buffer = await excelUtil.exportToExcel(formattedData, columns, '操作日志');

      // 设置响应头
      const filename = `操作日志_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Cache-Control', 'no-cache');

      res.send(buffer);
    } catch (err) {
      logger.error('导出日志失败:', err);
      next(err);
    }
  }
}

// 辅助函数
function getActionLabel(action) {
  const map = {
    create: '创建',
    update: '更新',
    delete: '删除',
    login: '登录',
    logout: '登出',
    approve: '审批通过',
    reject: '审批拒绝',
    export: '导出',
    import: '导入'
  };
  return map[action] || action;
}

function getResourceLabel(resource) {
  const map = {
    user: '用户',
    role: '角色',
    permission: '权限',
    ticket: '工单',
    file: '文件',
    log: '日志',
    auth: '认证'
  };
  return map[resource] || resource;
}

module.exports = new LogController();
