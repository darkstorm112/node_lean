import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import { useUserStore } from './user'

// 菜单项接口
export interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  permission?: string | string[]
  role?: string | string[]
  hidden?: boolean
  children?: MenuItem[]
}

export const useMenuStore = defineStore('menu', () => {
  const userStore = useUserStore()
  const menuList = ref<MenuItem[]>([])

  // 完整的菜单配置
  const allMenus: MenuItem[] = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      title: '仪表板',
      icon: 'Odometer'
    },
    {
      path: '/users',
      name: 'UserManagement',
      title: '用户管理',
      icon: 'User',
      permission: 'user:read',
      role: ['admin', 'manager']
    },
    {
      path: '/roles',
      name: 'RoleManagement',
      title: '角色管理',
      icon: 'Setting',
      permission: 'role:read',
      role: 'admin'
    },
    {
      path: '/permissions',
      name: 'PermissionManagement',
      title: '权限管理',
      icon: 'Lock',
      permission: 'permission:read',
      role: 'admin'
    },
    {
      path: '/profile',
      name: 'Profile',
      title: '个人中心',
      icon: 'User'
    }
  ]

  /**
   * 检查菜单权限
   */
  const hasMenuPermission = (menu: MenuItem): boolean => {
    // 如果菜单设置为隐藏，直接返回 false
    if (menu.hidden) {
      return false
    }

    // 如果没有设置权限和角色，默认显示
    if (!menu.permission && !menu.role) {
      return true
    }

    // 检查权限
    if (menu.permission) {
      const permissions = Array.isArray(menu.permission) ? menu.permission : [menu.permission]
      const hasPermission = permissions.some(p => userStore.permissions.includes(p))
      if (hasPermission) {
        return true
      }
    }

    // 检查角色
    if (menu.role) {
      const roles = Array.isArray(menu.role) ? menu.role : [menu.role]
      const hasRole = roles.some(r => userStore.roles.includes(r))
      if (hasRole) {
        return true
      }
    }

    return false
  }

  /**
   * 过滤菜单
   */
  const filterMenus = (menus: MenuItem[]): MenuItem[] => {
    return menus.filter(menu => {
      if (!hasMenuPermission(menu)) {
        return false
      }

      // 如果有子菜单，递归过滤
      if (menu.children && menu.children.length > 0) {
        menu.children = filterMenus(menu.children)
      }

      return true
    })
  }

  /**
   * 生成用户菜单
   */
  const generateMenus = () => {
    menuList.value = filterMenus(JSON.parse(JSON.stringify(allMenus)))
  }

  /**
   * 清空菜单
   */
  const clearMenus = () => {
    menuList.value = []
  }

  return {
    menuList,
    allMenus,
    generateMenus,
    clearMenus,
    hasMenuPermission
  }
})
