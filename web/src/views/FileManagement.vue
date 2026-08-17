<template>
  <div class="file-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="文件名">
          <el-input v-model="searchForm.originalName" placeholder="请输入文件名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-upload
        :action="uploadAction"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        :disabled="uploading"
      >
        <el-button type="primary" :icon="Upload" :loading="uploading">
          上传文件
        </el-button>
      </el-upload>
    </el-card>

    <!-- 文件表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="fileList" stripe>
        <el-table-column prop="originalName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="mimeType" label="文件类型" width="180" />
        <el-table-column label="上传者" width="120">
          <template #default="{ row }">
            {{ row.uploader?.realName || row.uploader?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canPreview(row)" type="success" size="small" :icon="View" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button type="primary" size="small" :icon="Download" @click="handleDownload(row)">
              下载
            </el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end" />
    </el-card>

    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewFile?.originalName"
      :width="isOffice(previewFile) ? '95%' : '900px'"
      @close="handlePreviewClose"
    >
      <div class="preview-container">
        <!-- 图片预览 - 使用 Element Plus Image 组件 -->
        <div v-if="isImage(previewFile)" class="preview-image">
          <el-image
            :src="previewUrl"
            :preview-src-list="[previewUrl]"
            fit="contain"
            style="max-width: 100%; max-height: 70vh"
            :initial-index="0"
            hide-on-click-modal
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
        </div>

        <!-- PDF预览 -->
        <div v-else-if="isPdf(previewFile)" class="preview-pdf">
          <iframe :src="previewUrl" style="width: 100%; height: 70vh; border: none"></iframe>
        </div>

        <!-- Office 文档预览 -->
        <div v-else-if="isOffice(previewFile)" class="preview-office">
          <div class="office-tips">
            <el-alert
              :title="FILE_VIEW_URL ? 'Office 文档预览' : 'Office 文档预览说明'"
              :type="FILE_VIEW_URL ? 'success' : 'warning'"
              :closable="false"
              style="margin-bottom: 10px"
            >
              <template #default>
                <div v-if="FILE_VIEW_URL">
                  使用 kkFileView 提供预览服务
                </div>
                <div v-else>
                  <div>使用微软 Office Online 提供预览服务</div>
                  <div style="font-size: 12px; margin-top: 5px; color: #909399;">
                    如果预览失败，请配置 kkFileView 服务或确保文件可公网访问
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
          <iframe :src="previewUrl" style="width: 100%; height: 75vh; border: 1px solid #dcdfe6"></iframe>
        </div>

        <!-- 文本文件预览 -->
        <div v-else-if="isText(previewFile)" class="preview-text">
          <el-input v-model="previewContent" type="textarea" :rows="20" readonly />
        </div>

        <!-- 不支持预览的文件 -->
        <div v-else class="preview-unsupported">
          <el-empty description="该文件类型不支持在线预览，请下载后查看">
            <el-button type="primary" @click="handleDownload(previewFile!)">下载文件</el-button>
          </el-empty>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Upload,
  Download,
  Delete,
  View,
  Picture
} from '@element-plus/icons-vue'
import * as fileApi from '@/api/file'
import type { File } from '@/api/file'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// kkFileView 配置
const FILE_VIEW_URL = import.meta.env.VITE_FILE_VIEW_URL

// 搜索表单
const searchForm = reactive({
  originalName: ''
})

// 文件列表
const fileList = ref<File[]>([])
const loading = ref(false)
const uploading = ref(false)

// 预览相关
const previewDialogVisible = ref(false)
const previewFile = ref<File | null>(null)
const previewUrl = ref('')
const previewContent = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 上传配置
const uploadAction = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/files/upload`
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

// 获取文件列表
const fetchFileList = async () => {
  loading.value = true
  try {
    const response = await fileApi.getFileList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      originalName: searchForm.originalName || undefined
    })

    if (response.success && response.data) {
      fileList.value = response.data.items
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchFileList()
}

// 重置
const handleReset = () => {
  searchForm.originalName = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchFileList()
}

const handlePageChange = () => {
  fetchFileList()
}

// 上传前检查
const beforeUpload = (file: any) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  uploading.value = true
  return true
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  uploading.value = false
  if (response.code === 200 || response.code === 201) {
    ElMessage.success(response.message || '文件上传成功')
    fetchFileList()
  } else {
    ElMessage.error(response.message || '文件上传失败')
  }
}

// 上传失败
const handleUploadError = (error: any) => {
  uploading.value = false
  console.error('文件上传失败:', error)
  ElMessage.error('文件上传失败')
}

// 下载文件
const handleDownload = async (row: File) => {
  try {
    const response = await fileApi.downloadFile(row.id)

    // 创建 blob 对象
    const blob = new Blob([response])

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.originalName
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败')
  }
}

// 判断是否可以预览
const canPreview = (file: File) => {
  return isImage(file) || isPdf(file) || isText(file) || isOffice(file)
}

// 判断是否是图片
const isImage = (file: File | null) => {
  if (!file) return false
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return imageTypes.includes(file.mimeType)
}

// 判断是否是PDF
const isPdf = (file: File | null) => {
  if (!file) return false
  return file.mimeType === 'application/pdf'
}

// 判断是否是文本文件
const isText = (file: File | null) => {
  if (!file) return false
  const textTypes = ['text/plain', 'text/csv', 'application/json']
  return textTypes.includes(file.mimeType)
}

// 判断是否是 Office 文档
const isOffice = (file: File | null) => {
  if (!file) return false
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  return officeTypes.includes(file.mimeType)
}

// 预览文件
const handlePreview = async (row: File) => {
  previewFile.value = row
  previewDialogVisible.value = true

  try {
    if (isImage(row) || isPdf(row)) {
      // 图片和PDF直接使用URL预览，添加时间戳避免缓存
      const timestamp = new Date().getTime()
      const response = await fileApi.downloadFile(row.id)
      const blob = new Blob([response], { type: row.mimeType })
      previewUrl.value = window.URL.createObjectURL(blob)
    } else if (isText(row)) {
      // 文本文件读取内容
      const response = await fileApi.downloadFile(row.id)
      const blob = new Blob([response])
      const text = await blob.text()
      previewContent.value = text
    } else if (isOffice(row)) {
      // Office 文档使用在线预览
      const fileUrl = `${window.location.origin}/api/files/${row.id}/download`

      if (FILE_VIEW_URL) {
        // 使用 kkFileView（推荐）
        previewUrl.value = `${FILE_VIEW_URL}/onlinePreview?url=${encodeURIComponent(fileUrl)}`
      } else {
        // 使用微软 Office Online Viewer（需要公网访问）
        previewUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
      }
    }
  } catch (error: any) {
    console.error('预览文件失败:', error)
    ElMessage.error(error.response?.data?.message || '预览文件失败')
    previewDialogVisible.value = false
  }
}

// 关闭预览对话框
const handlePreviewClose = () => {
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  previewContent.value = ''
  previewFile.value = null
}

// 删除文件
const handleDelete = async (row: File) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 "${row.originalName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await fileApi.deleteFile(row.id)
    ElMessage.success('删除成功')
    fetchFileList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
    }
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(() => {
  fetchFileList()
})
</script>

<style scoped>
.file-management {
  width: 100%;
}

.search-card,
.toolbar-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.preview-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.image-error .el-icon {
  font-size: 60px;
  margin-bottom: 10px;
}

.preview-pdf,
.preview-text,
.preview-office {
  width: 100%;
}

.office-tips {
  margin-bottom: 10px;
}

.preview-unsupported {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
