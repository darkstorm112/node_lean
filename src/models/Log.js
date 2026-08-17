const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 操作日志模型
 */
const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '操作人ID'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型：create/update/delete/login/logout/approve/reject'
  },
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '资源类型：user/role/permission/ticket/file'
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '资源ID'
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP地址（支持IPv6）'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '浏览器信息'
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '详细信息（JSON格式）'
  }
}, {
  tableName: 'logs',
  timestamps: true,
  updatedAt: false,
  comment: '操作日志表'
});

module.exports = Log;
