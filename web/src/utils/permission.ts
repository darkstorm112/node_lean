import { useUserStore } from '@/store/user'

/**
 * 权限工具类
 */
class PermissionUtil {
  /**
   * 检查用户是否有指定权限
   * @param permission 权限码，如 'user:create' 或 ['user:create', 'user:update']
   * @returns boolean
   */
  hasPermission(permission: string | string[]): boolean {
    const userStore = useUserStore()
    const userPermissions = userStore.permissions

    if (!userPermissions || userPermissions.length === 0) {
      return false
    }

    // 如果是数组，只要有一个权限匹配就返回 true
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.includes(p))
    }

    // 单个权限检查
    return userPermissions.includes(permission)
  }

  /**
   * 检查用户是否有指定角色
   * @param role 角色编码，如 'admin' 或 ['admin', 'manager']
   * @returns boolean
   */
  hasRole(role: string | string[]): boolean {
    const userStore = useUserStore()
    const userRoles = userStore.roles

    if (!userRoles || userRoles.length === 0) {
      return false
    }

    // 如果是数组，只要有一个角色匹配就返回 true
    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    }

    // 单个角色检查
    return userRoles.includes(role)
  }

  /**
   * 检查用户是否有所有指定权限
   * @param permissions 权限码数组
   * @returns boolean
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userStore = useUserStore()
    const userPermissions = userStore.permissions

    if (!userPermissions || userPermissions.length === 0) {
      return false
    }

    return permissions.every(p => userPermissions.includes(p))
  }

  /**
   * 检查用户是否有所有指定角色
   * @param roles 角色编码数组
   * @returns boolean
   */
  hasAllRoles(roles: string[]): boolean {
    const userStore = useUserStore()
    const userRoles = userStore.roles

    if (!userRoles || userRoles.length === 0) {
      return false
    }

    return roles.every(r => userRoles.includes(r))
  }

  /**
   * 检查是否是管理员
   */
  isAdmin(): boolean {
    return this.hasRole('admin')
  }
}

export const permission = new PermissionUtil()

/**
 * 导出便捷方法
 */
export const hasPermission = (perm: string | string[]) => permission.hasPermission(perm)
export const hasRole = (role: string | string[]) => permission.hasRole(role)
export const hasAllPermissions = (perms: string[]) => permission.hasAllPermissions(perms)
export const hasAllRoles = (roles: string[]) => permission.hasAllRoles(roles)
export const isAdmin = () => permission.isAdmin()
