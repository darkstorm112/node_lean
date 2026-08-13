// 首先加载环境变量
require('dotenv').config();

const { sequelize } = require('../config/database');

/**
 * 为 permissions 表添加 page 和 pageRoute 字段
 */
async function addPermissionFields() {
  try {
    console.log('开始添加权限表新字段...');

    // 添加 page 字段
    await sequelize.query(`
      ALTER TABLE permissions
      ADD COLUMN page VARCHAR(100) NULL COMMENT '所属页面（如：用户管理、角色管理）' AFTER description
    `);
    console.log('✅ 添加字段: page');

    // 添加 pageRoute 字段
    await sequelize.query(`
      ALTER TABLE permissions
      ADD COLUMN pageRoute VARCHAR(200) NULL COMMENT '页面路由（如：/system/user、/system/role）' AFTER page
    `);
    console.log('✅ 添加字段: pageRoute');

    // 添加索引
    await sequelize.query(`
      ALTER TABLE permissions
      ADD INDEX idx_page (page)
    `);
    console.log('✅ 添加索引: idx_page');

    console.log('\n========================================');
    console.log('✅ 权限表字段添加完成！');
    console.log('========================================\n');

  } catch (error) {
    // 如果字段已存在，忽略错误
    if (error.original && error.original.errno === 1060) {
      console.log('⚠️  字段已存在，跳过添加');
    } else {
      console.error('❌ 添加字段失败:', error.message);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('数据库连接成功');
      return addPermissionFields();
    })
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = addPermissionFields;
