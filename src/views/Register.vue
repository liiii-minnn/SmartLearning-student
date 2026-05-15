<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { ElMessage, ElButton, ElInput, ElCheckbox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const captcha = ref('')
const agree = ref(false)
const loading = ref(false)

const generatedCaptcha = ref('')

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  generatedCaptcha.value = result
}

function validateEmail(emailStr: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

function validatePhone(phoneStr: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phoneStr)
}

function handleRegister() {
  if (!account.value) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!email.value) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!validateEmail(email.value)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  if (!phone.value) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!validatePhone(phone.value)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!password.value) {
    ElMessage.warning('请输入密码')
    return
  }
  
  const passwordValidation = authStore.validatePassword(password.value)
  if (!passwordValidation.valid) {
    ElMessage.warning(passwordValidation.message)
    return
  }
  
  if (password.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的密码不一致')
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
  if (!agree.value) {
    ElMessage.warning('请同意服务条款')
    return
  }

  loading.value = true

  setTimeout(() => {
    try {
      authStore.register({
        account: account.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
        role: 'student',
        name: account.value
      })
      ElMessage.success('注册成功，即将跳转到登录页面')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      ElMessage.error(error.message)
      generateCaptcha()
    } finally {
      loading.value = false
    }
  }, 500)
}

generateCaptcha()
</script>

<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-header">
        <h1 class="logo">智学课堂</h1>
        <p class="slogan">创建账号，开始学习之旅</p>
      </div>

      <div class="register-form">
        <ElInput
          v-model="account"
          placeholder="用户名"
          class="form-input"
        />

        <ElInput
          v-model="email"
          placeholder="邮箱"
          class="form-input"
        />

        <ElInput
          v-model="phone"
          placeholder="手机号"
          class="form-input"
        />

        <ElInput
          v-model="password"
          type="password"
          placeholder="密码（至少8位，包含大写字母、小写字母、数字、特殊字符中的三种）"
          class="form-input"
        />

        <ElInput
          v-model="confirmPassword"
          type="password"
          placeholder="确认密码"
          class="form-input"
        />

        <div class="captcha-row">
          <ElInput
            v-model="captcha"
            placeholder="验证码"
            class="captcha-input"
          />
          <div class="captcha-image" @click="generateCaptcha">
            <span>{{ generatedCaptcha }}</span>
          </div>
        </div>

        <div class="agree-row">
          <ElCheckbox v-model="agree" />
          <span>我已阅读并同意<a href="#" class="link">《用户服务协议》</a>和<a href="#" class="link">《隐私政策》</a></span>
        </div>

        <ElButton
          type="primary"
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </ElButton>

        <div class="login-link">
          已有账号？<a href="/login">立即登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-wrapper {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.register-header {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.agree-row {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.link {
  color: #667eea;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.login-link {
  text-align: center;
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
  .register-wrapper {
    padding: 24px;
  }
  
  .register-header {
    margin-bottom: 20px;
  }
  
  .logo {
    font-size: 24px;
  }
}
</style>
