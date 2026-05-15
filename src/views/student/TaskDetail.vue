<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { ElMessage, ElButton, ElInput, ElUpload, ElCard } from 'element-plus'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const taskId = computed(() => Number(route.params.taskId))
const task = computed(() => courseStore.getTaskById(taskId.value))

const answerText = ref('')
const uploadedFiles = ref<File[]>([])
const isSubmitting = ref(false)

function handleFileUpload(file: any) {
  uploadedFiles.value.push(file)
  return false
}

function handleSubmit() {
  if (!answerText.value.trim() && uploadedFiles.value.length === 0) {
    ElMessage.warning('请至少填写答案或上传文件')
    return
  }
  
  isSubmitting.value = true
  
  setTimeout(() => {
    courseStore.submitTask(taskId.value)
    ElMessage.success('作业提交成功，等待教师批改')
    console.log('模拟发送教师通知')
    isSubmitting.value = false
    router.push('/student/course/1')
  }, 1000)
}

function downloadAttachment(filename: string) {
  ElMessage.info(`模拟下载：${filename}`)
}

onMounted(() => {
  if (!task.value) {
    router.push('/student/dashboard')
  }
})
</script>

<template>
  <div v-if="task" class="task-detail">
      <div class="back-button">
        <ElButton @click="router.back()">返回</ElButton>
      </div>

      <ElCard class="task-card">
        <div class="task-header">
          <h1>{{ task.name }}</h1>
          <div class="task-meta">
            <span class="deadline">截止时间：{{ task.deadline }}</span>
            <span :class="['status-badge', task.status === 'pending' ? 'status-pending' : task.status === 'submitted' ? 'status-submitted' : 'status-graded']">
              {{ task.status === 'pending' ? '待完成' : task.status === 'submitted' ? '已提交待批改' : '已批改' }}
            </span>
          </div>
        </div>

        <div class="task-content">
          <h3>任务描述</h3>
          <p>{{ task.description }}</p>

          <div v-if="task.attachments.length > 0" class="attachments-section">
            <h3>相关附件</h3>
            <div class="attachments-list">
              <div
                v-for="(attachment, index) in task.attachments"
                :key="index"
                class="attachment-item"
                @click="downloadAttachment(attachment)"
              >
                <span class="attachment-icon">📄</span>
                <span class="attachment-name">{{ attachment }}</span>
                <span class="download-text">点击下载</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="task.status === 'pending'" class="answer-section">
          <h3>我的答案</h3>
          <ElInput
            v-model="answerText"
            type="textarea"
            placeholder="请输入你的答案..."
            :rows="8"
            class="answer-input"
          />

          <div class="upload-section">
            <h4>上传附件</h4>
            <ElUpload
              class="uploader"
              action=""
              :auto-upload="false"
              :before-upload="handleFileUpload"
              :file-list="uploadedFiles.map((f, i) => ({ name: f.name, uid: i }))"
            >
              <ElButton type="primary">选择文件</ElButton>
            </ElUpload>
            <div v-if="uploadedFiles.length > 0" class="uploaded-files">
              <span v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file">
                {{ file.name }}
              </span>
            </div>
          </div>

          <ElButton
            type="primary"
            class="submit-btn"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            提交作业
          </ElButton>
        </div>

        <div v-else class="submitted-section">
          <div class="submitted-info">
            <p>作业已提交，等待教师批改</p>
          </div>
        </div>
      </ElCard>
    </div>
</template>

<style scoped>
.task-detail {
  min-height: 100%;
}

.back-button {
  margin-bottom: 16px;
}

.task-card {
  max-width: 800px;
  margin: 0 auto;
}

.task-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

.task-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.task-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.deadline {
  font-size: 14px;
  color: #718096;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.status-pending {
  background: #fff7e6;
  color: #d46b08;
}

.status-submitted {
  background: #e6f7ff;
  color: #1890ff;
}

.status-graded {
  background: #f6ffed;
  color: #52c41a;
}

.task-content {
  margin-bottom: 24px;
}

.task-content h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.task-content p {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.6;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
}

.attachment-item:hover {
  background: #edf2f7;
}

.attachment-icon {
  font-size: 20px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
}

.download-text {
  font-size: 13px;
  color: #667eea;
}

.answer-section {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.answer-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.answer-input {
  margin-bottom: 16px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-section h4 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.uploaded-files {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.uploaded-file {
  padding: 4px 12px;
  background: #e6f7ff;
  border-radius: 4px;
  font-size: 13px;
  color: #1890ff;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.submitted-section {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.submitted-info p {
  text-align: center;
  color: #718096;
  padding: 20px;
}

@media (max-width: 768px) {
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
