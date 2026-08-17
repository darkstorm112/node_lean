const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 工单模型
 */
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '工单标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '工单内容'
  },
  type: {
    type: DataTypes.ENUM('leave', 'reimbursement', 'purchase', 'other'),
    allowNull: false,
    defaultValue: 'other',
    comment: '工单类型：请假、报销、采购、其他'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
    comment: '优先级'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态：待审批、已通过、已拒绝'
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '创建人ID'
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '审批人ID'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审批时间'
  },
  rejectReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '拒绝原因'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  comment: '工单表'
});

module.exports = Ticket;
