import request from '@/utils/request'
import type { ApiResponse, User } from '@/types/api'

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page?: number
  pageSize?: number
  username?: string
  email?: string
  status?: string
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  items: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  username: string
  password: string
  email: string
  phone?: string
  realName?: string
  roleIds?: number[]
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  email?: string
  phone?: string
  realName?: string
  status?: string
  roleIds?: number[]
}

/**
 * 获取用户列表
 */
export const getUserList = (params?: UserListParams) => {
  return request<ApiResponse<UserListResponse>>({
    url: '/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 */
export const getUserDetail = (id: number) => {
  return request<ApiResponse<User>>({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export const createUser = (data: CreateUserRequest) => {
  return request<ApiResponse<User>>({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export const updateUser = (id: number, data: UpdateUserRequest) => {
  return request<ApiResponse<User>>({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export const deleteUser = (id: number) => {
  return request<ApiResponse<null>>({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 */
export const batchDeleteUsers = (ids: number[]) => {
  return request<ApiResponse<null>>({
    url: '/users/batch-delete',
    method: 'post',
    data: { ids }
  })
}

/**
 * 重置用户密码
 */
export const resetUserPassword = (id: number, newPassword: string) => {
  return request<ApiResponse<null>>({
    url: `/users/${id}/reset-password`,
    method: 'post',
    data: { newPassword }
  })
}
