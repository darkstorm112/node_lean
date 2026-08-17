// 首先加载环境变量
require('dotenv').config();

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * 同步数据库表结构
 */
async function syncDatabase() {
  try {
    console.log('开始同步数据库表结构...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步所有模型
    // alter: true 会修改现有表结构以匹配模型定义
    // force: true 会删除现有表并重新创建（谨慎使用）
    await sequelize.sync({ alter: true });

    console.log('✅ 数据库表结构同步完成');
    console.log('\n同步的表包括:');
    console.log('  - users (用户表)');
    console.log('  - roles (角色表)');
    console.log('  - permissions (权限表)');
    console.log('  - user_roles (用户-角色关联表)');
    console.log('  - role_permissions (角色-权限关联表)');
    console.log('  - tickets (工单表)');
    console.log('  - files (文件表)');
    console.log('  - logs (操作日志表)');

    console.log('\n数据库同步完成！');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  syncDatabase()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = syncDatabase;
