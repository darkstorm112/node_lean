import request from '@/utils/request'

export interface Ticket {
  id: number
  title: string
  content: string
  type: 'leave' | 'reimbursement' | 'purchase' | 'other'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'rejected'
  creatorId: number
  approverId?: number
  approvedAt?: string
  rejectReason?: string
  creator?: {
    id: number
    username: string
    realName?: string
    email: string
  }
  approver?: {
    id: number
    username: string
    realName?: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface TicketListParams {
  page?: number
  pageSize?: number
  title?: string
  type?: string
  priority?: string
  status?: string
}

export interface CreateTicketData {
  title: string
  content: string
  type?: 'leave' | 'reimbursement' | 'purchase' | 'other'
  priority?: 'low' | 'medium' | 'high'
}

export interface UpdateTicketData {
  title?: string
  content?: string
  type?: 'leave' | 'reimbursement' | 'purchase' | 'other'
  priority?: 'low' | 'medium' | 'high'
}

/**
 * 获取工单列表
 */
export const getTicketList = (params: TicketListParams) => {
  return request.get('/tickets', { params })
}

/**
 * 获取工单详情
 */
export const getTicketDetail = (id: number) => {
  return request.get(`/tickets/${id}`)
}

/**
 * 创建工单
 */
export const createTicket = (data: CreateTicketData) => {
  return request.post('/tickets', data)
}

/**
 * 更新工单
 */
export const updateTicket = (id: number, data: UpdateTicketData) => {
  return request.put(`/tickets/${id}`, data)
}

/**
 * 删除工单
 */
export const deleteTicket = (id: number) => {
  return request.delete(`/tickets/${id}`)
}

/**
 * 审批通过工单
 */
export const approveTicket = (id: number) => {
  return request.post(`/tickets/${id}/approve`)
}

/**
 * 审批拒绝工单
 */
export const rejectTicket = (id: number, rejectReason: string) => {
  return request.post(`/tickets/${id}/reject`, { rejectReason })
}

/**
 * 导出工单到 Excel
 */
export const exportTickets = (params?: any) => {
  return request.get('/tickets/export/excel', {
    params,
    responseType: 'blob'
  })
}

/**
 * 导入工单从 Excel
 */
export const importTickets = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/tickets/import/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载工单导入模板
 */
export const downloadTemplate = () => {
  return request.get('/tickets/template/download', {
    responseType: 'blob'
  })
}
