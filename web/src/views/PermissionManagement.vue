<template>
  <div class="permission-management">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="资源">
          <el-input v-model="searchForm.resource" placeholder="请输入资源" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作">
          <el-input v-model="searchForm.action" placeholder="请输入操作" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button v-permission="'permission:create'" type="primary" :icon="Plus" @click="handleAdd">
          新增权限
        </el-button>
      </div>

      <!-- 权限分组展示 -->
      <div v-loading="loading" class="permission-groups">
        <el-collapse v-model="activeGroups" accordion>
          <el-collapse-item v-for="(group, resource) in groupedPermissions" :key="resource" :name="resource">
            <template #title>
              <div class="group-header">
                <el-icon class="group-icon">
                  <FolderOpened />
                </el-icon>
                <span class="group-title">{{ resource }}</span>
                <el-tag size="small" type="info" style="margin-left: 10px">
                  {{ group.length }} 项权限
                </el-tag>
              </div>
            </template>

            <el-table :data="group" border stripe style="width: 100%">
              <!-- <el-table-column prop="id" label="ID" width="80" /> -->
              <el-table-column prop="name" label="权限名称" min-width="150" />
              <el-table-column prop="code" label="权限编码" min-width="200" />
              <el-table-column prop="action" label="操作" min-width="120" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="createdAt" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button v-permission="'permission:update'" type="primary" link :icon="Edit"
                    @click="handleEdit(row)">
                    编辑
                  </el-button>
                  <el-button v-permission="'permission:delete'" type="danger" link :icon="Delete"
                    @click="handleDelete(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>

        <el-empty v-if="Object.keys(groupedPermissions).length === 0" description="暂无权限数据" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <el-form ref="permissionFormRef" :model="permissionForm" :rules="permissionFormRules" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="格式: resource:action" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="资源" prop="resource">
          <el-input v-model="permissionForm.resource" placeholder="如: user, role, permission" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="操作" prop="action">
          <el-input v-model="permissionForm.action" placeholder="如: create, read, update, delete" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" :rows="3" placeholder="请输入权限描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  FolderOpened
} from '@element-plus/icons-vue'
import * as permissionApi from '@/api/permission'
import type { Permission } from '@/types/api'

// 搜索表单
const searchForm = reactive({
  resource: '',
  action: ''
})

// 权限列表
const permissionList = ref<Permission[]>([])
const loading = ref(false)

// 折叠面板激活的分组
const activeGroups = ref<string>('')

// 按资源分组的权限
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}

  permissionList.value.forEach(permission => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
  })

  // 对每个分组内的权限按action排序
  Object.keys(groups).forEach(resource => {
    groups[resource].sort((a, b) => a.action.localeCompare(b.action))
  })

  return groups
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const permissionFormRef = ref<FormInstance>()

// 权限表单
const permissionForm = reactive({
  id: 0,
  name: '',
  code: '',
  resource: '',
  action: '',
  description: ''
})

// 表单验证规则
const permissionFormRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_:-]+$/, message: '权限编码只能包含字母、数字、下划线、冒号和连字符', trigger: 'blur' }
  ],
  resource: [
    { required: true, message: '请输入资源', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请输入操作', trigger: 'blur' }
  ]
}

// 获取权限列表（获取所有权限，不分页）
const fetchPermissionList = async () => {
  loading.value = true
  try {
    // 如果有搜索条件，使用分页接口
    if (searchForm.resource || searchForm.action) {
      const response = await permissionApi.getPermissionList({
        page: 1,
        pageSize: 1000, // 获取足够多的数据
        resource: searchForm.resource || undefined,
        action: searchForm.action || undefined
      })

      if (response.success && response.data) {
        permissionList.value = response.data.items
      }
    } else {
      // 没有搜索条件，获取所有权限
      const response = await permissionApi.getAllPermissions()
      if (response.success && response.data) {
        permissionList.value = response.data
      }
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchPermissionList()
}

// 重置
const handleReset = () => {
  searchForm.resource = ''
  searchForm.action = ''
  fetchPermissionList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增权限'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Permission) => {
  isEdit.value = true
  dialogTitle.value = '编辑权限'
  permissionForm.id = row.id
  permissionForm.name = row.name
  permissionForm.code = row.code
  permissionForm.resource = row.resource
  permissionForm.action = row.action
  permissionForm.description = row.description || ''
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Permission) => {
  ElMessageBox.confirm(
    `确定要删除权限 "${row.name}" 吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await permissionApi.deletePermission(row.id)
      ElMessage.success('删除成功')
      fetchPermissionList()
    } catch (error) {
      console.error('删除权限失败:', error)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return

  try {
    await permissionFormRef.value.validate()
    submitLoading.value = true

    try {
      if (isEdit.value) {
        // 编辑
        await permissionApi.updatePermission(permissionForm.id, {
          name: permissionForm.name,
          description: permissionForm.description || undefined
        })
        ElMessage.success('更新成功')
      } else {
        // 新增
        await permissionApi.createPermission({
          name: permissionForm.name,
          code: permissionForm.code,
          resource: permissionForm.resource,
          action: permissionForm.action,
          description: permissionForm.description || undefined
        })
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchPermissionList()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitLoading.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  permissionForm.id = 0
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.resource = ''
  permissionForm.action = ''
  permissionForm.description = ''
}

// 格式化日期
const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchPermissionList()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
}

.permission-groups {
  min-height: 200px;
}

.group-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.group-icon {
  margin-right: 8px;
  font-size: 18px;
}

.group-title {
  text-transform: capitalize;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 20px;
}
</style>
