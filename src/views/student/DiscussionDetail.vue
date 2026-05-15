<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useAuthStore } from '../../stores/authStore'
import { ElMessage, ElButton, ElInput, ElCard } from 'element-plus'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const discussionId = computed(() => Number(route.params.discussionId))
const discussion = computed(() => courseStore.getDiscussionById(discussionId.value))

const replyContent = ref('')
const isSubmitting = ref(false)
const courseScore = ref(0)

function handleReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  isSubmitting.value = true
  
  setTimeout(() => {
    const author = authStore.user?.name || '匿名用户'
    courseStore.addDiscussionReply(discussionId.value, replyContent.value, author)
    
    notificationStore.addScore(1, 2)
    courseScore.value = notificationStore.getScore(1)
    
    ElMessage.success('回复成功，已获得2分平时成绩')
    replyContent.value = ''
    isSubmitting.value = false
  }, 500)
}

onMounted(() => {
  if (!discussion.value) {
    router.push('/student/dashboard')
    return
  }
  courseScore.value = notificationStore.getScore(1)
})
</script>

<template>
  <div v-if="discussion" class="discussion-detail">
      <div class="back-button">
        <ElButton @click="router.back()">返回</ElButton>
      </div>

      <div class="score-bar">
        <span class="score-label">当前课程平时积分</span>
        <span class="score-value">{{ courseScore }}</span>
      </div>

      <ElCard class="discussion-card">
        <div class="discussion-header">
          <h1>{{ discussion.title }}</h1>
          <div class="discussion-meta">
            <span class="author" :class="{ teacher: discussion.authorRole === 'teacher' }">
              {{ discussion.author }}
              <span v-if="discussion.authorRole === 'teacher'" class="role-badge">教师</span>
            </span>
            <span class="time">{{ discussion.createdAt }}</span>
            <span class="participants">{{ discussion.participantCount }}人参与</span>
          </div>
        </div>

        <div class="discussion-content">
          <p>{{ discussion.content }}</p>
        </div>

        <div class="replies-section">
          <h3>回复列表（{{ discussion.replies.length }}）</h3>
          
          <div v-if="discussion.replies.length === 0" class="no-replies">
            <p>暂无回复，快来发表你的观点吧！</p>
          </div>

          <div
            v-for="reply in discussion.replies"
            :key="reply.id"
            class="reply-item"
          >
            <div class="reply-header">
              <span class="reply-author">{{ reply.author }}</span>
              <span class="reply-time">{{ reply.createdAt }}</span>
            </div>
            <p class="reply-content">{{ reply.content }}</p>
          </div>
        </div>

        <div class="reply-input-section">
          <ElInput
            v-model="replyContent"
            type="textarea"
            placeholder="发表你的回复..."
            :rows="3"
            class="reply-input"
          />
          <div class="reply-footer">
            <span class="tip">发表回复可获得2分平时成绩</span>
            <ElButton
              type="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting || !replyContent.trim()"
              @click="handleReply"
            >
              发表回复
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>
</template>

<style scoped>
.discussion-detail {
  min-height: 100%;
}

.back-button {
  margin-bottom: 16px;
}

.score-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.score-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.discussion-card {
  max-width: 800px;
  margin: 0 auto;
}

.discussion-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

.discussion-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.discussion-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.author {
  font-size: 14px;
  font-weight: 500;
}

.author.teacher {
  color: #667eea;
}

.role-badge {
  font-size: 11px;
  color: white;
  background: #667eea;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.time, .participants {
  font-size: 13px;
  color: #718096;
}

.discussion-content {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.discussion-content p {
  font-size: 15px;
  line-height: 1.6;
}

.replies-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.no-replies {
  text-align: center;
  padding: 40px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 16px;
}

.no-replies p {
  color: #718096;
}

.reply-item {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 12px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reply-author {
  font-size: 14px;
  font-weight: 500;
}

.reply-time {
  font-size: 12px;
  color: #718096;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
}

.reply-input-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.reply-input {
  margin-bottom: 12px;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip {
  font-size: 13px;
  color: #667eea;
}

@media (max-width: 768px) {
  .discussion-meta {
    flex-wrap: wrap;
  }
}
</style>
