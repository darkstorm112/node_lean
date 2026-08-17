<template>
  <div class="log-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action" placeholder="请选择操作类型" clearable style="width: 150px">
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="审批通过" value="approve" />
            <el-option label="审批拒绝" value="reject" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="searchForm.resource" placeholder="请选择资源类型" clearable style="width: 150px">
            <el-option label="用户" value="user" />
            <el-option label="角色" value="role" />
            <el-option label="权限" value="permission" />
            <el-option label="工单" value="ticket" />
            <el-option label="文件" value="file" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="logList" stripe>
        <el-table-column label="操作人" width="120">
          <template #default="{ row }">
            {{ row.user?.realName || row.user?.username }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.action === 'create'" type="success">创建</el-tag>
            <el-tag v-else-if="row.action === 'update'" type="warning">更新</el-tag>
            <el-tag v-else-if="row.action === 'delete'" type="danger">删除</el-tag>
            <el-tag v-else-if="row.action === 'login'" type="primary">登录</el-tag>
            <el-tag v-else-if="row.action === 'logout'" type="info">登出</el-tag>
            <el-tag v-else-if="row.action === 'approve'" type="success">审批通过</el-tag>
            <el-tag v-else-if="row.action === 'reject'" type="danger">审批拒绝</el-tag>
            <el-tag v-else>{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资源类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.resource === 'user'" type="primary">用户</el-tag>
            <el-tag v-else-if="row.resource === 'role'" type="success">角色</el-tag>
            <el-tag v-else-if="row.resource === 'permission'" type="warning">权限</el-tag>
            <el-tag v-else-if="row.resource === 'ticket'" type="info">工单</el-tag>
            <el-tag v-else-if="row.resource === 'file'" type="danger">文件</el-tag>
            <el-tag v-else>{{ row.resource }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resourceId" label="资源ID" width="100" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">
              查看
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

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="日志详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">
          {{ viewLog?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ viewLog?.user?.realName || viewLog?.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag v-if="viewLog?.action === 'create'" type="success">创建</el-tag>
          <el-tag v-else-if="viewLog?.action === 'update'" type="warning">更新</el-tag>
          <el-tag v-else-if="viewLog?.action === 'delete'" type="danger">删除</el-tag>
          <el-tag v-else-if="viewLog?.action === 'login'" type="primary">登录</el-tag>
          <el-tag v-else-if="viewLog?.action === 'logout'" type="info">登出</el-tag>
          <el-tag v-else-if="viewLog?.action === 'approve'" type="success">审批通过</el-tag>
          <el-tag v-else-if="viewLog?.action === 'reject'" type="danger">审批拒绝</el-tag>
          <el-tag v-else>{{ viewLog?.action }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="资源类型">
          <el-tag v-if="viewLog?.resource === 'user'" type="primary">用户</el-tag>
          <el-tag v-else-if="viewLog?.resource === 'role'" type="success">角色</el-tag>
          <el-tag v-else-if="viewLog?.resource === 'permission'" type="warning">权限</el-tag>
          <el-tag v-else-if="viewLog?.resource === 'ticket'" type="info">工单</el-tag>
          <el-tag v-else-if="viewLog?.resource === 'file'" type="danger">文件</el-tag>
          <el-tag v-else>{{ viewLog?.resource }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="资源ID">
          {{ viewLog?.resourceId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ viewLog?.ip || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">
          {{ formatDate(viewLog?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器信息" :span="2">
          <div style="word-break: break-all;">{{ viewLog?.userAgent || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item v-if="viewLog?.detail" label="详细信息" :span="2">
          <pre style="max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;">{{ formatDetail(viewLog.detail) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import * as logApi from '@/api/log'
import type { Log } from '@/api/log'

// 搜索表单
const searchForm = reactive({
  action: '',
  resource: ''
})

const dateRange = ref<[Date, Date] | null>(null)

// 日志列表
const logList = ref<Log[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 查看对话框
const viewDialogVisible = ref(false)
const viewLog = ref<Log | null>(null)

// 获取日志列表
const fetchLogList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      action: searchForm.action || undefined,
      resource: searchForm.resource || undefined
    }

    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }

    const response = await logApi.getLogList(params)

    if (response.success && response.data) {
      logList.value = response.data.items
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('获取日志列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchLogList()
}

// 重置
const handleReset = () => {
  searchForm.action = ''
  searchForm.resource = ''
  dateRange.value = null
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchLogList()
}

const handlePageChange = () => {
  fetchLogList()
}

// 查看
const handleView = (row: Log) => {
  viewLog.value = row
  viewDialogVisible.value = true
}

// 格式化详细信息
const formatDetail = (detail: any) => {
  if (typeof detail === 'string') {
    try {
      return JSON.stringify(JSON.parse(detail), null, 2)
    } catch {
      return detail
    }
  }
  return JSON.stringify(detail, null, 2)
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
    minute: '2-digit',
    second: '2-digit'
  })
}

// 初始化
onMounted(() => {
  fetchLogList()
})
</script>

<style scoped>
.log-management {
  width: 100%;
}

.search-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}
</style>
