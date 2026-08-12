import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/**
 * 角色信息
 */
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  permissions?: Permission[]
}

/**
 * 权限信息
 */
export interface Permission {
  id: number
  name: string
  code: string
  resource: string
  action: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 角色列表响应
 */
export interface RoleListResponse {
  items: Role[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissionIds?: number[]
}

/**
 * 更新角色请求
 */
export interface UpdateRoleRequest {
  name?: string
  description?: string
  status?: string
  permissionIds?: number[]
}

/**
 * 获取角色列表
 */
export const getRoleList = (params?: any) => {
  return request<ApiResponse<RoleListResponse>>({
    url: '/roles',
    method: 'get',
    params
  })
}

/**
 * 获取所有角色（不分页）
 */
export const getAllRoles = () => {
  return request<ApiResponse<Role[]>>({
    url: '/roles/all',
    method: 'get'
  })
}

/**
 * 获取角色详情
 */
export const getRoleDetail = (id: number) => {
  return request<ApiResponse<Role>>({
    url: `/roles/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 */
export const createRole = (data: CreateRoleRequest) => {
  return request<ApiResponse<Role>>({
    url: '/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export const updateRole = (id: number, data: UpdateRoleRequest) => {
  return request<ApiResponse<Role>>({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export const deleteRole = (id: number) => {
  return request<ApiResponse<null>>({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 获取角色的权限列表
 */
export const getRolePermissions = (id: number) => {
  return request<ApiResponse<Permission[]>>({
    url: `/roles/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 分配角色权限
 */
export const assignRolePermissions = (id: number, permissionIds: number[]) => {
  return request<ApiResponse<null>>({
    url: `/roles/${id}/permissions`,
    method: 'post',
    data: { permissionIds }
  })
}

/**
 * 获取所有权限
 */
export const getAllPermissions = () => {
  return request<ApiResponse<Permission[]>>({
    url: '/permissions',
    method: 'get'
  })
}

/**
 * 获取权限列表（分页）
 */
export const getPermissionList = (params?: any) => {
  return request<ApiResponse<any>>({
    url: '/permissions/list',
    method: 'get',
    params
  })
}
