<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <h2>欢迎回来，{{ userStore.username }}！</h2>
      <p>这是 Node Lean 管理系统的仪表板</p>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="用户总数" :value="1234">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="今日访问" :value="567">
            <template #prefix>
              <el-icon><View /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="系统状态" value="正常">
            <template #prefix>
              <el-icon style="color: #67c23a"><Check /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>用户信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          {{ userStore.userInfo?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ userStore.userInfo?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.userInfo?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userStore.userInfo?.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          {{ userStore.userInfo?.realName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userStore.userInfo?.status === 1 ? 'success' : 'danger'">
            {{ userStore.userInfo?.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatDate(userStore.userInfo?.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, View, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

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
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.welcome-card {
  text-align: center;
  padding: 20px;
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.welcome-card p {
  margin: 0;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
