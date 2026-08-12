const { sequelize } = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');

/**
 * 定义模型关联关系
 */

// 用户和角色：多对多关系
User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users'
});

// 角色和权限：多对多关系
Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

/**
 * 同步数据库（仅在开发环境使用）
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('数据库模型同步完成');
  } catch (error) {
    console.error('数据库模型同步失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  syncDatabase
};
