// 首先加载环境变量
require('dotenv').config();

const { Permission, Role } = require('../models');
const logger = require('../utils/logger');

/**
 * 初始化系统权限
 * 创建所有权限并分配给相应角色
 */
async function initPermissions() {
  try {
    console.log('开始初始化权限...');

    // ==================== 定义所有权限 ====================

    // 用户管理权限
    const userPermissions = [
      {
        code: 'user:read',
        name: '查看用户',
        resource: 'user',
        action: 'read',
        description: '查看用户列表和详情',
        page: '用户管理',
        pageRoute: '/system/user'
      },
      {
        code: 'user:create',
        name: '创建用户',
        resource: 'user',
        action: 'create',
        description: '创建新用户',
        page: '用户管理',
        pageRoute: '/system/user'
      },
      {
        code: 'user:update',
        name: '更新用户',
        resource: 'user',
        action: 'update',
        description: '更新用户信息',
        page: '用户管理',
        pageRoute: '/system/user'
      },
      {
        code: 'user:delete',
        name: '删除用户',
        resource: 'user',
        action: 'delete',
        description: '删除用户（包括批量删除）',
        page: '用户管理',
        pageRoute: '/system/user'
      },
      {
        code: 'user:reset-password',
        name: '重置密码',
        resource: 'user',
        action: 'reset-password',
        description: '重置用户密码',
        page: '用户管理',
        pageRoute: '/system/user'
      }
    ];

    // 角色管理权限
    const rolePermissions = [
      {
        code: 'role:read',
        name: '查看角色',
        resource: 'role',
        action: 'read',
        description: '查看角色列表和详情',
        page: '角色管理',
        pageRoute: '/system/role'
      },
      {
        code: 'role:create',
        name: '创建角色',
        resource: 'role',
        action: 'create',
        description: '创建新角色',
        page: '角色管理',
        pageRoute: '/system/role'
      },
      {
        code: 'role:update',
        name: '更新角色',
        resource: 'role',
        action: 'update',
        description: '更新角色信息',
        page: '角色管理',
        pageRoute: '/system/role'
      },
      {
        code: 'role:delete',
        name: '删除角色',
        resource: 'role',
        action: 'delete',
        description: '删除角色',
        page: '角色管理',
        pageRoute: '/system/role'
      },
      {
        code: 'role:assign-permissions',
        name: '角色分配权限',
        resource: 'role',
        action: 'assign-permissions',
        description: '为角色分配权限',
        page: '角色管理',
        pageRoute: '/system/role'
      }
    ];

    // 权限管理权限
    const permissionPermissions = [
      {
        code: 'permission:read',
        name: '查看权限',
        resource: 'permission',
        action: 'read',
        description: '查看权限列表和详情',
        page: '权限管理',
        pageRoute: '/system/permission'
      },
      {
        code: 'permission:create',
        name: '创建权限',
        resource: 'permission',
        action: 'create',
        description: '创建新权限',
        page: '权限管理',
        pageRoute: '/system/permission'
      },
      {
        code: 'permission:update',
        name: '更新权限',
        resource: 'permission',
        action: 'update',
        description: '更新权限信息',
        page: '权限管理',
        pageRoute: '/system/permission'
      },
      {
        code: 'permission:delete',
        name: '删除权限',
        resource: 'permission',
        action: 'delete',
        description: '删除权限',
        page: '权限管理',
        pageRoute: '/system/permission'
      }
    ];

    // 工单管理权限
    const ticketPermissions = [
      {
        code: 'ticket:read',
        name: '查看工单',
        resource: 'ticket',
        action: 'read',
        description: '查看工单列表和详情',
        page: '工单管理',
        pageRoute: '/ticket'
      },
      {
        code: 'ticket:create',
        name: '创建工单',
        resource: 'ticket',
        action: 'create',
        description: '创建新工单',
        page: '工单管理',
        pageRoute: '/ticket'
      },
      {
        code: 'ticket:update',
        name: '更新工单',
        resource: 'ticket',
        action: 'update',
        description: '更新工单信息',
        page: '工单管理',
        pageRoute: '/ticket'
      },
      {
        code: 'ticket:delete',
        name: '删除工单',
        resource: 'ticket',
        action: 'delete',
        description: '删除工单',
        page: '工单管理',
        pageRoute: '/ticket'
      },
      {
        code: 'ticket:approve',
        name: '审批工单',
        resource: 'ticket',
        action: 'approve',
        description: '审批工单（通过/拒绝）',
        page: '工单管理',
        pageRoute: '/ticket'
      }
    ];

    // 文件管理权限
    const filePermissions = [
      {
        code: 'file:read',
        name: '查看文件',
        resource: 'file',
        action: 'read',
        description: '查看文件列表和详情',
        page: '文件管理',
        pageRoute: '/file'
      },
      {
        code: 'file:upload',
        name: '上传文件',
        resource: 'file',
        action: 'upload',
        description: '上传文件',
        page: '文件管理',
        pageRoute: '/file'
      },
      {
        code: 'file:download',
        name: '下载文件',
        resource: 'file',
        action: 'download',
        description: '下载文件',
        page: '文件管理',
        pageRoute: '/file'
      },
      {
        code: 'file:delete',
        name: '删除文件',
        resource: 'file',
        action: 'delete',
        description: '删除文件',
        page: '文件管理',
        pageRoute: '/file'
      }
    ];

    // 日志管理权限
    const logPermissions = [
      {
        code: 'log:read',
        name: '查看日志',
        resource: 'log',
        action: 'read',
        description: '查看操作日志',
        page: '日志管理',
        pageRoute: '/log'
      }
    ];

    // ==================== 创建所有权限 ====================
    const allPermissions = [
      ...userPermissions,
      ...rolePermissions,
      ...permissionPermissions,
      ...ticketPermissions,
      ...filePermissions,
      ...logPermissions
    ];

    console.log(`准备创建 ${allPermissions.length} 个权限...`);

    for (const perm of allPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { code: perm.code },
        defaults: perm
      });

      if (created) {
        console.log(`✅ 创建权限: ${perm.name} (${perm.code})`);
      } else {
        console.log(`⏭️  权限已存在: ${perm.name} (${perm.code})`);
      }
    }

    // ==================== 为角色分配权限 ====================

    // 1. 管理员角色 - 拥有所有权限
    console.log('\n配置管理员角色权限...');
    const adminRole = await Role.findOne({ where: { code: 'admin' } });
    if (adminRole) {
      const allPermissionRecords = await Permission.findAll();
      await adminRole.setPermissions(allPermissionRecords);
      console.log(`✅ 管理员角色已分配所有 ${allPermissionRecords.length} 个权限`);
    } else {
      console.log('⚠️  未找到管理员角色');
    }

    // 2. 经理角色 - 拥有查看和部分管理权限
    console.log('\n配置经理角色权限...');
    const managerRole = await Role.findOne({ where: { code: 'manager' } });
    if (managerRole) {
      const managerPermissionCodes = [
        'user:read',           // 查看用户
        'user:update',         // 更新用户
        'role:read',           // 查看角色
        'permission:read',     // 查看权限
        'ticket:read',         // 查看工单
        'ticket:create',       // 创建工单
        'ticket:approve',      // 审批工单
        'file:read',           // 查看文件
        'file:upload',         // 上传文件
        'file:download'        // 下载文件
      ];
      const managerPermissions = await Permission.findAll({
        where: { code: managerPermissionCodes }
      });
      await managerRole.setPermissions(managerPermissions);
      console.log(`✅ 经理角色已分配 ${managerPermissions.length} 个权限`);
      console.log(`   权限列表: ${managerPermissionCodes.join(', ')}`);
    } else {
      console.log('⚠️  未找到经理角色');
    }

    // 3. 员工角色 - 只有基础查看权限
    console.log('\n配置员工角色权限...');
    const employeeRole = await Role.findOne({ where: { code: 'employee' } });
    if (employeeRole) {
      const employeePermissionCodes = [
        'user:read',           // 查看用户
        'ticket:read',         // 查看工单
        'ticket:create',       // 创建工单
        'ticket:update',       // 更新工单
        'ticket:delete',       // 删除工单
        'file:read',           // 查看文件
        'file:upload',         // 上传文件
        'file:download'        // 下载文件
      ];
      const employeePermissions = await Permission.findAll({
        where: { code: employeePermissionCodes }
      });
      await employeeRole.setPermissions(employeePermissions);
      console.log(`✅ 员工角色已分配 ${employeePermissions.length} 个权限`);
      console.log(`   权限列表: ${employeePermissionCodes.join(', ')}`);
    } else {
      console.log('⚠️  未找到员工角色');
    }

    console.log('\n========================================');
    console.log('✅ 权限初始化完成！');
    console.log('========================================\n');

    // 显示权限分配汇总
    console.log('📊 权限分配汇总：');
    console.log('┌─────────┬──────────────────────────────────────┐');
    console.log('│  角色   │              权限列表                │');
    console.log('├─────────┼──────────────────────────────────────┤');
    console.log('│ 管理员  │ 所有权限 (27个)                      │');
    console.log('│ 经理    │ user:read, user:update,              │');
    console.log('│         │ role:read, permission:read,          │');
    console.log('│         │ ticket相关, file相关                 │');
    console.log('│ 员工    │ user:read, ticket相关, file相关      │');
    console.log('└─────────┴──────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ 权限初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 加载环境变量
  require('dotenv').config();

  // 初始化数据库连接
  const { sequelize } = require('../config/database');

  sequelize.authenticate()
    .then(() => {
      console.log('数据库连接成功');
      return initPermissions();
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

module.exports = initPermissions;
