<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { ElCard, ElButton } from 'element-plus'

const router = useRouter()
const courseStore = useCourseStore()

const discussions = computed(() => {
  return courseStore.discussions.map(discussion => {
    const course = courseStore.courses.find(c => c.id === discussion.courseId)
    return {
      ...discussion,
      courseName: course?.name || '未知课程',
      courseId: discussion.courseId
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function goToDiscussion(discussionId: number) {
  router.push(`/student/discussion/${discussionId}`)
}

function goToCourse(courseId: number) {
  router.push(`/student/course/${courseId}`)
}
</script>

<template>
  <div class="discussions-page">
    <div class="page-header">
      <h1>问答讨论</h1>
      <p>共 {{ discussions.length }} 个讨论主题</p>
    </div>

    <div class="discussion-list">
      <ElCard
        v-for="discussion in discussions"
        :key="discussion.id"
        class="discussion-card"
        hover
      >
        <div class="discussion-header">
          <span class="course-tag" @click="goToCourse(discussion.courseId)">
            {{ discussion.courseName }}
          </span>
          <span class="time">{{ discussion.createdAt }}</span>
        </div>
        <h3 class="discussion-title" @click="goToDiscussion(discussion.id)">
          {{ discussion.title }}
        </h3>
        <p class="discussion-content">{{ discussion.content }}</p>
        <div class="discussion-footer">
          <span class="author">发起人：{{ discussion.author }}</span>
          <span class="participants">参与人数：{{ discussion.participantCount }}</span>
          <span class="replies">回复数：{{ discussion.replies.length }}</span>
          <ElButton type="primary" size="small" @click="goToDiscussion(discussion.id)">
            参与讨论
          </ElButton>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.discussions-page {
  min-height: 100%;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.page-header p {
  color: #718096;
  font-size: 14px;
}

.discussion-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.discussion-card {
  cursor: pointer;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.discussion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-tag {
  background: #e6fffa;
  color: #319795;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}

.course-tag:hover {
  background: #b2f5ea;
}

.time {
  font-size: 12px;
  color: #a0aec0;
}

.discussion-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
  cursor: pointer;
}

.discussion-title:hover {
  color: #667eea;
}

.discussion-content {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discussion-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #718096;
  font-size: 13px;
}

.author, .participants, .replies {
  display: flex;
  align-items: center;
}
</style>