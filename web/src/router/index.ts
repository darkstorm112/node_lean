import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import { hasPermission, hasRole } from '@/utils/permission'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          permission: 'user:read', // 需要用户查看权限
          role: ['admin', 'manager'] // 或者具有管理员/经理角色
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/RoleManagement.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true,
          permission: 'role:read', // 需要角色查看权限
          role: 'admin' // 仅管理员可访问
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Node Lean`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    next('/')
    return
  }

  // 权限检查
  if (to.meta.requiresAuth && userStore.isLoggedIn) {
    // 检查路由权限
    if (to.meta.permission) {
      const hasPerm = hasPermission(to.meta.permission as string | string[])
      if (!hasPerm) {
        // 检查角色权限（作为后备）
        if (to.meta.role) {
          const hasRolePerm = hasRole(to.meta.role as string | string[])
          if (!hasRolePerm) {
            // 没有权限，跳转到首页
            next('/dashboard')
            return
          }
        } else {
          next('/dashboard')
          return
        }
      }
    } else if (to.meta.role) {
      // 仅检查角色
      const hasRolePerm = hasRole(to.meta.role as string | string[])
      if (!hasRolePerm) {
        next('/dashboard')
        return
      }
    }
  }

  next()
})

export default router
