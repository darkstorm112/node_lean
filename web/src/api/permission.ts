import request from '@/utils/request'
import type { ApiResponse, Permission } from '@/types/api'

/**
 * 权限管理 API
 */

// 获取所有权限（不分页）
export const getAllPermissions = () => {
  return request.get<ApiResponse<Permission[]>>('/permissions')
}

// 获取权限列表（分页）
export interface GetPermissionListParams {
  page: number
  pageSize: number
  resource?: string
  action?: string
}

export interface PermissionListResponse {
  items: Permission[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const getPermissionList = (params: GetPermissionListParams) => {
  return request.get<ApiResponse<PermissionListResponse>>('/permissions/list', { params })
}

// 获取权限详情
export const getPermissionDetail = (id: number) => {
  return request.get<ApiResponse<Permission>>(`/permissions/${id}`)
}

// 创建权限
export interface CreatePermissionData {
  name: string
  code: string
  resource: string
  action: string
  description?: string
}

export const createPermission = (data: CreatePermissionData) => {
  return request.post<ApiResponse<Permission>>('/permissions', data)
}

// 更新权限
export interface UpdatePermissionData {
  name?: string
  description?: string
}

export const updatePermission = (id: number, data: UpdatePermissionData) => {
  return request.put<ApiResponse<Permission>>(`/permissions/${id}`, data)
}

// 删除权限
export const deletePermission = (id: number) => {
  return request.delete<ApiResponse<null>>(`/permissions/${id}`)
}
