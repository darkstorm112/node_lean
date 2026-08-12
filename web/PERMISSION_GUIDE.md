# 权限指令使用指南

## 概述

项目中提供了三个权限相关的自定义指令，用于控制页面元素的显示和隐藏。

## 指令说明

### 1. v-permission

根据权限码控制元素显示（任一权限满足即可）

**用法：**

```vue
<!-- 单个权限 -->
<el-button v-permission="'user:create'">新增用户</el-button>

<!-- 多个权限（满足任一即可） -->
<el-button v-permission="['user:create', 'user:update']">编辑</el-button>
```

### 2. v-role

根据角色控制元素显示（任一角色满足即可）

**用法：**

```vue
<!-- 单个角色 -->
<el-button v-role="'admin'">管理员功能</el-button>

<!-- 多个角色（满足任一即可） -->
<div v-role="['admin', 'manager']">管理界面</div>
```

### 3. v-permission-all

根据权限码控制元素显示（必须同时拥有所有权限）

**用法：**

```vue
<!-- 必须同时拥有这些权限 -->
<el-button v-permission-all="['user:create', 'user:delete']">
  批量操作
</el-button>
```

## 工具函数

除了指令外，还可以在 JS/TS 代码中使用权限工具函数：

```typescript
import { hasPermission, hasRole, hasAllPermissions, isAdmin } from '@/utils/permission'

// 检查单个或多个权限（任一满足）
if (hasPermission('user:create')) {
  // 有权限
}

if (hasPermission(['user:create', 'user:update'])) {
  // 有任一权限
}

// 检查角色
if (hasRole('admin')) {
  // 是管理员
}

// 检查是否拥有所有权限
if (hasAllPermissions(['user:create', 'user:update'])) {
  // 同时拥有这些权限
}

// 检查是否是管理员
if (isAdmin()) {
  // 是管理员
}
```

## 在组件中使用

```vue
<template>
  <div>
    <!-- 使用指令控制按钮显示 -->
    <el-button v-permission="'user:create'" type="primary">新增</el-button>
    <el-button v-permission="'user:update'" type="warning">编辑</el-button>
    <el-button v-permission="'user:delete'" type="danger">删除</el-button>
    
    <!-- 使用角色控制 -->
    <el-button v-role="'admin'" type="success">管理员操作</el-button>
    
    <!-- 在 JS 中判断 -->
    <el-button v-if="canCreate" @click="handleCreate">创建</el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasPermission } from '@/utils/permission'

const canCreate = computed(() => hasPermission('user:create'))

const handleCreate = () => {
  if (!hasPermission('user:create')) {
    ElMessage.warning('您没有创建权限')
    return
  }
  // 执行创建操作
}
</script>
```

## 路由权限控制

在路由配置中可以设置页面权限：

```typescript
{
  path: 'users',
  name: 'UserManagement',
  component: () => import('@/views/UserManagement.vue'),
  meta: { 
    title: '用户管理', 
    requiresAuth: true,
    permission: 'user:read', // 需要的权限
    role: 'admin' // 需要的角色
  }
}
```

## 权限码规范

权限码格式：`资源:操作`

常用操作：
- `read` - 查看
- `create` - 创建
- `update` - 更新
- `delete` - 删除
- `assign` - 分配
- `approve` - 审批

示例：
- `user:read` - 查看用户
- `user:create` - 创建用户
- `user:update` - 更新用户
- `user:delete` - 删除用户
- `role:assign-permission` - 分配角色权限

## 注意事项

1. 权限指令会在没有权限时直接移除 DOM 元素
2. 建议在需要细粒度权限控制的按钮和操作上使用指令
3. 对于整个页面或路由的权限控制，建议在路由配置中设置
4. 后端也应该做权限验证，前端权限控制仅用于优化用户体验
