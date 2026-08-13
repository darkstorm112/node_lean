<template>
  <div class="role-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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
        新增角色
      </el-button>
    </el-card>

    <!-- 角色表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="roleList" stripe>
        <!-- <el-table-column prop="id" label="ID" width="80" /> -->
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" :icon="Key" @click="handleAssignPermissions(row)">
              分配权限
            </el-button>
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" :icon="Delete" :disabled="row.code === 'admin'"
              @click="handleDelete(row)">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="roleForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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
    <el-dialog v-model="viewDialogVisible" title="角色详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="角色ID">
          {{ viewRole?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="角色名称">
          {{ viewRole?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="角色编码">
          {{ viewRole?.code }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="viewRole?.status === 'active'" type="success">启用</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ viewRole?.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(viewRole?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">
          {{ formatDate(viewRole?.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="600px" @close="handlePermissionDialogClose">
      <el-alert title="提示" type="info" :closable="false" style="margin-bottom: 15px">
        为角色 <strong>{{ currentRole?.name }}</strong> 分配权限
      </el-alert>

      <el-tree ref="permissionTreeRef" :data="permissionTreeData" :props="{ children: 'children', label: 'name' }"
        show-checkbox node-key="id" :default-checked-keys="selectedPermissionIds" />

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="permissionLoading" @click="handleSavePermissions">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules, ElTree } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  View,
  Key
} from '@element-plus/icons-vue'
import * as roleApi from '@/api/role'
import type { Role, Permission } from '@/api/role'

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

// 角色列表
const roleList = ref<Role[]>([])
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
const roleFormRef = ref<FormInstance>()

// 查看对话框
const viewDialogVisible = ref(false)
const viewRole = ref<Role | null>(null)

// 权限对话框
const permissionDialogVisible = ref(false)
const permissionLoading = ref(false)
const currentRole = ref<Role | null>(null)
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()
const permissionTreeData = ref<any[]>([])
const selectedPermissionIds = ref<number[]>([])

// 角色表单
const roleForm = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 'active'
})

// 表单验证规则
const roleFormRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '角色编码只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ]
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const response = await roleApi.getRoleList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
      status: searchForm.status || undefined
    })

    if (response.success && response.data) {
      roleList.value = response.data.items
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRoleList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  fetchRoleList()
}

const handlePageChange = () => {
  fetchRoleList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Role) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  roleForm.id = row.id
  roleForm.name = row.name
  roleForm.code = row.code
  roleForm.description = row.description || ''
  roleForm.status = row.status
  dialogVisible.value = true
}

// 查看
const handleView = (row: Role) => {
  viewRole.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (row: Role) => {
  if (row.code === 'admin') {
    ElMessage.warning('不能删除管理员角色')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await roleApi.deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
    }
  }
}

// 分配权限
const handleAssignPermissions = async (row: Role) => {
  currentRole.value = row
  permissionLoading.value = true

  try {
    // 获取所有权限
    const allPermsRes = await roleApi.getAllPermissions()
    if (allPermsRes.success && allPermsRes.data) {
      // 转换为树形结构
      permissionTreeData.value = convertPermissionsToTree(allPermsRes.data)
    }

    // 获取角色已有权限
    const rolePermsRes = await roleApi.getRolePermissions(row.id)
    if (rolePermsRes.success && rolePermsRes.data) {
      selectedPermissionIds.value = rolePermsRes.data.map(p => p.id)
    }

    permissionDialogVisible.value = true
  } catch (error) {
    console.error('获取权限数据失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

// 转换权限为树形结构（按 resource 分组）
const convertPermissionsToTree = (permissions: Permission[]) => {
  const resourceMap = new Map<string, any>()

  permissions.forEach(permission => {
    if (!resourceMap.has(permission.resource)) {
      resourceMap.set(permission.resource, {
        id: `resource_${permission.resource}`,
        name: getResourceName(permission.resource),
        children: []
      })
    }

    resourceMap.get(permission.resource)!.children.push({
      id: permission.id,
      name: permission.name,
      code: permission.code
    })
  })

  return Array.from(resourceMap.values())
}

// 获取资源名称
const getResourceName = (resource: string) => {
  const resourceNames: Record<string, string> = {
    user: '用户管理',
    role: '角色管理',
    ticket: '工单管理',
    file: '文件管理',
    log: '日志管理'
  }
  return resourceNames[resource] || resource
}

// 保存权限
const handleSavePermissions = async () => {
  if (!currentRole.value || !permissionTreeRef.value) return

  permissionLoading.value = true
  try {
    // 获取选中的权限ID（过滤掉resource节点）
    const checkedKeys = permissionTreeRef.value.getCheckedKeys() as number[]
    const permissionIds = checkedKeys.filter(key => typeof key === 'number')

    await roleApi.assignRolePermissions(currentRole.value.id, permissionIds)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    fetchRoleList()
  } catch (error) {
    console.error('分配权限失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

// 关闭权限对话框
const handlePermissionDialogClose = () => {
  currentRole.value = null
  permissionTreeData.value = []
  selectedPermissionIds.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑
          await roleApi.updateRole(roleForm.id, {
            name: roleForm.name,
            description: roleForm.description || undefined,
            status: roleForm.status
          })
          ElMessage.success('更新成功')
        } else {
          // 新增
          await roleApi.createRole({
            name: roleForm.name,
            code: roleForm.code,
            description: roleForm.description || undefined
          })
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        fetchRoleList()
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
  roleFormRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  roleForm.id = 0
  roleForm.name = ''
  roleForm.code = ''
  roleForm.description = ''
  roleForm.status = 'active'
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
  fetchRoleList()
})
</script>

<style scoped>
.role-management {
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
