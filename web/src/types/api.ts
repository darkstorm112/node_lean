/**
 * API 响应类型定义
 */

// 统一响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// 用户信息
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  realName?: string
  avatar?: string
  status: number
  roles?: Role[]
  createdAt: string
  updatedAt: string
}

// 角色
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions?: Permission[]
}

// 权限
export interface Permission {
  id: number
  name: string
  code: string
  resource: string
  action: string
  description?: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  user: User
  token: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  email: string
  phone?: string
  realName?: string
}

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// 更新个人资料请求
export interface UpdateProfileRequest {
  email?: string
  phone?: string
  realName?: string
  avatar?: string
}
