const ticketService = require('../services/ticketService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');
const { logOperation } = require('../utils/logOperation');
const excelUtil = require('../utils/excelUtilV2');

/**
 * 工单管理控制器
 */
class TicketController {
  /**
   * 获取工单列表
   */
  async getTicketList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, title, type, priority, status } = req.query;

      const result = await ticketService.getTicketList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        title,
        type,
        priority,
        status
      }, req.user);

      res.json(success(result));
    } catch (err) {
      logger.error('获取工单列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取工单详情
   */
  async getTicketDetail(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketById(id, req.user);
      res.json(success(ticket));
    } catch (err) {
      logger.error('获取工单详情失败:', err);
      next(err);
    }
  }

  /**
   * 创建工单
   */
  async createTicket(req, res, next) {
    try {
      const ticket = await ticketService.createTicket(req.body, req.user);

      // 记录操作日志
      await logOperation(req.user.id, 'create', 'ticket', ticket.id, {
        title: ticket.title,
        type: ticket.type,
        priority: ticket.priority
      }, req);

      res.status(201).json(success(ticket, '工单创建成功', 201));
    } catch (err) {
      logger.error('创建工单失败:', err);
      next(err);
    }
  }

  /**
   * 更新工单
   */
  async updateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.updateTicket(id, req.body, req.user);

      // 记录操作日志
      await logOperation(req.user.id, 'update', 'ticket', ticket.id, {
        title: ticket.title,
        changes: req.body
      }, req);

      res.json(success(ticket, '工单更新成功'));
    } catch (err) {
      logger.error('更新工单失败:', err);
      next(err);
    }
  }

  /**
   * 删除工单
   */
  async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketById(id, req.user);
      await ticketService.deleteTicket(id, req.user);

      // 记录操作日志
      await logOperation(req.user.id, 'delete', 'ticket', parseInt(id), {
        title: ticket.title
      }, req);

      res.json(success(null, '工单删除成功'));
    } catch (err) {
      logger.error('删除工单失败:', err);
      next(err);
    }
  }

  /**
   * 审批通过工单
   */
  async approveTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.approveTicket(id, req.user);

      // 记录操作日志
      await logOperation(req.user.id, 'approve', 'ticket', ticket.id, {
        title: ticket.title,
        result: '审批通过'
      }, req);

      res.json(success(ticket, '工单审批通过'));
    } catch (err) {
      logger.error('审批工单失败:', err);
      next(err);
    }
  }

  /**
   * 审批拒绝工单
   */
  async rejectTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { rejectReason } = req.body;

      if (!rejectReason) {
        throw new Error('请填写拒绝原因');
      }

      const ticket = await ticketService.rejectTicket(id, rejectReason, req.user);

      // 记录操作日志
      await logOperation(req.user.id, 'reject', 'ticket', ticket.id, {
        title: ticket.title,
        result: '审批拒绝',
        rejectReason
      }, req);

      res.json(success(ticket, '工单审批拒绝'));
    } catch (err) {
      logger.error('拒绝工单失败:', err);
      next(err);
    }
  }

  /**
   * 导出工单到 Excel
   */
  async exportTickets(req, res, next) {
    try {
      const { title, type, priority, status } = req.query;

      // 获取所有工单（不分页）
      const result = await ticketService.getTicketList({
        page: 1,
        pageSize: 10000,
        title,
        type,
        priority,
        status
      }, req.user);

      // 定义 Excel 列
      const columns = [
        { header: '工单ID', key: 'id', width: 10 },
        { header: '标题', key: 'title', width: 30 },
        { header: '内容', key: 'content', width: 40 },
        { header: '类型', key: 'type', width: 15 },
        { header: '优先级', key: 'priority', width: 15 },
        { header: '状态', key: 'status', width: 15 },
        { header: '创建人', key: 'creatorName', width: 15 },
        { header: '审批人', key: 'approverName', width: 15 },
        { header: '创建时间', key: 'createdAt', width: 20 },
        { header: '审批时间', key: 'approvedAt', width: 20 },
        { header: '拒绝原因', key: 'rejectReason', width: 30 }
      ];

      // 格式化数据
      const formattedData = result.items.map(ticket => {
        const data = ticket.toJSON ? ticket.toJSON() : ticket;
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          type: getTypeLabel(data.type),
          priority: getPriorityLabel(data.priority),
          status: getStatusLabel(data.status),
          creatorName: data.creator?.realName || data.creator?.username || '',
          approverName: data.approver?.realName || data.approver?.username || '',
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString('zh-CN') : '',
          approvedAt: data.approvedAt ? new Date(data.approvedAt).toLocaleString('zh-CN') : '',
          rejectReason: data.rejectReason || ''
        };
      });

      // 生成 Excel
      const buffer = await excelUtil.exportToExcel(formattedData, columns, '工单列表');

      // 记录操作日志
      await logOperation(req.user.id, 'export', 'ticket', null, {
        count: result.items.length
      }, req);

      // 设置响应头
      const filename = `工单列表_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Cache-Control', 'no-cache');

      res.send(buffer);
    } catch (err) {
      logger.error('导出工单失败:', err);
      next(err);
    }
  }

  /**
   * 从 Excel 导入工单
   */
  async importTickets(req, res, next) {
    try {
      if (!req.file) {
        throw new Error('请上传 Excel 文件');
      }

      // 定义 Excel 列映射
      const columns = [
        { header: '标题', key: 'title' },
        { header: '内容', key: 'content' },
        { header: '类型', key: 'type' },
        { header: '优先级', key: 'priority' }
      ];

      // 读取 Excel
      const data = await excelUtil.importFromExcel(req.file.buffer, columns);

      // 验证和转换数据
      const tickets = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2;

        try {
          if (!row.title || !row.content) {
            errors.push(`第 ${rowNum} 行：标题和内容不能为空`);
            continue;
          }

          const ticket = {
            title: row.title,
            content: row.content,
            type: parseTypeValue(row.type) || 'other',
            priority: parsePriorityValue(row.priority) || 'medium'
          };

          tickets.push(ticket);
        } catch (error) {
          errors.push(`第 ${rowNum} 行：${error.message}`);
        }
      }

      // 批量创建工单
      const created = [];
      for (const ticketData of tickets) {
        try {
          const ticket = await ticketService.createTicket(ticketData, req.user);
          created.push(ticket);
        } catch (error) {
          errors.push(`创建工单失败（${ticketData.title}）：${error.message}`);
        }
      }

      // 记录操作日志
      await logOperation(req.user.id, 'import', 'ticket', null, {
        total: data.length,
        success: created.length,
        failed: errors.length
      }, req);

      res.json(success({
        total: data.length,
        success: created.length,
        failed: errors.length,
        errors: errors.slice(0, 10),
        tickets: created
      }, '导入完成'));

    } catch (err) {
      logger.error('导入工单失败:', err);
      next(err);
    }
  }

  /**
   * 下载工单导入模板
   */
  async downloadTemplate(req, res, next) {
    try {
      const columns = [
        { header: '标题', key: 'title', width: 30 },
        { header: '内容', key: 'content', width: 40 },
        { header: '类型', key: 'type', width: 15 },
        { header: '优先级', key: 'priority', width: 15 }
      ];

      // 添加示例数据和说明
      const sampleData = [
        {
          title: '示例：请假申请',
          content: '请假3天，日期：2026-08-20至2026-08-22',
          type: '请假',
          priority: '中'
        },
        {
          title: '示例：报销申请',
          content: '差旅费报销，金额5000元',
          type: '报销',
          priority: '高'
        }
      ];

      // 定义下拉选项
      const options = {
        sampleData,
        validations: [
          {
            column: 'type',
            options: ['请假', '报销', '采购', '其他']
          },
          {
            column: 'priority',
            options: ['低', '中', '高']
          }
        ]
      };

      const buffer = await excelUtil.generateTemplate(columns, '工单导入模板', options);

      const filename = '工单导入模板.xlsx';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Cache-Control', 'no-cache');

      res.send(buffer);
    } catch (err) {
      logger.error('下载模板失败:', err);
      next(err);
    }
  }
}

// 辅助函数（在类外部定义）
function getTypeLabel(type) {
  const map = {
    leave: '请假',
    reimbursement: '报销',
    purchase: '采购',
    other: '其他'
  };
  return map[type] || type;
}

function getPriorityLabel(priority) {
  const map = {
    low: '低',
    medium: '中',
    high: '高'
  };
  return map[priority] || priority;
}

function getStatusLabel(status) {
  const map = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return map[status] || status;
}

function parseTypeValue(label) {
  const map = {
    '请假': 'leave',
    '报销': 'reimbursement',
    '采购': 'purchase',
    '其他': 'other'
  };
  return map[label] || label;
}

function parsePriorityValue(label) {
  const map = {
    '低': 'low',
    '中': 'medium',
    '高': 'high'
  };
  return map[label] || label;
}

module.exports = new TicketController();
