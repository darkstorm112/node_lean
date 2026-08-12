import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'
import type { ApiResponse } from '@/types/api'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 添加 token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const res = response.data

    // 后端返回格式: {code, message, data}
    // 转换为前端期望格式: {success, message, data}
    const success = res.code >= 200 && res.code < 300

    const apiResponse: ApiResponse = {
      success,
      data: res.data,
      message: res.message,
      code: res.code
    }

    // 如果响应成功
    if (success) {
      return apiResponse
    }

    // 业务错误处理（code 不是 2xx 但 HTTP 状态码是 200）
    // 显示后端返回的错误消息
    ElMessage.error(res.message || '请求失败')

    // 创建错误对象并标记为已处理，避免在错误拦截器中重复提示
    const error: any = new Error(res.message || '请求失败')
    error._handled = true
    error.response = response

    return Promise.reject(error)
  },
  (error: AxiosError<any>) => {
    console.error('响应错误:', error)

    // 如果错误已经被业务层处理过（有 _handled 标记），直接 reject 不显示提示
    if ((error as any)._handled) {
      return Promise.reject(error)
    }

    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      // 提取后端错误消息，优先使用 data.message
      const message = data?.message || data?.error?.message || data?.error

      // 只显示一次错误消息
      switch (status) {
        case 401:
          ElMessage.error(message || '未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error(message || '没有权限访问')
          break
        case 404:
          ElMessage.error(message || '请求的资源不存在')
          break
        case 500:
          // 500 错误：显示后端返回的具体错误消息
          ElMessage.error(message || '服务器错误')
          break
        default:
          ElMessage.error(message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error(error.message || '请求配置错误')
    }

    // 标记错误已处理，防止再次触发
    ;(error as any)._handled = true

    return Promise.reject(error)
  }
)

export default service
