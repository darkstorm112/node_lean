const { Ticket, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 工单服务
 */
class TicketService {
  /**
   * 获取工单列表（分页、筛选、权限控制）
   */
  async getTicketList(params, currentUser) {
    const { page = 1, pageSize = 10, title, type, priority, status } = params;

    // 构建查询条件
    const where = {};

    // 权限控制：普通员工只能看到自己创建的工单
    if (!this.isManagerOrAdmin(currentUser)) {
      where.creatorId = currentUser.id;
    }

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }
    if (type) {
      where.type = type;
    }
    if (priority) {
      where.priority = priority;
    }
    if (status) {
      where.status = status;
    }

    // 查询
    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName', 'email'],
          required: false
        }
      ],
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
   * 根据 ID 获取工单
   */
  async getTicketById(id, currentUser) {
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName', 'email'],
          required: false
        }
      ]
    });

    if (!ticket) {
      throw new Error('工单不存在');
    }

    // 权限检查：普通员工只能查看自己的工单
    if (!this.isManagerOrAdmin(currentUser) && ticket.creatorId !== currentUser.id) {
      throw new Error('无权查看此工单');
    }

    return ticket;
  }

  /**
   * 创建工单
   */
  async createTicket(ticketData, currentUser) {
    const { title, content, type, priority } = ticketData;

    const ticket = await Ticket.create({
      title,
      content,
      type: type || 'other',
      priority: priority || 'medium',
      status: 'pending',
      creatorId: currentUser.id
    });

    logger.info(`工单创建成功: ${title}, 创建人: ${currentUser.username}`);

    // 返回工单信息（包含创建人）
    return this.getTicketById(ticket.id, currentUser);
  }

  /**
   * 更新工单（仅创建人，且状态为pending）
   */
  async updateTicket(id, updateData, currentUser) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      throw new Error('工单不存在');
    }

    // 权限检查：只有创建人可以更新
    if (ticket.creatorId !== currentUser.id) {
      throw new Error('只有创建人可以更新工单');
    }

    // 状态检查：只有pending状态可以更新
    if (ticket.status !== 'pending') {
      throw new Error('只有待审批状态的工单可以更新');
    }

    const { title, content, type, priority } = updateData;

    // 更新工单
    await ticket.update({
      title: title || ticket.title,
      content: content || ticket.content,
      type: type || ticket.type,
      priority: priority || ticket.priority
    });

    logger.info(`工单更新成功: ${ticket.title}, ID: ${id}`);

    // 返回更新后的工单信息
    return this.getTicketById(id, currentUser);
  }

  /**
   * 删除工单（仅创建人，且状态为pending）
   */
  async deleteTicket(id, currentUser) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      throw new Error('工单不存在');
    }

    // 权限检查：只有创建人可以删除
    if (ticket.creatorId !== currentUser.id) {
      throw new Error('只有创建人可以删除工单');
    }

    // 状态检查：只有pending状态可以删除
    if (ticket.status !== 'pending') {
      throw new Error('只有待审批状态的工单可以删除');
    }

    await ticket.destroy();
    logger.info(`工单删除成功: ${ticket.title}, ID: ${id}`);
  }

  /**
   * 审批通过工单
   */
  async approveTicket(id, currentUser) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      throw new Error('工单不存在');
    }

    // 权限检查：需要管理员或经理权限
    if (!this.isManagerOrAdmin(currentUser)) {
      throw new Error('无权审批工单');
    }

    // 状态检查：只有pending状态可以审批
    if (ticket.status !== 'pending') {
      throw new Error('该工单已被审批');
    }

    // 更新状态
    await ticket.update({
      status: 'approved',
      approverId: currentUser.id,
      approvedAt: new Date()
    });

    logger.info(`工单审批通过: ${ticket.title}, 审批人: ${currentUser.username}`);

    // 返回更新后的工单信息
    return this.getTicketById(id, currentUser);
  }

  /**
   * 审批拒绝工单
   */
  async rejectTicket(id, rejectReason, currentUser) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      throw new Error('工单不存在');
    }

    // 权限检查：需要管理员或经理权限
    if (!this.isManagerOrAdmin(currentUser)) {
      throw new Error('无权审批工单');
    }

    // 状态检查：只有pending状态可以审批
    if (ticket.status !== 'pending') {
      throw new Error('该工单已被审批');
    }

    // 更新状态
    await ticket.update({
      status: 'rejected',
      approverId: currentUser.id,
      approvedAt: new Date(),
      rejectReason
    });

    logger.info(`工单审批拒绝: ${ticket.title}, 审批人: ${currentUser.username}`);

    // 返回更新后的工单信息
    return this.getTicketById(id, currentUser);
  }

  /**
   * 检查用户是否是管理员或经理
   */
  isManagerOrAdmin(user) {
    if (!user.roles || user.roles.length === 0) {
      return false;
    }
    return user.roles.some(role => role.code === 'admin' || role.code === 'manager');
  }
}

module.exports = new TicketService();
