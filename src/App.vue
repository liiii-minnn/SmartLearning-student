<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useCourseStore } from './stores/courseStore'
import { useNotificationStore } from './stores/notificationStore'

const authStore = useAuthStore()
const courseStore = useCourseStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  authStore.initMockUsers()
  authStore.loadFromStorage()
  courseStore.initMockData()
  notificationStore.initMockData()
})
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>
