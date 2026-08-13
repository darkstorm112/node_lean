# 动态菜单路由使用指南

## 概述

系统支持基于用户权限和角色的动态菜单生成。不同权限的用户登录后，会看到不同的菜单选项。

## 菜单配置

菜单配置在 `src/store/menu.ts` 中的 `allMenus` 数组：

```typescript
const allMenus: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: '仪表板',
    icon: 'Odometer'
    // 无权限要求，所有用户都能看到
  },
  {
    path: '/users',
    name: 'UserManagement',
    title: '用户管理',
    icon: 'User',
    permission: 'user:read',      // 需要的权限
    role: ['admin', 'manager']    // 需要的角色（任一满足）
  },
  {
    path: '/roles',
    name: 'RoleManagement',
    title: '角色管理',
    icon: 'Setting',
    permission: 'role:read',
    role: 'admin'                 // 仅管理员可见
  }
]
```

## 菜单项配置说明

### MenuItem 接口

```typescript
interface MenuItem {
  path: string          // 路由路径
  name: string          // 路由名称
  title: string         // 菜单显示标题
  icon?: string         // 图标（Element Plus Icons 组件名）
  permission?: string | string[]  // 需要的权限码
  role?: string | string[]        // 需要的角色
  hidden?: boolean      // 是否隐藏
  children?: MenuItem[] // 子菜单
}
```

### 权限判断逻辑

菜单显示遵循以下规则：

1. **无权限配置** - 所有用户都能看到
2. **仅配置 permission** - 用户拥有任一权限即可看到
3. **仅配置 role** - 用户拥有任一角色即可看到
4. **同时配置 permission 和 role** - 满足任一条件即可看到
5. **hidden: true** - 菜单项永远不显示

## 添加新菜单

### 1. 在菜单配置中添加

编辑 `src/store/menu.ts`：

```typescript
const allMenus: MenuItem[] = [
  // 现有菜单...
  {
    path: '/settings',
    name: 'Settings',
    title: '系统设置',
    icon: 'Setting',
    permission: 'system:setting',
    role: 'admin'
  }
]
```

### 2. 在路由配置中添加

编辑 `src/router/index.ts`：

```typescript
{
  path: 'settings',
  name: 'Settings',
  component: () => import('@/views/Settings.vue'),
  meta: {
    title: '系统设置',
    requiresAuth: true,
    permission: 'system:setting',
    role: 'admin'
  }
}
```

### 3. 创建对应的页面组件

创建 `src/views/Settings.vue`

## 多级菜单

支持子菜单配置：

```typescript
{
  path: '/system',
  name: 'System',
  title: '系统管理',
  icon: 'Setting',
  role: 'admin',
  children: [
    {
      path: '/system/users',
      name: 'SystemUsers',
      title: '用户管理',
      icon: 'User',
      permission: 'user:read'
    },
    {
      path: '/system/roles',
      name: 'SystemRoles',
      title: '角色管理',
      icon: 'Key',
      permission: 'role:read'
    }
  ]
}
```

## 图标使用

使用 Element Plus Icons 的组件名作为图标：

- `Odometer` - 仪表盘
- `User` - 用户
- `Setting` - 设置
- `Key` - 钥匙/权限
- `Document` - 文档
- `Folder` - 文件夹
- `DataAnalysis` - 数据分析
- `Files` - 文件
- `List` - 列表
- `Monitor` - 监控

更多图标请参考：https://element-plus.org/zh-CN/component/icon.html

## 菜单刷新

菜单在以下时机会自动更新：

1. **用户登录时** - 根据用户权限生成菜单
2. **应用启动时** - 如果已登录，自动生成菜单
3. **用户登出时** - 清空菜单

手动刷新菜单：

```typescript
import { useMenuStore } from '@/store/menu'

const menuStore = useMenuStore()
menuStore.generateMenus()
```

## 注意事项

1. **菜单配置要与路由配置保持一致** - `path` 和 `name` 应该对应
2. **权限码要与后端保持一致** - 确保前后端使用相同的权限码
3. **图标组件名区分大小写** - 必须与 Element Plus Icons 中的组件名完全一致
4. **权限和角色是或的关系** - 满足任一条件即可显示菜单

## 常见问题

### Q: 为什么菜单不显示？

A: 检查以下几点：
1. 用户是否拥有对应的权限或角色
2. 菜单配置是否正确
3. 是否调用了 `menuStore.generateMenus()`

### Q: 如何隐藏某个菜单项？

A: 在菜单配置中设置 `hidden: true`

### Q: 如何让所有用户都能看到某个菜单？

A: 不设置 `permission` 和 `role` 字段

### Q: 菜单更新后没有生效？

A: 需要重新登录或调用 `menuStore.generateMenus()` 刷新菜单
