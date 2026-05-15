<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <div class="icon">🏫</div>
      <h1>学校</h1>
      <p>学校功能正在开发中...</p>
      <ElButton type="primary" @click="goBack">返回首页</ElButton>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.placeholder-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 64px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
}

p {
  color: #718096;
  margin-bottom: 24px;
}
</style>
