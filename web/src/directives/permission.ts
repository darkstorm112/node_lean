import type { App, Directive } from 'vue'
import { permission } from '@/utils/permission'

/**
 * 权限指令 v-permission
 * 用法：
 * v-permission="'user:create'" - 单个权限
 * v-permission="['user:create', 'user:update']" - 多个权限（任一满足）
 */
const permissionDirective: Directive = {
  mounted(el, binding) {
    const { value } = binding

    if (value) {
      const hasAuth = permission.hasPermission(value)
      if (!hasAuth) {
        // 没有权限，移除元素
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限！如 v-permission="\'user:create\'"')
    }
  }
}

/**
 * 角色指令 v-role
 * 用法：
 * v-role="'admin'" - 单个角色
 * v-role="['admin', 'manager']" - 多个角色（任一满足）
 */
const roleDirective: Directive = {
  mounted(el, binding) {
    const { value } = binding

    if (value) {
      const hasAuth = permission.hasRole(value)
      if (!hasAuth) {
        // 没有角色，移除元素
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定角色！如 v-role="\'admin\'"')
    }
  }
}

/**
 * 权限指令（所有权限都要满足）v-permission-all
 * 用法：
 * v-permission-all="['user:create', 'user:update']" - 必须同时拥有这些权限
 */
const permissionAllDirective: Directive = {
  mounted(el, binding) {
    const { value } = binding

    if (value && Array.isArray(value)) {
      const hasAuth = permission.hasAllPermissions(value)
      if (!hasAuth) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限数组！如 v-permission-all="[\'user:create\', \'user:update\']"')
    }
  }
}

/**
 * 注册所有权限指令
 */
export function setupPermissionDirectives(app: App) {
  app.directive('permission', permissionDirective)
  app.directive('role', roleDirective)
  app.directive('permission-all', permissionAllDirective)
}
