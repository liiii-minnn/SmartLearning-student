<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { ElDialog, ElButton, ElProgress, ElCard, ElImage } from 'element-plus'

const router = useRouter()
const courseStore = useCourseStore()

const selectedCourse = ref<any>(null)
const dialogVisible = ref(false)

const courses = computed(() => courseStore.filteredCourses)

function showCourseDetail(course: any) {
  selectedCourse.value = course
  dialogVisible.value = true
}

function goToCourse(courseId: number) {
  dialogVisible.value = false
  router.push(`/student/course/${courseId}`)
}

function closeDialog() {
  dialogVisible.value = false
}
</script>

<template>
  <div class="dashboard">
      <div class="dashboard-header">
        <h1>课程中心</h1>
        <p>当前学期：{{ courseStore.currentSemester }}</p>
      </div>

      <div class="course-grid">
        <ElCard
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          hover
          @click="showCourseDetail(course)"
        >
          <div class="course-cover">
            <ElImage :src="course.cover" fit="cover" />
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.name }}</h3>
            <p class="course-teacher">{{ course.teacher }}</p>
            <div class="progress-container">
              <span class="progress-label">学习进度</span>
              <ElProgress
                :percentage="course.progress"
                :stroke-width="6"
                :show-text="false"
                class="progress-bar"
              />
              <span class="progress-text">{{ course.progress }}%</span>
            </div>
          </div>
        </ElCard>
      </div>

      <ElDialog
        v-model="dialogVisible"
        title="课程详情"
        width="600px"
        @close="closeDialog"
      >
        <div v-if="selectedCourse" class="course-detail">
          <div class="detail-cover">
            <ElImage :src="selectedCourse.cover" fit="cover" />
          </div>
          <div class="detail-info">
            <h2>{{ selectedCourse.name }}</h2>
            <p class="teacher">授课教师：{{ selectedCourse.teacher }}</p>
            <p class="description">{{ selectedCourse.description }}</p>
            <div class="metadata">
              <span class="meta-item">学分：{{ selectedCourse.credits }}</span>
              <span class="meta-item">学时：{{ selectedCourse.hours }}</span>
              <span class="meta-item">学期：{{ selectedCourse.semester }}</span>
            </div>
            <div class="progress-section">
              <span class="progress-label">当前学习进度</span>
              <ElProgress
                :percentage="selectedCourse.progress"
                :stroke-width="8"
                class="detail-progress"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <ElButton @click="closeDialog">关闭</ElButton>
          <ElButton type="primary" @click="goToCourse(selectedCourse?.id)">进入学习</ElButton>
        </template>
      </ElDialog>
    </div>
</template>

<style scoped>
.dashboard {
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #718096;
  font-size: 14px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.course-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.course-cover {
  height: 140px;
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

.course-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.course-teacher {
  font-size: 13px;
  color: #718096;
  margin-bottom: 12px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-size: 12px;
  color: #718096;
}

.progress-bar {
  flex: 1;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}

.course-detail {
  display: flex;
  gap: 20px;
}

.detail-cover {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
}

.detail-info h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.teacher {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 16px;
}

.metadata {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 13px;
  color: #718096;
  padding: 4px 12px;
  background: #f7fafc;
  border-radius: 20px;
}

.progress-section {
  margin-top: 16px;
}

.progress-section .progress-label {
  display: block;
  margin-bottom: 8px;
}

.detail-progress {
  width: 100%;
}

@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .course-detail {
    flex-direction: column;
  }
  
  .detail-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
