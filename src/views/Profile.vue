<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { ElMessage, ElButton, ElInput, ElCard, ElDialog } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const devices = ref([
  { id: 1, name: '当前设备', device: 'Chrome - Windows', lastLogin: '刚刚', ip: '192.168.1.xxx', status: 'online' },
  { id: 2, name: '设备2', device: 'Safari - iPhone', lastLogin: '2025-03-14 15:30', ip: '10.0.0.xxx', status: 'online' },
  { id: 3, name: '设备3', device: 'Edge - Windows', lastLogin: '2025-03-10 09:15', ip: '172.16.0.xxx', status: 'offline' }
])

const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

function forceLogoutOtherDevices() {
  devices.value = devices.value.filter(d => d.id === 1)
  ElMessage.success('已强制下线其他设备')
}

function handleChangePassword() {
  if (!oldPassword.value) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!newPassword.value) {
    ElMessage.warning('请输入新密码')
    return
  }
  
  const validation = authStore.validatePassword(newPassword.value)
  if (!validation.valid) {
    ElMessage.warning(validation.message)
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const index = users.findIndex((u: any) => u.id === user.value?.id)
  
  if (index !== -1 && users[index].password === btoa(oldPassword.value)) {
    users[index].password = btoa(newPassword.value)
    users[index].lastPwdChange = new Date().toISOString().split('T')[0]
    localStorage.setItem('users', JSON.stringify(users))
    ElMessage.success('密码修改成功')
    showChangePassword.value = false
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    ElMessage.error('旧密码错误')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="profile-container">
    <div class="profile-wrapper">
      <div class="profile-header">
        <h1 class="logo">智学课堂</h1>
      </div>

      <div class="profile-content">
        <ElCard class="user-info-card">
          <div class="user-avatar">
            <span class="avatar-icon">{{ user?.name?.charAt(0) }}</span>
          </div>
          <div class="user-details">
            <h2>{{ user?.name }}</h2>
            <p class="user-role">{{ user?.role === 'student' ? '学生' : user?.role === 'teacher' ? '教师' : '管理员' }}</p>
            <p class="user-email">{{ user?.email }}</p>
          </div>
        </ElCard>

        <ElCard class="devices-card">
          <div class="card-header">
            <h3>多端登录管理</h3>
            <ElButton type="danger" @click="forceLogoutOtherDevices">
              强制下线其他设备
            </ElButton>
          </div>
          
          <div class="devices-list">
            <div
              v-for="device in devices"
              :key="device.id"
              class="device-item"
            >
              <div class="device-info">
                <span class="device-name">{{ device.name }}</span>
                <span class="device-type">{{ device.device }}</span>
                <span class="device-ip">{{ device.ip }}</span>
              </div>
              <div class="device-status">
                <span :class="['status-dot', device.status]"></span>
                <span class="last-login">{{ device.lastLogin }}</span>
              </div>
            </div>
          </div>
        </ElCard>

        <ElCard class="actions-card">
          <h3>账户操作</h3>
          <div class="action-buttons">
            <ElButton @click="showChangePassword = true">修改密码</ElButton>
            <ElButton type="danger" @click="handleLogout">退出登录</ElButton>
          </div>
        </ElCard>
      </div>
    </div>

    <ElDialog
      v-model="showChangePassword"
      title="修改密码"
      width="400px"
      @close="showChangePassword = false"
    >
      <ElInput
        v-model="oldPassword"
        type="password"
        placeholder="旧密码"
        class="password-input"
      />
      <ElInput
        v-model="newPassword"
        type="password"
        placeholder="新密码（8-16位，包含至少3种字符类型）"
        class="password-input"
      />
      <ElInput
        v-model="confirmPassword"
        type="password"
        placeholder="确认新密码"
        class="password-input"
      />
      <template #footer>
        <ElButton @click="showChangePassword = false">取消</ElButton>
        <ElButton type="primary" @click="handleChangePassword">确认修改</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.profile-wrapper {
  width: 100%;
  max-width: 600px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 32px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-role {
  font-size: 13px;
  color: #667eea;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #718096;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name {
  font-size: 14px;
  font-weight: 500;
}

.device-type {
  font-size: 13px;
  color: #718096;
}

.device-ip {
  font-size: 12px;
  color: #a0aec0;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #52c41a;
}

.status-dot.offline {
  background: #a0aec0;
}

.last-login {
  font-size: 13px;
  color: #718096;
}

.actions-card {
  padding: 20px;
}

.actions-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.password-input {
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
