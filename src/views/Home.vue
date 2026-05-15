<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElInput, ElCarousel, ElCarouselItem } from 'element-plus'

const router = useRouter()

const searchKeyword = ref('')

const navItems = [
  { name: '全部课程', path: '/student/dashboard' },
  { name: '热门课程', path: '/student/dashboard' },
  { name: '新课上线', path: '/student/dashboard' },
  { name: '免费课程', path: '/student/dashboard' }
]

const courses = [
  { id: 1, name: '数据结构', teacher: '李老师', cover: 'https://picsum.photos/seed/ds/300/200', category: '计算机' },
  { id: 2, name: '操作系统', teacher: '王老师', cover: 'https://picsum.photos/seed/os/300/200', category: '计算机' },
  { id: 3, name: '人工智能', teacher: '赵老师', cover: 'https://picsum.photos/seed/ai/300/200', category: 'AI' },
  { id: 4, name: '云计算', teacher: '郑老师', cover: 'https://picsum.photos/seed/cloud/300/200', category: '云计算' },
  { id: 5, name: '网络安全', teacher: '黄老师', cover: 'https://picsum.photos/seed/sec/300/200', category: '安全' },
  { id: 6, name: '软件工程', teacher: '陈老师', cover: 'https://picsum.photos/seed/se/300/200', category: '计算机' },
  { id: 7, name: '数据库', teacher: '刘老师', cover: 'https://picsum.photos/seed/db/300/200', category: '计算机' },
  { id: 8, name: '算法设计', teacher: '周老师', cover: 'https://picsum.photos/seed/algo/300/200', category: '计算机' }
]

function goToLogin() {
  router.push('/login')
}

function goToCourse(_courseId: number) {
  router.push('/login')
}

function handleSearch() {
  if (searchKeyword.value) {
    router.push('/login')
  }
}
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo" @click="router.push('/')">智学课堂</h1>
        </div>

        <nav class="nav-section">
          <ElDropdown trigger="hover" class="nav-dropdown">
            <span class="nav-item">课程</span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-for="item in navItems" :key="item.name" @click="router.push(item.path)">
                  {{ item.name }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          
          <span class="nav-item" @click="router.push('/textbook')">电子教材</span>
          <span class="nav-item" @click="router.push('/schools')">学校</span>
          <span class="nav-item" @click="router.push('/question-bank')">题库</span>
          <span class="nav-item" @click="router.push('/practice')">刷题</span>
        </nav>

        <div class="search-section">
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索课程..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="action-section">
          <ElButton type="primary" @click="goToLogin">登录</ElButton>
        </div>
      </div>
    </header>

    <section class="carousel-section">
      <ElCarousel height="400px" class="home-carousel">
        <ElCarouselItem v-for="i in 3" :key="i">
          <div class="carousel-item">
            <div class="carousel-content">
              <h2>智学课堂 - 智慧学习平台</h2>
              <p>海量课程资源，助您学业进步</p>
            </div>
          </div>
        </ElCarouselItem>
      </ElCarousel>
    </section>

    <section class="courses-section">
      <div class="section-header">
        <h2>热门课程推荐</h2>
        <span class="view-more" @click="router.push('/login')">查看更多 →</span>
      </div>

      <div class="courses-grid">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @click="goToCourse(course.id)"
        >
          <div class="course-cover">
            <img :src="course.cover" :alt="course.name" />
          </div>
          <div class="course-info">
            <span class="course-category">{{ course.category }}</span>
            <h3>{{ course.name }}</h3>
            <p>{{ course.teacher }}</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <div class="footer-content">
        <p>© 2025 智学课堂 版权所有</p>
        <p>智慧学习，成就未来</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  cursor: pointer;
}

.nav-section {
  display: flex;
  gap: 32px;
}

.nav-item {
  font-size: 15px;
  color: #333;
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  color: #667eea;
}

.nav-dropdown {
  cursor: pointer;
}

.search-section {
  flex: 1;
  max-width: 300px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
}

.action-section {
  margin-left: 16px;
}

.carousel-section {
  margin-bottom: 40px;
}

.home-carousel {
  width: 100%;
}

.carousel-item {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-content {
  text-align: center;
  color: white;
}

.carousel-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
}

.carousel-content p {
  font-size: 18px;
  opacity: 0.9;
}

.courses-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 600;
}

.view-more {
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.course-cover {
  height: 160px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  padding: 16px;
}

.course-category {
  font-size: 12px;
  color: #667eea;
  padding: 2px 8px;
  background: #e6f7ff;
  border-radius: 4px;
}

.course-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 4px;
}

.course-info p {
  font-size: 14px;
  color: #718096;
}

.home-footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 24px;
  margin-top: 40px;
}

.footer-content p {
  margin: 4px 0;
  opacity: 0.8;
}

@media (max-width: 1000px) {
  .courses-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .nav-section {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .nav-section {
    order: 3;
    width: 100%;
    gap: 16px;
  }
  
  .search-section {
    order: 2;
    margin: 0;
    max-width: 100%;
  }
  
  .action-section {
    margin-left: 0;
  }
  
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .carousel-content h2 {
    font-size: 24px;
  }
}

@media (max-width: 500px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
