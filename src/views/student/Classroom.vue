<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notificationStore'
import { useCourseStore } from '../../stores/courseStore'
import { ElCard, ElButton } from 'element-plus'

const router = useRouter()
const notificationStore = useNotificationStore()
const courseStore = useCourseStore()

const currentTime = ref(new Date())

onMounted(() => {
  notificationStore.initMockData()
  
  setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

const todaySchedule = computed(() => {
  const today = new Date().getDay() || 7
  return notificationStore.schedules
    .filter(s => s.weekday === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const currentClass = computed(() => {
  return notificationStore.getCurrentClass()
})

function getTeacherName(courseId: number) {
  return courseStore.courses.find(c => c.id === courseId)?.teacher || '未知教师'
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${year}年${month}月${day}日 ${dayNames[date.getDay()]}`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function goToCourse(courseId: number) {
  router.push(`/student/course/${courseId}`)
}

function goToGroup() {
  router.push('/student/groups')
}
</script>

<template>
  <div class="classroom-page">
    <div class="page-header">
      <h1>课堂学习</h1>
      <div class="current-time">
        <span class="date">{{ formatDate(currentTime) }}</span>
        <span class="time">{{ formatTime(currentTime) }}</span>
      </div>
    </div>

    <div v-if="currentClass" class="current-class">
      <ElCard class="current-class-card">
        <div class="class-badge">正在进行</div>
        <div class="class-info">
          <h2>{{ currentClass.courseName }}</h2>
          <div class="class-meta">
            <span>{{ getTeacherName(currentClass.courseId) }}</span>
            <span>{{ currentClass.startTime }} - {{ currentClass.endTime }}</span>
            <span>{{ currentClass.location }}</span>
          </div>
        </div>
        <div class="class-actions">
          <ElButton type="primary" @click="goToCourse(currentClass.courseId)">
            🎬 学习资源
          </ElButton>
          <ElButton @click="goToCourse(currentClass.courseId)">
            💬 问答讨论
          </ElButton>
          <ElButton @click="goToGroup">
            👥 小组活动
          </ElButton>
        </div>
      </ElCard>
    </div>

    <ElCard class="schedule-card">
      <h3>今日课表</h3>
      <div v-if="todaySchedule.length > 0" class="schedule-list">
        <div v-for="item in todaySchedule" :key="item.id" class="schedule-item">
          <div class="schedule-time">
            <span>{{ item.startTime }}</span>
            <span class="separator">-</span>
            <span>{{ item.endTime }}</span>
          </div>
          <div class="schedule-info">
            <span class="course-name">{{ item.courseName }}</span>
            <span>{{ getTeacherName(item.courseId) }} | {{ item.location }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>今天没有课程安排</p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.classroom-page {
  min-height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.current-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-time .date {
  font-size: 14px;
  color: #718096;
}

.current-time .time {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.current-class {
  margin-bottom: 20px;
}

.current-class-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.class-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.class-info h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.class-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  opacity: 0.9;
}

.class-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.class-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.class-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.schedule-card {
  border-radius: 12px;
}

.schedule-card h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.schedule-time {
  display: flex;
  align-items: center;
  width: 100px;
  font-weight: 500;
  color: #4a5568;
}

.separator {
  margin: 0 4px;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-name {
  font-weight: 500;
  color: #1a202c;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #a0aec0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .current-time {
    align-items: flex-start;
  }
  
  .class-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .class-actions {
    flex-wrap: wrap;
  }
}
</style>
