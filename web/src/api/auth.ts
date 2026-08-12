import request from '@/utils/request'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@/types/api'

/**
 * 用户登录
 */
export const login = (data: LoginRequest) => {
  return request<ApiResponse<LoginResponse>>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 */
export const register = (data: RegisterRequest) => {
  return request<ApiResponse<User>>({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 获取当前用户信息
 */
export const getProfile = () => {
  return request<ApiResponse<User>>({
    url: '/auth/profile',
    method: 'get'
  })
}

/**
 * 更新用户信息
 */
export const updateProfile = (data: UpdateProfileRequest) => {
  return request<ApiResponse<User>>({
    url: '/auth/profile',
    method: 'put',
    data
  })
}

/**
 * 修改密码
 */
export const changePassword = (data: ChangePasswordRequest) => {
  return request<ApiResponse<null>>({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

/**
 * 登出
 */
export const logout = () => {
  return request<ApiResponse<null>>({
    url: '/auth/logout',
    method: 'post'
  })
}
