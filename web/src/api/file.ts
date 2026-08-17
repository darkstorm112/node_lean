import request from '@/utils/request'

export interface File {
  id: number
  originalName: string
  storedName: string
  path: string
  size: number
  mimeType: string
  uploaderId: number
  relatedType?: string
  relatedId?: number
  uploader?: {
    id: number
    username: string
    realName?: string
    email: string
  }
  createdAt: string
}

export interface FileListParams {
  page?: number
  pageSize?: number
  originalName?: string
  mimeType?: string
}

/**
 * 上传文件
 */
export const uploadFile = (file: File, relatedType?: string, relatedId?: number, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)
  if (relatedType) formData.append('relatedType', relatedType)
  if (relatedId) formData.append('relatedId', relatedId.toString())

  return request.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

/**
 * 获取文件列表
 */
export const getFileList = (params: FileListParams) => {
  return request.get('/files', { params })
}

/**
 * 获取文件详情
 */
export const getFileDetail = (id: number) => {
  return request.get(`/files/${id}`)
}

/**
 * 下载文件
 */
export const downloadFile = (id: number) => {
  return request.get(`/files/${id}/download`, {
    responseType: 'blob'
  })
}

/**
 * 删除文件
 */
export const deleteFile = (id: number) => {
  return request.delete(`/files/${id}`)
}
