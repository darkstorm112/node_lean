import request from '@/utils/request'

export interface Log {
  id: number
  userId: number
  action: string
  resource: string
  resourceId?: number
  ip?: string
  userAgent?: string
  detail?: any
  user?: {
    id: number
    username: string
    realName?: string
    email: string
  }
  createdAt: string
}

export interface LogListParams {
  page?: number
  pageSize?: number
  action?: string
  resource?: string
  userId?: number
  startDate?: string
  endDate?: string
}

/**
 * 获取日志列表
 */
export const getLogList = (params: LogListParams) => {
  return request.get('/logs', { params })
}

/**
 * 获取日志详情
 */
export const getLogDetail = (id: number) => {
  return request.get(`/logs/${id}`)
}
