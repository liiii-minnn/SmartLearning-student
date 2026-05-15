<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { ElMessage, ElButton, ElInput } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const account = ref('')
const smsCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const canNextStep = computed(() => {
  if (step.value === 1) return !!account.value
  if (step.value === 2) return smsCode.value === '123456'
  return newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value
})

function validateAccount(accountStr: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return phoneRegex.test(accountStr) || emailRegex.test(accountStr)
}

function handleStep1() {
  if (!account.value) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }
  if (!validateAccount(account.value)) {
    ElMessage.warning('请输入正确的手机号或邮箱格式')
    return
  }
  
  loading.value = true
  setTimeout(() => {
    ElMessage.success('验证码已发送（模拟：123456）')
    step.value = 2
    loading.value = false
  }, 800)
}

function handleStep2() {
  if (!smsCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (smsCode.value !== '123456') {
    ElMessage.error('验证码错误（正确验证码：123456）')
    return
  }
  step.value = 3
}

function handleStep3() {
  if (!newPassword.value) {
    ElMessage.warning('请输入新密码')
    return
  }
  
  const passwordValidation = authStore.validatePassword(newPassword.value)
  if (!passwordValidation.valid) {
    ElMessage.warning(passwordValidation.message)
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  setTimeout(() => {
    try {
      authStore.forgotPassword(account.value, newPassword.value)
      ElMessage.success('密码重置成功，即将跳转到登录页面')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      ElMessage.error(error.message)
    } finally {
      loading.value = false
    }
  }, 500)
}

function goBack() {
  if (step.value > 1) {
    step.value--
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="forgot-container">
    <div class="forgot-wrapper">
      <div class="forgot-header">
        <h1 class="logo">智学课堂</h1>
        <p class="slogan">找回密码</p>
      </div>

      <div class="progress-bar">
        <div class="progress-step" :class="{ active: step >= 1 }">1</div>
        <div class="progress-line" :class="{ active: step >= 2 }"></div>
        <div class="progress-step" :class="{ active: step >= 2 }">2</div>
        <div class="progress-line" :class="{ active: step >= 3 }"></div>
        <div class="progress-step" :class="{ active: step >= 3 }">3</div>
      </div>
      <div class="progress-labels">
        <span :class="{ active: step === 1 }">输入账号</span>
        <span :class="{ active: step === 2 }">验证身份</span>
        <span :class="{ active: step === 3 }">重置密码</span>
      </div>

      <div class="forgot-form">
        <div v-if="step === 1">
          <ElInput
            v-model="account"
            placeholder="手机号或邮箱"
            class="form-input"
          />
          <p class="tip">我们将向您的手机或邮箱发送验证码</p>
        </div>

        <div v-if="step === 2">
          <ElInput
            v-model="smsCode"
            placeholder="请输入验证码（模拟：123456）"
            class="form-input"
          />
          <p class="tip">验证码已发送至您的手机/邮箱</p>
        </div>

        <div v-if="step === 3">
          <ElInput
            v-model="newPassword"
            type="password"
            placeholder="新密码"
            class="form-input"
          />
          <ElInput
            v-model="confirmPassword"
            type="password"
            placeholder="确认新密码"
            class="form-input"
          />
          <p class="tip">密码需包含至少3种字符类型，长度8-16位</p>
        </div>

        <div class="btn-group">
          <ElButton
            v-if="step > 1"
            class="back-btn"
            @click="goBack"
          >
            返回
          </ElButton>
          <ElButton
            type="primary"
            class="next-btn"
            :loading="loading"
            :disabled="!canNextStep || loading"
            @click="step === 1 ? handleStep1() : step === 2 ? handleStep2() : handleStep3()"
          >
            {{ step === 3 ? '确认重置' : '下一步' }}
          </ElButton>
        </div>
      </div>

      <div class="login-link">
        返回<a href="/login">登录</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-wrapper {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.forgot-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.slogan {
  font-size: 14px;
  color: #999;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.progress-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  transition: all 0.3s;
}

.progress-step.active {
  background: #667eea;
  color: white;
}

.progress-line {
  width: 60px;
  height: 3px;
  background: #e0e0e0;
  margin: 0 8px;
  transition: all 0.3s;
}

.progress-line.active {
  background: #667eea;
}

.progress-labels {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  font-size: 13px;
  color: #999;
}

.progress-labels span.active {
  color: #667eea;
  font-weight: 600;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  width: 100%;
}

.tip {
  font-size: 12px;
  color: #999;
  margin-top: -8px;
}

.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.back-btn {
  flex: 1;
}

.next-btn {
  flex: 2;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .forgot-wrapper {
    padding: 24px;
  }
  
  .forgot-header {
    margin-bottom: 20px;
  }
  
  .logo {
    font-size: 24px;
  }
  
  .progress-line {
    width: 40px;
  }
}
</style>
