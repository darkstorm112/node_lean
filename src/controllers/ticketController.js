const ticketService = require('../services/ticketService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');

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
      await ticketService.deleteTicket(id, req.user);
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
      res.json(success(ticket, '工单审批拒绝'));
    } catch (err) {
      logger.error('拒绝工单失败:', err);
      next(err);
    }
  }
}

module.exports = new TicketController();
