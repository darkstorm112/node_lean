<template>
  <div class="ticket-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="请输入工单标题" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="请假" value="leave" />
            <el-option label="报销" value="reimbursement" />
            <el-option label="采购" value="purchase" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="请选择优先级" clearable style="width: 150px">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增工单
      </el-button>
    </el-card>

    <!-- 工单表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="ticketList" stripe>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'leave'" type="info">请假</el-tag>
            <el-tag v-else-if="row.type === 'reimbursement'" type="warning">报销</el-tag>
            <el-tag v-else-if="row.type === 'purchase'" type="success">采购</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.priority === 'low'" type="info">低</el-tag>
            <el-tag v-else-if="row.priority === 'medium'" type="warning">中</el-tag>
            <el-tag v-else type="danger">高</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待审批</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建人" width="120">
          <template #default="{ row }">
            {{ row.creator?.realName || row.creator?.username }}
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="120">
          <template #default="{ row }">
            {{ row.approver ? (row.approver.realName || row.approver.username) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">
              查看
            </el-button>
            <el-button v-if="canEdit(row)" type="warning" size="small" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-if="canDelete(row)" type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button v-if="canApprove(row)" type="success" size="small" :icon="Check" @click="handleApprove(row)">
              通过
            </el-button>
            <el-button v-if="canApprove(row)" type="danger" size="small" :icon="Close" @click="handleReject(row)">
              拒绝
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleDialogClose">
      <el-form ref="ticketFormRef" :model="ticketForm" :rules="ticketFormRules" label-width="100px">
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="ticketForm.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="工单内容" prop="content">
          <el-input v-model="ticketForm.content" type="textarea" :rows="6" placeholder="请输入工单内容" />
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="ticketForm.type" placeholder="请选择工单类型" style="width: 100%">
            <el-option label="请假" value="leave" />
            <el-option label="报销" value="reimbursement" />
            <el-option label="采购" value="purchase" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="ticketForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单标题" :span="2">
          {{ viewTicket?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="工单类型">
          <el-tag v-if="viewTicket?.type === 'leave'" type="info">请假</el-tag>
          <el-tag v-else-if="viewTicket?.type === 'reimbursement'" type="warning">报销</el-tag>
          <el-tag v-else-if="viewTicket?.type === 'purchase'" type="success">采购</el-tag>
          <el-tag v-else>其他</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="viewTicket?.priority === 'low'" type="info">低</el-tag>
          <el-tag v-else-if="viewTicket?.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else type="danger">高</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag v-if="viewTicket?.status === 'pending'" type="warning">待审批</el-tag>
          <el-tag v-else-if="viewTicket?.status === 'approved'" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工单内容" :span="2">
          <div style="white-space: pre-wrap; word-break: break-all;">{{ viewTicket?.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ viewTicket?.creator?.realName || viewTicket?.creator?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(viewTicket?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ viewTicket?.approver ? (viewTicket.approver.realName || viewTicket.approver.username) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批时间">
          {{ viewTicket?.approvedAt ? formatDate(viewTicket.approvedAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="viewTicket?.rejectReason" label="拒绝原因" :span="2">
          <div style="white-space: pre-wrap; word-break: break-all;">{{ viewTicket.rejectReason }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝工单" width="500px">
      <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectFormRules" label-width="100px">
        <el-form-item label="拒绝原因" prop="rejectReason">
          <el-input v-model="rejectForm.rejectReason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejectLoading" @click="handleConfirmReject">
          确定拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  View,
  Check,
  Close
} from '@element-plus/icons-vue'
import * as ticketApi from '@/api/ticket'
import type { Ticket } from '@/api/ticket'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  priority: '',
  status: ''
})

// 工单列表
const ticketList = ref<Ticket[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const ticketFormRef = ref<FormInstance>()

// 查看对话框
const viewDialogVisible = ref(false)
const viewTicket = ref<Ticket | null>(null)

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectLoading = ref(false)
const rejectFormRef = ref<FormInstance>()
const currentTicketId = ref(0)

// 工单表单
const ticketForm = reactive({
  id: 0,
  title: '',
  content: '',
  type: 'other' as 'leave' | 'reimbursement' | 'purchase' | 'other',
  priority: 'medium' as 'low' | 'medium' | 'high'
})

// 拒绝表单
const rejectForm = reactive({
  rejectReason: ''
})

// 表单验证规则
const ticketFormRules: FormRules = {
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 2, max: 200, message: '工单标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入工单内容', trigger: 'blur' },
    { min: 10, message: '工单内容长度不能少于 10 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择工单类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 拒绝表单验证规则
const rejectFormRules: FormRules = {
  rejectReason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 2, message: '拒绝原因长度不能少于 2 个字符', trigger: 'blur' }
  ]
}

// 获取工单列表
const fetchTicketList = async () => {
  loading.value = true
  try {
    const response = await ticketApi.getTicketList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      title: searchForm.title || undefined,
      type: searchForm.type || undefined,
      priority: searchForm.priority || undefined,
      status: searchForm.status || undefined
    })

    if (response.success && response.data) {
      ticketList.value = response.data.items
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('获取工单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 权限判断：是否可以编辑
const canEdit = (ticket: Ticket) => {
  return ticket.status === 'pending' && ticket.creatorId === userStore.userInfo?.id
}

// 权限判断：是否可以删除
const canDelete = (ticket: Ticket) => {
  return ticket.status === 'pending' && ticket.creatorId === userStore.userInfo?.id
}

// 权限判断：是否可以审批
const canApprove = (ticket: Ticket) => {
  const userRoles = userStore.userInfo?.roles || []
  const isManagerOrAdmin = userRoles.some(role => role.code === 'admin' || role.code === 'manager')
  return ticket.status === 'pending' && isManagerOrAdmin
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTicketList()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.type = ''
  searchForm.priority = ''
  searchForm.status = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchTicketList()
}

const handlePageChange = () => {
  fetchTicketList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增工单'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Ticket) => {
  isEdit.value = true
  dialogTitle.value = '编辑工单'
  ticketForm.id = row.id
  ticketForm.title = row.title
  ticketForm.content = row.content
  ticketForm.type = row.type
  ticketForm.priority = row.priority
  dialogVisible.value = true
}

// 查看
const handleView = (row: Ticket) => {
  viewTicket.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (row: Ticket) => {
  try {
    await ElMessageBox.confirm(`确定要删除工单 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await ticketApi.deleteTicket(row.id)
    ElMessage.success('删除成功')
    fetchTicketList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除工单失败:', error)
    }
  }
}

// 审批通过
const handleApprove = async (row: Ticket) => {
  try {
    await ElMessageBox.confirm(`确定要通过工单 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    await ticketApi.approveTicket(row.id)
    ElMessage.success('审批通过')
    fetchTicketList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审批通过失败:', error)
    }
  }
}

// 审批拒绝
const handleReject = (row: Ticket) => {
  currentTicketId.value = row.id
  rejectForm.rejectReason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const handleConfirmReject = async () => {
  if (!rejectFormRef.value) return

  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      rejectLoading.value = true
      try {
        await ticketApi.rejectTicket(currentTicketId.value, rejectForm.rejectReason)
        ElMessage.success('审批拒绝')
        rejectDialogVisible.value = false
        fetchTicketList()
      } catch (error) {
        console.error('审批拒绝失败:', error)
      } finally {
        rejectLoading.value = false
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!ticketFormRef.value) return

  await ticketFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑
          await ticketApi.updateTicket(ticketForm.id, {
            title: ticketForm.title,
            content: ticketForm.content,
            type: ticketForm.type,
            priority: ticketForm.priority
          })
          ElMessage.success('更新成功')
        } else {
          // 新增
          await ticketApi.createTicket({
            title: ticketForm.title,
            content: ticketForm.content,
            type: ticketForm.type,
            priority: ticketForm.priority
          })
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        fetchTicketList()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
  ticketFormRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  ticketForm.id = 0
  ticketForm.title = ''
  ticketForm.content = ''
  ticketForm.type = 'other'
  ticketForm.priority = 'medium'
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
  fetchTicketList()
})
</script>

<style scoped>
.ticket-management {
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
</style>
