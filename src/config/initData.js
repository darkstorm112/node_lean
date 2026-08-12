const { User, Role, Permission } = require('../models');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

/**
 * 初始化基础角色
 */
const initRoles = async () => {
  const roles = [
    {
      name: '管理员',
      code: 'admin',
      description: '系统管理员，拥有所有权限',
      status: 'active'
    },
    {
      name: '经理',
      code: 'manager',
      description: '部门经理，可以审批工单和管理员工',
      status: 'active'
    },
    {
      name: '员工',
      code: 'employee',
      description: '普通员工，可以创建和查看自己的工单',
      status: 'active'
    }
  ];

  for (const roleData of roles) {
    await Role.findOrCreate({
      where: { code: roleData.code },
      defaults: roleData
    });
  }

  logger.info('角色初始化完成');
};

/**
 * 初始化基础权限
 */
const initPermissions = async () => {
  const permissions = [
    // 用户管理权限
    { name: '创建用户', code: 'user:create', resource: 'user', action: 'create', description: '创建新用户' },
    { name: '查看用户', code: 'user:read', resource: 'user', action: 'read', description: '查看用户信息' },
    { name: '更新用户', code: 'user:update', resource: 'user', action: 'update', description: '更新用户信息' },
    { name: '删除用户', code: 'user:delete', resource: 'user', action: 'delete', description: '删除用户' },
    { name: '分配角色', code: 'user:assign-role', resource: 'user', action: 'assign-role', description: '为用户分配角色' },

    // 角色管理权限
    { name: '创建角色', code: 'role:create', resource: 'role', action: 'create', description: '创建新角色' },
    { name: '查看角色', code: 'role:read', resource: 'role', action: 'read', description: '查看角色信息' },
    { name: '更新角色', code: 'role:update', resource: 'role', action: 'update', description: '更新角色信息' },
    { name: '删除角色', code: 'role:delete', resource: 'role', action: 'delete', description: '删除角色' },
    { name: '分配权限', code: 'role:assign-permission', resource: 'role', action: 'assign-permission', description: '为角色分配权限' },

    // 工单管理权限
    { name: '创建工单', code: 'ticket:create', resource: 'ticket', action: 'create', description: '创建新工单' },
    { name: '查看工单', code: 'ticket:read', resource: 'ticket', action: 'read', description: '查看工单信息' },
    { name: '更新工单', code: 'ticket:update', resource: 'ticket', action: 'update', description: '更新工单信息' },
    { name: '删除工单', code: 'ticket:delete', resource: 'ticket', action: 'delete', description: '删除工单' },
    { name: '审批工单', code: 'ticket:approve', resource: 'ticket', action: 'approve', description: '审批工单' },
    { name: '查看所有工单', code: 'ticket:read-all', resource: 'ticket', action: 'read-all', description: '查看所有用户的工单' },

    // 文件管理权限
    { name: '上传文件', code: 'file:upload', resource: 'file', action: 'upload', description: '上传文件' },
    { name: '下载文件', code: 'file:download', resource: 'file', action: 'download', description: '下载文件' },
    { name: '删除文件', code: 'file:delete', resource: 'file', action: 'delete', description: '删除文件' },

    // 日志管理权限
    { name: '查看日志', code: 'log:read', resource: 'log', action: 'read', description: '查看系统日志' }
  ];

  for (const permData of permissions) {
    await Permission.findOrCreate({
      where: { code: permData.code },
      defaults: permData
    });
  }

  logger.info('权限初始化完成');
};

/**
 * 初始化角色权限关联
 */
const initRolePermissions = async () => {
  // 获取角色
  const adminRole = await Role.findOne({ where: { code: 'admin' } });
  const managerRole = await Role.findOne({ where: { code: 'manager' } });
  const employeeRole = await Role.findOne({ where: { code: 'employee' } });

  // 获取所有权限
  const allPermissions = await Permission.findAll();

  // 管理员拥有所有权限
  await adminRole.setPermissions(allPermissions);

  // 经理权限
  const managerPermissions = await Permission.findAll({
    where: {
      code: [
        'user:read',
        'ticket:create', 'ticket:read', 'ticket:read-all', 'ticket:update', 'ticket:approve',
        'file:upload', 'file:download', 'file:delete'
      ]
    }
  });
  await managerRole.setPermissions(managerPermissions);

  // 员工权限
  const employeePermissions = await Permission.findAll({
    where: {
      code: [
        'ticket:create', 'ticket:read', 'ticket:update',
        'file:upload', 'file:download'
      ]
    }
  });
  await employeeRole.setPermissions(employeePermissions);

  logger.info('角色权限关联初始化完成');
};

/**
 * 创建默认管理员账号
 */
const initAdminUser = async () => {
  const adminExists = await User.findOne({ where: { username: 'admin' } });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      realName: '系统管理员',
      status: 'active'
    });

    const adminRole = await Role.findOne({ where: { code: 'admin' } });
    await adminUser.addRole(adminRole);

    logger.info('默认管理员账号创建完成 (用户名: admin, 密码: admin123)');
  } else {
    logger.info('管理员账号已存在');
  }
};

/**
 * 初始化所有数据
 */
const initData = async () => {
  try {
    logger.info('开始初始化基础数据...');

    await initRoles();
    await initPermissions();
    await initRolePermissions();
    await initAdminUser();

    logger.info('基础数据初始化完成！');
  } catch (error) {
    logger.error('基础数据初始化失败:', error);
    throw error;
  }
};

module.exports = {
  initData,
  initRoles,
  initPermissions,
  initRolePermissions,
  initAdminUser
};
