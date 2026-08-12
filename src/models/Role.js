const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 角色模型
 */
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '角色ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '角色名称'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '角色代码（如：admin, manager, employee）'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '角色描述'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态'
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['code'] },
    { fields: ['status'] }
  ]
});

module.exports = Role;
