<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { useMenuStore } from '@/store/menu'

const userStore = useUserStore()
const menuStore = useMenuStore()

// 应用启动时，如果已登录则获取最新用户信息并生成菜单
onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await userStore.fetchUserInfo()
      // 生成菜单
      menuStore.generateMenus()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败（如token过期），清除登录状态
      userStore.logout()
      menuStore.clearMenus()
    }
  }
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style>
