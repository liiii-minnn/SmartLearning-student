import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loginAttempts = ref<Record<string, number>>({})
  const lockoutExpires = ref<Record<string, number>>({})

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isStudent = computed(() => user.value?.role === 'student')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isAdmin = computed(() => user.value?.role === 'admin')

  function initMockUsers() {
    const storedUsers = localStorage.getItem('users')
    if (!storedUsers) {
      const mockUsers: User[] = [
        {
          id: 1,
          account: 'student',
          email: 'stu@test.com',
          phone: '13800000001',
          password: btoa('Student123!'),
          role: 'student',
          name: '张三',
          lastPwdChange: '2025-01-01'
        },
        {
          id: 2,
          account: 'teacher',
          email: 'tea@test.com',
          phone: '13800000002',
          password: btoa('Teacher123!'),
          role: 'teacher',
          name: '李老师'
        },
        {
          id: 3,
          account: 'admin',
          email: 'admin@test.com',
          phone: '13800000003',
          password: btoa('Admin123!'),
          role: 'admin',
          name: '管理员'
        }
      ]
      localStorage.setItem('users', JSON.stringify(mockUsers))
    }
  }

  function login(account: string, password: string, remember: boolean) {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[]
    
    const now = Date.now()
    const lockoutEnd = lockoutExpires.value[account]
    if (lockoutEnd && now < lockoutEnd) {
      const remainingMinutes = Math.ceil((lockoutEnd - now) / 60000)
      throw new Error(`账号已锁定，请${remainingMinutes}分钟后再试`)
    }

    const userFound = users.find(u => 
      u.account === account || u.email === account || u.phone === account
    )

    if (!userFound) {
      incrementLoginAttempts(account)
      throw new Error('账号不存在')
    }

    if (userFound.password !== btoa(password)) {
      incrementLoginAttempts(account)
      throw new Error('密码错误')
    }

    loginAttempts.value[account] = 0
    lockoutExpires.value[account] = 0

    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000

    if (remember) {
      localStorage.setItem('token', mockToken)
      localStorage.setItem('tokenExpires', expiresAt.toString())
      localStorage.setItem('user', JSON.stringify(userFound))
    } else {
      sessionStorage.setItem('token', mockToken)
      sessionStorage.setItem('tokenExpires', expiresAt.toString())
      sessionStorage.setItem('user', JSON.stringify(userFound))
    }

    token.value = mockToken
    user.value = userFound

    checkPasswordExpiry()
  }

  function incrementLoginAttempts(account: string) {
    loginAttempts.value[account] = (loginAttempts.value[account] || 0) + 1
    if (loginAttempts.value[account] >= 5) {
      lockoutExpires.value[account] = Date.now() + 30 * 60 * 1000
    }
  }

  function checkPasswordExpiry() {
    if (!user.value?.lastPwdChange) return
    
    const lastChange = new Date(user.value.lastPwdChange)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays > 30) {
      console.log('提示：密码已超过30天未修改')
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpires')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('tokenExpires')
    sessionStorage.removeItem('user')
    console.log('模拟调用后端黑名单接口')
  }

  function register(newUser: Omit<User, 'id'>) {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[]
    
    if (users.some(u => u.account === newUser.account)) {
      throw new Error('用户名已存在')
    }
    if (users.some(u => u.email === newUser.email)) {
      throw new Error('邮箱已被注册')
    }
    if (users.some(u => u.phone === newUser.phone)) {
      throw new Error('手机号已被注册')
    }

    const userWithId: User = {
      ...newUser,
      id: users.length + 1,
      password: btoa(newUser.password),
      lastPwdChange: new Date().toISOString().split('T')[0]
    }

    users.push(userWithId)
    localStorage.setItem('users', JSON.stringify(users))
  }

  function forgotPassword(account: string, newPassword: string) {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[]
    const index = users.findIndex(u => 
      u.account === account || u.email === account || u.phone === account
    )

    if (index === -1) {
      throw new Error('账号不存在')
    }

    users[index] = {
      ...users[index],
      password: btoa(newPassword),
      lastPwdChange: new Date().toISOString().split('T')[0]
    }

    localStorage.setItem('users', JSON.stringify(users))
  }

  function loadFromStorage() {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const storedExpires = localStorage.getItem('tokenExpires') || sessionStorage.getItem('tokenExpires')
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')

    if (storedToken && storedExpires && storedUser) {
      const expiresAt = parseInt(storedExpires)
      if (Date.now() < expiresAt) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } else {
        logout()
      }
    }
  }

  function validatePassword(password: string): { valid: boolean; message: string } {
    const rules = [
      { test: /[A-Z]/, msg: '大写字母' },
      { test: /[a-z]/, msg: '小写字母' },
      { test: /[0-9]/, msg: '数字' },
      { test: /[!@#$%^&*(),.?":{}|<>]/, msg: '特殊字符' }
    ]
    
    const passed = rules.filter(r => r.test.test(password)).length
    
    if (password.length < 8) return { valid: false, message: '密码长度至少8位' }
    if (password.length > 16) return { valid: false, message: '密码长度不超过16位' }
    if (passed < 3) return { valid: false, message: `密码需包含至少3种字符类型（大写字母、小写字母、数字、特殊字符），当前包含${passed}种` }
    
    return { valid: true, message: '密码强度合格' }
  }

  return {
    user,
    token,
    loginAttempts,
    lockoutExpires,
    isLoggedIn,
    isStudent,
    isTeacher,
    isAdmin,
    initMockUsers,
    login,
    logout,
    register,
    forgotPassword,
    loadFromStorage,
    validatePassword
  }
})
