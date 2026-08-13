# 权限系统配置指南

## 📋 目录
1. [权限系统架构](#权限系统架构)
2. [当前支持程度](#当前支持程度)
3. [权限配置方式](#权限配置方式)
4. [实际使用示例](#实际使用示例)
5. [扩展建议](#扩展建议)

---

## 🏗️ 权限系统架构

### 核心组件

```
用户 (User) ←→ 角色 (Role) ←→ 权限 (Permission)
     N:M              N:M
```

### 数据模型

#### 1. User（用户表）
- `id`: UUID - 用户唯一标识
- `username`: 用户名
- `status`: 状态（active/inactive/locked）
- 关联：多对多关系到 Role

#### 2. Role（角色表）
- `id`: UUID - 角色唯一标识
- `code`: 角色编码（admin, manager, employee）
- `name`: 角色名称
- `description`: 角色描述
- 关联：
  - 多对多关系到 User
  - 多对多关系到 Permission

#### 3. Permission（权限表）
- `id`: UUID - 权限唯一标识
- `code`: 权限编码（如：user:read, user:create）
- `name`: 权限名称
- `resource`: 资源名称（user, role, permission）
- `action`: 操作类型（read, create, update, delete）
- `description`: 权限描述
- 关联：多对多关系到 Role

---

## ✅ 当前支持程度

### 已实现功能

#### 1. **基础认证** ✅
- JWT Token 认证
- 登录状态检查
- Token 过期验证

#### 2. **角色管理** ✅
- 角色 CRUD 操作
- 用户角色分配
- 角色列表查询
- 角色权限关联

#### 3. **权限管理** ✅
- 权限 CRUD 操作
- 权限列表查询
- 角色权限分配
- 权限数据模型完整

#### 4. **权限检查中间件** ✅
提供以下中间件：

##### `hasRole(...roleCodes)`
检查用户是否拥有指定角色（满足任一即可）
```javascript
router.get('/admin', authenticate, hasRole('admin'), handler);
router.get('/manage', authenticate, hasRole('admin', 'manager'), handler);
```

##### `hasPermission(...permissionCodes)`
检查用户是否拥有指定权限（满足任一即可）
```javascript
router.get('/users', authenticate, hasPermission('user:read'), handler);
router.post('/users', authenticate, hasPermission('user:create', 'user:manage'), handler);
```

##### `hasAllPermissions(...permissionCodes)`
检查用户是否拥有所有指定权限
```javascript
router.put('/users/:id', authenticate, hasAllPermissions('user:read', 'user:update'), handler);
```

##### `isOwner(resourceIdParam, resourceOwnerField)`
检查用户是否是资源所有者（管理员自动通过）
```javascript
router.put('/posts/:id', authenticate, isOwner('id', 'userId'), handler);
```

##### `hasRoleOrPermission(roleCodes, permissionCodes)`
检查用户是否拥有指定角色或权限（满足其一即可）
```javascript
router.get('/reports', authenticate, hasRoleOrPermission(['admin'], ['report:read']), handler);
```

#### 5. **服务层方法** ✅
- `permissionService.hasRole(userId, roleCodes)` - 检查角色
- `permissionService.hasPermission(userId, permissionCodes)` - 检查权限（任一）
- `permissionService.hasAllPermissions(userId, permissionCodes)` - 检查权限（全部）
- `permissionService.getUserPermissions(userId)` - 获取用户所有权限
- `permissionService.getUserRoles(userId)` - 获取用户所有角色

#### 6. **用户状态控制** ✅
- `active`: 正常用户，可以登录
- `inactive`: 未激活用户，不能登录
- `locked`: 锁定用户，不能登录

#### 7. **安全保护** ✅
- 防止删除 admin 账户
- 防止删除当前登录用户
- 所有敏感操作需要认证

---

## 🚧 当前限制

### 1. **路由级别未全面应用权限控制**
当前大部分路由只使用了 `authenticate` 中间件，未使用细粒度的权限控制：

```javascript
// 当前实现（仅认证，无权限检查）
router.get('/', authenticate, userController.getUserList);
router.post('/', authenticate, validate(createUserSchema), userController.createUser);
router.delete('/:id', authenticate, userController.deleteUser);
```

**影响**：任何登录用户都可以访问这些接口，无法限制普通员工访问管理员功能。

### 2. **权限数据未初始化**
系统有权限表结构，但没有预置权限数据：
- 没有初始化权限记录
- 没有为默认角色分配权限
- 需要手动创建权限并分配

### 3. **前端权限控制未实现**
- 前端未根据用户权限动态显示/隐藏功能
- 前端未做按钮级别的权限控制
- 依赖后端拦截（存在 UI 泄露风险）

---

## 🛠️ 权限配置方式

### 方式一：在路由中添加权限中间件（推荐）

#### 示例 1：基于角色的权限控制
```javascript
const { authenticate } = require('../middlewares/auth');
const { hasRole } = require('../middlewares/permission');

// 只有管理员可以访问
router.get('/users', 
  authenticate, 
  hasRole('admin'), 
  userController.getUserList
);

// 管理员或经理可以访问
router.get('/reports', 
  authenticate, 
  hasRole('admin', 'manager'), 
  reportController.getReports
);
```

#### 示例 2：基于权限的精细控制
```javascript
const { hasPermission, hasAllPermissions } = require('../middlewares/permission');

// 拥有 user:read 权限即可查看
router.get('/users', 
  authenticate, 
  hasPermission('user:read'), 
  userController.getUserList
);

// 需要同时拥有 user:read 和 user:update 权限
router.put('/users/:id', 
  authenticate, 
  hasAllPermissions('user:read', 'user:update'), 
  userController.updateUser
);

// 拥有 user:create 或 user:manage 任一权限即可创建
router.post('/users', 
  authenticate, 
  hasPermission('user:create', 'user:manage'), 
  userController.createUser
);
```

#### 示例 3：资源所有者检查
```javascript
const { isOwner } = require('../middlewares/permission');

// 只能修改自己的文章（管理员除外）
router.put('/posts/:id', 
  authenticate, 
  isOwner('id', 'userId'), 
  postController.updatePost
);
```

#### 示例 4：组合权限控制
```javascript
const { hasRoleOrPermission } = require('../middlewares/permission');

// 管理员角色或拥有 report:read 权限都可以访问
router.get('/reports', 
  authenticate, 
  hasRoleOrPermission(['admin'], ['report:read']), 
  reportController.getReports
);
```

### 方式二：在控制器中检查权限

```javascript
const permissionService = require('../services/permissionService');

class UserController {
  async sensitiveOperation(req, res, next) {
    try {
      // 检查用户是否有指定权限
      const hasPermission = await permissionService.hasPermission(
        req.user.id, 
        ['user:delete', 'user:manage']
      );
      
      if (!hasPermission) {
        return res.status(200).json(error('无权限执行此操作', 403));
      }
      
      // 执行业务逻辑
      // ...
      
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  }
}
```

---

## 📖 实际使用示例

### 完整的用户管理路由权限配置

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { hasRole, hasPermission, hasAllPermissions } = require('../middlewares/permission');
const validate = require('../middlewares/validator');

/**
 * 获取用户列表
 * 权限要求：管理员或拥有 user:read 权限
 */
router.get('/', 
  authenticate, 
  hasPermission('user:read'), 
  userController.getUserList
);

/**
 * 获取用户详情
 * 权限要求：拥有 user:read 权限
 */
router.get('/:id', 
  authenticate, 
  hasPermission('user:read'), 
  userController.getUserDetail
);

/**
 * 创建用户
 * 权限要求：管理员角色
 */
router.post('/', 
  authenticate, 
  hasRole('admin'), 
  validate(createUserSchema), 
  userController.createUser
);

/**
 * 更新用户
 * 权限要求：管理员或拥有 user:update 权限
 */
router.put('/:id', 
  authenticate, 
  hasPermission('user:update'), 
  validate(updateUserSchema), 
  userController.updateUser
);

/**
 * 删除用户
 * 权限要求：仅管理员
 */
router.delete('/:id', 
  authenticate, 
  hasRole('admin'), 
  userController.deleteUser
);

/**
 * 批量删除用户
 * 权限要求：仅管理员
 */
router.post('/batch-delete', 
  authenticate, 
  hasRole('admin'), 
  validate(batchDeleteSchema), 
  userController.batchDeleteUsers
);

/**
 * 重置密码
 * 权限要求：管理员或拥有 user:reset-password 权限
 */
router.post('/:id/reset-password', 
  authenticate, 
  hasPermission('user:reset-password'), 
  validate(resetPasswordSchema), 
  userController.resetPassword
);

module.exports = router;
```

### 初始化权限数据

创建初始化脚本 `src/scripts/initPermissions.js`：

```javascript
const { Permission, Role } = require('../models');

async function initPermissions() {
  // 用户管理权限
  const userPermissions = [
    { code: 'user:read', name: '查看用户', resource: 'user', action: 'read' },
    { code: 'user:create', name: '创建用户', resource: 'user', action: 'create' },
    { code: 'user:update', name: '更新用户', resource: 'user', action: 'update' },
    { code: 'user:delete', name: '删除用户', resource: 'user', action: 'delete' },
    { code: 'user:reset-password', name: '重置密码', resource: 'user', action: 'reset-password' }
  ];

  // 角色管理权限
  const rolePermissions = [
    { code: 'role:read', name: '查看角色', resource: 'role', action: 'read' },
    { code: 'role:create', name: '创建角色', resource: 'role', action: 'create' },
    { code: 'role:update', name: '更新角色', resource: 'role', action: 'update' },
    { code: 'role:delete', name: '删除角色', resource: 'role', action: 'delete' }
  ];

  // 权限管理权限
  const permissionPermissions = [
    { code: 'permission:read', name: '查看权限', resource: 'permission', action: 'read' },
    { code: 'permission:create', name: '创建权限', resource: 'permission', action: 'create' },
    { code: 'permission:update', name: '更新权限', resource: 'permission', action: 'update' },
    { code: 'permission:delete', name: '删除权限', resource: 'permission', action: 'delete' }
  ];

  // 创建所有权限
  const allPermissions = [...userPermissions, ...rolePermissions, ...permissionPermissions];
  
  for (const perm of allPermissions) {
    await Permission.findOrCreate({
      where: { code: perm.code },
      defaults: perm
    });
  }

  // 为管理员角色分配所有权限
  const adminRole = await Role.findOne({ where: { code: 'admin' } });
  if (adminRole) {
    const permissions = await Permission.findAll();
    await adminRole.setPermissions(permissions);
    console.log('✅ 管理员角色已分配所有权限');
  }

  // 为经理角色分配部分权限
  const managerRole = await Role.findOne({ where: { code: 'manager' } });
  if (managerRole) {
    const managerPermissionCodes = [
      'user:read', 'user:update',
      'role:read',
      'permission:read'
    ];
    const permissions = await Permission.findAll({
      where: { code: managerPermissionCodes }
    });
    await managerRole.setPermissions(permissions);
    console.log('✅ 经理角色已分配部分权限');
  }

  // 为员工角色分配基础权限
  const employeeRole = await Role.findOne({ where: { code: 'employee' } });
  if (employeeRole) {
    const employeePermissionCodes = ['user:read'];
    const permissions = await Permission.findAll({
      where: { code: employeePermissionCodes }
    });
    await employeeRole.setPermissions(permissions);
    console.log('✅ 员工角色已分配基础权限');
  }

  console.log('✅ 权限初始化完成');
}

module.exports = initPermissions;
```

---

## 🚀 扩展建议

### 1. 数据级别权限控制（行级权限）
```javascript
// 只能看到自己部门的数据
async getUserList(req, res, next) {
  const where = {};
  
  // 非管理员只能看自己部门
  if (!await permissionService.hasRole(req.user.id, 'admin')) {
    where.departmentId = req.user.departmentId;
  }
  
  const users = await User.findAll({ where });
  res.json(success(users));
}
```

### 2. 动态权限（基于条件的权限）
```javascript
// 可以编辑自己创建的内容，或者拥有编辑权限
const canEdit = 
  resource.createdBy === req.user.id || 
  await permissionService.hasPermission(req.user.id, 'content:edit-all');
```

### 3. 权限缓存（提升性能）
```javascript
const redis = require('redis');
const client = redis.createClient();

async hasPermission(userId, permissionCodes) {
  // 先从缓存获取
  const cacheKey = `user:${userId}:permissions`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached).some(p => permissionCodes.includes(p));
  }
  
  // 缓存未命中，查询数据库
  const permissions = await this.getUserPermissions(userId);
  await client.setex(cacheKey, 300, JSON.stringify(permissions));
  
  return permissions.some(p => permissionCodes.includes(p.code));
}
```

### 4. 前端权限指令（Vue 示例）
```javascript
// src/directives/permission.js
export default {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = store.getters.permissions;
    
    if (value && !permissions.includes(value)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  }
};

// 使用
<button v-permission="'user:delete'">删除用户</button>
```

### 5. API 级别的权限装饰器
```javascript
// 使用装饰器简化权限检查（需要装饰器支持）
class UserController {
  @RequirePermission('user:read')
  async getUserList(req, res, next) {
    // ...
  }
  
  @RequireRole('admin')
  async deleteUser(req, res, next) {
    // ...
  }
}
```

---

## 📊 权限级别对比

| 级别 | 说明 | 当前支持 | 示例 |
|-----|------|---------|------|
| **无权限** | 公开接口 | ✅ | 登录、注册 |
| **认证级别** | 只需登录 | ✅ | 查看个人信息 |
| **角色级别** | 基于角色 | ✅ | 管理员专属功能 |
| **权限级别** | 基于细粒度权限 | ✅ | user:read, user:create |
| **资源所有者** | 只能操作自己的资源 | ⚠️ 框架已有，需完善 | 编辑自己的文章 |
| **数据级别** | 行级数据过滤 | ❌ 需自行实现 | 只看自己部门数据 |
| **字段级别** | 字段级别控制 | ❌ 需自行实现 | 隐藏敏感字段 |

---

## 🎯 总结

### 当前权限系统成熟度：**70%**

✅ **已完成**：
- 完整的 RBAC 数据模型
- 角色和权限的 CRUD 操作
- 5 种权限检查中间件
- 服务层权限检查方法
- 用户状态控制
- 基础安全保护

⚠️ **需要完善**：
- 路由级别应用权限中间件
- 初始化权限数据
- 前端权限控制
- 资源所有者检查的完整实现

❌ **未实现**：
- 数据级别权限
- 字段级别权限
- 权限缓存
- 审计日志

### 建议优先级

1. **高优先级**：在现有路由中添加权限中间件
2. **高优先级**：初始化权限数据并分配给角色
3. **中优先级**：实现前端权限控制
4. **中优先级**：完善资源所有者检查
5. **低优先级**：添加权限缓存提升性能
6. **低优先级**：实现数据级别权限

---

## 📞 需要帮助？

如果需要实现上述任何功能，请告诉我具体需求，我可以帮你：
1. 为所有路由添加权限控制
2. 创建权限初始化脚本
3. 实现前端权限指令
4. 添加权限缓存
5. 实现数据级别权限

---

**文档版本**: v1.0  
**最后更新**: 2026-08-13
