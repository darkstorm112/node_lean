const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 权限模型
 */
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '权限ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '权限名称'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '权限代码（如：user:create, ticket:approve）'
  },
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '资源类型（如：user, ticket, file）'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型（如：create, read, update, delete, approve）'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '权限描述'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['code'] },
    { fields: ['resource'] }
  ]
});

module.exports = Permission;
