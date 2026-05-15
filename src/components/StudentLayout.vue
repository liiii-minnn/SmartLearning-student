<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCourseStore } from '../stores/courseStore'
import { useNotificationStore } from '../stores/notificationStore'
import { ElMenu, ElMenuItem, ElDrawer, ElDropdown, ElDropdownMenu, ElDropdownItem, ElInput, ElBadge, ElButton } from 'element-plus'
import { Bell, User, Unlock, Setting, Menu } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const courseStore = useCourseStore()
const notificationStore = useNotificationStore()

const sidebarCollapsed = ref(false)
const drawerVisible = ref(false)
const searchQuery = ref('')

const menuItems = [
  { path: '/student/dashboard', label: '课程中心', icon: '📚' },
  { path: '/student/tasks', label: '学习任务', icon: '✅' },
  { path: '/student/discussions', label: '问答讨论', icon: '💬' },
  { path: '/student/exams', label: '作业考试', icon: '📝' },
  { path: '/student/groups', label: '小组教学', icon: '👥' },
  { path: '/student/classroom', label: '课堂学习', icon: '🎓' }
]

const currentPath = computed(() => route.path)

function isActive(path: string): boolean {
  if (path === '/student/dashboard') {
    return currentPath.value === '/student/dashboard'
  }
  if (path === '/student/tasks') {
    return currentPath.value.startsWith('/student/tasks') || currentPath.value.startsWith('/student/task/')
  }
  if (path === '/student/discussions') {
    return currentPath.value.startsWith('/student/discussions') || currentPath.value.startsWith('/student/discussion/')
  }
  if (path === '/student/exams') {
    return currentPath.value.startsWith('/student/exams') || currentPath.value.startsWith('/student/exam/')
  }
  if (path === '/student/groups') {
    return currentPath.value.startsWith('/student/groups')
  }
  if (path === '/student/classroom') {
    return currentPath.value.startsWith('/student/classroom')
  }
  return currentPath.value.startsWith('/student/course')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function goToProfile() {
  router.push('/profile')
}

function handleSearch() {
  courseStore.searchKeyword = searchQuery.value
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleDrawer() {
  drawerVisible.value = !drawerVisible.value
}
</script>

<template>
  <div class="student-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo-section">
        <span v-if="!sidebarCollapsed" class="logo-text">智学课堂</span>
        <span v-else class="logo-icon">📚</span>
      </div>
      
      <ElMenu
        mode="vertical"
        :default-active="currentPath"
        class="sidebar-menu"
      >
        <ElMenuItem
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          :class="{ active: isActive(item.path) }"
          @click="router.push(item.path)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="menu-text">{{ item.label }}</span>
        </ElMenuItem>
      </ElMenu>

      <button class="collapse-btn" @click="toggleSidebar">
        {{ sidebarCollapsed ? '▶' : '◀' }}
      </button>
    </aside>

    <button class="mobile-menu-btn" @click="toggleDrawer">
      <Menu />
    </button>

    <ElDrawer
      v-model="drawerVisible"
      direction="ltr"
      class="mobile-drawer"
    >
      <div class="drawer-header">
        <span class="logo-text">智学课堂</span>
      </div>
      <ElMenu mode="vertical" :default-active="currentPath" class="drawer-menu">
        <ElMenuItem
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          @click="router.push(item.path); drawerVisible = false"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-text">{{ item.label }}</span>
        </ElMenuItem>
      </ElMenu>
    </ElDrawer>

    <main class="main-content">
      <header class="top-bar">
        <div class="top-left">
          <select
            v-model="courseStore.currentSemester"
            class="semester-select"
          >
            <option v-for="semester in courseStore.semesters" :key="semester" :value="semester">
              {{ semester }}
            </option>
          </select>
        </div>

        <div class="top-center">
          <div class="search-box">
            <ElInput
              v-model="searchQuery"
              placeholder="搜索课程..."
              prefix-icon="Search"
              @keyup.enter="handleSearch"
              class="search-input"
            />
            <ElButton type="primary" @click="handleSearch" class="search-btn">
              搜索
            </ElButton>
          </div>
        </div>

        <div class="top-right">
          <ElButton class="notification-btn" @click="toggleDrawer">
            <ElBadge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0">
              <Bell />
            </ElBadge>
          </ElButton>

          <ElDropdown trigger="click" class="user-dropdown">
            <div class="user-info">
              <div class="avatar">
                <User />
              </div>
              <span v-if="authStore.user">{{ authStore.user.name }}</span>
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem @click="goToProfile">
                  <User /> 个人中心
                </ElDropdownItem>
                <ElDropdownItem @click="goToProfile">
                  <Setting /> 修改密码
                </ElDropdownItem>
                <ElDropdownItem divided @click="handleLogout">
                  <Unlock /> 退出登录
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </header>

      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 60px;
}

.logo-section {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #4a5568;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
}

.logo-icon {
  font-size: 24px;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 8px;
  padding: 0 12px;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.active {
  background: #667eea;
  color: white;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu-text {
  font-size: 14px;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  padding: 12px;
  cursor: pointer;
  border-top: 1px solid #4a5568;
}

.collapse-btn:hover {
  color: white;
}

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  background: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-drawer {
  width: 280px !important;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.drawer-menu {
  border: none;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
}

.sidebar.collapsed + .mobile-menu-btn + .main-content {
  margin-left: 60px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
}

.top-left {
  flex: 1;
}

.semester-select {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.top-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.search-box {
  width: 100%;
  max-width: 500px;
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
}

.search-btn {
  white-space: nowrap;
  min-width: 80px;
}

.top-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.content-area {
  flex: 1;
  padding: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .top-bar {
    padding: 12px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .top-left, .top-center, .top-right {
    flex: 1;
    width: 100%;
    justify-content: center;
  }
  
  .semester-select {
    width: 100%;
  }
}
</style>
