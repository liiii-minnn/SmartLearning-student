<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { ElMessage, ElButton, ElInput, ElCheckbox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const captcha = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const lockoutMessage = ref('')
const lockoutCountdown = ref(0)

let countdownTimer: number | null = null

const accountPlaceholder = ref('用户名/邮箱/手机号')

const loginMethods = [
  { key: 'default', label: '其他登录方式', placeholder: '用户名/邮箱/手机号' },
  { key: 'studentId', label: '学号', placeholder: '学号' },
  { key: 'phone', label: '手机号', placeholder: '手机号' },
  { key: 'teacherId', label: '教师工号', placeholder: '工号' }
]

const currentMethod = ref('default')

const generatedCaptcha = ref('')

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  generatedCaptcha.value = result
}

function selectMethod(method: string) {
  currentMethod.value = method
  const found = loginMethods.find(m => m.key === method)
  if (found) {
    accountPlaceholder.value = found.placeholder
  }
}

function handleLogin() {
  if (!account.value) {
    ElMessage.warning('请输入账号')
    return
  }
  if (!password.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!captcha.value) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (captcha.value.toLowerCase() !== generatedCaptcha.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    generateCaptcha()
    return
  }

  loading.value = true

  setTimeout(() => {
    try {
      authStore.login(account.value, password.value, remember.value)
      ElMessage.success('登录成功')
      
      if (authStore.isStudent) {
        router.push('/student/dashboard')
      } else if (authStore.isTeacher) {
        router.push('/teacher')
      } else if (authStore.isAdmin) {
        router.push('/admin')
      }
    } catch (error: any) {
      ElMessage.error(error.message)
      generateCaptcha()
      checkLockout()
    } finally {
      loading.value = false
    }
  }, 500)
}

function checkLockout() {
  const now = Date.now()
  const lockoutEnd = authStore.lockoutExpires[account.value]
  if (lockoutEnd && now < lockoutEnd) {
    lockoutMessage.value = '账号已锁定'
    startCountdown(lockoutEnd - now)
  }
}

function startCountdown(remainingMs: number) {
  lockoutCountdown.value = Math.ceil(remainingMs / 1000)
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = window.setInterval(() => {
    lockoutCountdown.value--
    if (lockoutCountdown.value <= 0) {
      lockoutMessage.value = ''
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    }
  }, 1000)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (!loading.value) {
      handleLogin()
    }
  }
}

onMounted(() => {
  generateCaptcha()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <h1 class="logo">智学课堂</h1>
        <p class="slogan">智慧学习，成就未来</p>
      </div>

      <div class="login-form">
        <div class="login-methods">
          <button
            v-for="method in loginMethods"
            :key="method.key"
            :class="['method-btn', { active: currentMethod === method.key }]"
            @click="selectMethod(method.key)"
          >
            {{ method.label }}
          </button>
        </div>

        <ElInput
          v-model="account"
          :placeholder="accountPlaceholder"
          class="form-input"
          :disabled="!!lockoutMessage"
        />

        <ElInput
          v-model="password"
          type="password"
          placeholder="密码"
          class="form-input"
          :disabled="!!lockoutMessage"
          :show-password="showPassword"
        />

        <div class="captcha-row">
          <ElInput
            v-model="captcha"
            placeholder="验证码"
            class="captcha-input"
            :disabled="!!lockoutMessage"
          />
          <div class="captcha-image" @click="generateCaptcha">
            <span>{{ generatedCaptcha }}</span>
          </div>
        </div>

        <div v-if="lockoutMessage" class="lockout-warning">
          <span class="lockout-icon">⚠️</span>
          <span>账号已锁定，请 {{ lockoutCountdown }} 秒后再试</span>
        </div>

        <div class="form-footer">
          <ElCheckbox v-model="remember" :disabled="!!lockoutMessage">记住我</ElCheckbox>
          <div class="links">
            <a href="/register">注册</a>
            <a href="/forgot-password">忘记密码</a>
          </div>
        </div>

        <ElButton
          type="primary"
          class="login-btn"
          :loading="loading"
          :disabled="!!lockoutMessage || loading"
          @click="handleLogin"
        >
          登录
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.login-header {
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-methods {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.method-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
}

.method-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.method-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.form-input {
  width: 100%;
}

.captcha-row {
  display: flex;
  gap: 12px;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 4px;
  color: #333;
  user-select: none;
}

.captcha-image:hover {
  background: #eee;
}

.lockout-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
  color: #d46b08;
  font-size: 13px;
}

.lockout-icon {
  font-size: 16px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.links {
  display: flex;
  gap: 20px;
}

.links a {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
}

.links a:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .login-wrapper {
    padding: 24px;
  }
  
  .login-header {
    margin-bottom: 20px;
  }
  
  .logo {
    font-size: 24px;
  }
}
</style>
