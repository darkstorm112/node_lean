// 首先加载环境变量
require('dotenv').config();

const { Permission } = require('../models');
const logger = require('../utils/logger');

/**
 * 更新现有权限的页面信息
 */
async function updatePermissionPages() {
  try {
    console.log('开始更新权限页面信息...');

    // 定义权限的页面信息
    const permissionUpdates = [
      // 用户管理权限
      { code: 'user:read', page: '用户管理', pageRoute: '/system/user' },
      { code: 'user:create', page: '用户管理', pageRoute: '/system/user' },
      { code: 'user:update', page: '用户管理', pageRoute: '/system/user' },
      { code: 'user:delete', page: '用户管理', pageRoute: '/system/user' },
      { code: 'user:reset-password', page: '用户管理', pageRoute: '/system/user' },

      // 角色管理权限
      { code: 'role:read', page: '角色管理', pageRoute: '/system/role' },
      { code: 'role:create', page: '角色管理', pageRoute: '/system/role' },
      { code: 'role:update', page: '角色管理', pageRoute: '/system/role' },
      { code: 'role:delete', page: '角色管理', pageRoute: '/system/role' },
      { code: 'role:assign-permissions', page: '角色管理', pageRoute: '/system/role' },

      // 权限管理权限
      { code: 'permission:read', page: '权限管理', pageRoute: '/system/permission' },
      { code: 'permission:create', page: '权限管理', pageRoute: '/system/permission' },
      { code: 'permission:update', page: '权限管理', pageRoute: '/system/permission' },
      { code: 'permission:delete', page: '权限管理', pageRoute: '/system/permission' }
    ];

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const update of permissionUpdates) {
      const permission = await Permission.findOne({ where: { code: update.code } });

      if (permission) {
        await permission.update({
          page: update.page,
          pageRoute: update.pageRoute
        });
        console.log(`✅ 更新: ${permission.name} -> ${update.page} (${update.pageRoute})`);
        updatedCount++;
      } else {
        console.log(`⚠️  未找到权限: ${update.code}`);
        notFoundCount++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ 权限页面信息更新完成！`);
    console.log(`   更新成功: ${updatedCount} 个`);
    if (notFoundCount > 0) {
      console.log(`   未找到: ${notFoundCount} 个`);
    }
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 更新权限页面信息失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const { sequelize } = require('../config/database');

  sequelize.authenticate()
    .then(() => {
      console.log('数据库连接成功');
      return updatePermissionPages();
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

module.exports = updatePermissionPages;
