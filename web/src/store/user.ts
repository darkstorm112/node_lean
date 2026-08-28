import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/api'
import * as authApi from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<User | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null
  )

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const userId = computed(() => userInfo.value?.id || 0)

  // 获取用户角色编码列表
  const roles = computed(() => {
    if (!userInfo.value?.roles) return []
    return userInfo.value.roles.map(role => role.code)
  })

  // 获取用户权限编码列表
  const permissions = computed(() => {
    if (!userInfo.value?.roles) return []
    const permSet = new Set<string>()
    userInfo.value.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(perm => {
          permSet.add(perm.code)
        })
      }
    })
    return Array.from(permSet)
  })

  // 检查是否是管理员
  const isAdmin = computed(() => roles.value.includes('admin'))

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  const setUserInfo = (user: User) => {
    userInfo.value = user
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password }) as any
    if (response.success && response.data) {
      setToken(response.data.token)
      setUserInfo(response.data.user)
      return response.data
    }
    throw new Error('登录失败')
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }

  const fetchUserInfo = async () => {
    const response = await authApi.getProfile() as any
    if (response.success && response.data) {
      setUserInfo(response.data)
      return response.data
    }
    throw new Error('获取用户信息失败')
  }

  const updateUserInfo = async (data: any) => {
    const response = await authApi.updateProfile(data) as any
    if (response.success && response.data) {
      setUserInfo(response.data)
      return response.data
    }
    throw new Error('更新用户信息失败')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    userId,
    roles,
    permissions,
    isAdmin,
    setToken,
    setUserInfo,
    login,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})
