<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { ElTabs, ElTabPane, ElButton, ElCard, ElTable, ElTableColumn, ElProgress, ElDialog, ElInput, ElMessage } from 'element-plus'
import VideoPlayer from '../../components/VideoPlayer.vue'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const notificationStore = useNotificationStore()

const activeTab = ref('resources')
const courseId = computed(() => Number(route.params.courseId))

const course = computed(() => courseStore.getCourseById(courseId.value))
const videos = computed(() => courseStore.getVideosByCourseId(courseId.value))
const tasks = computed(() => courseStore.getTasksByCourseId(courseId.value))
const discussions = computed(() => courseStore.getDiscussionsByCourseId(courseId.value))
const exams = computed(() => courseStore.getExamsByCourseId(courseId.value))

const currentGroup = computed(() => notificationStore.getGroupByMemberId(1))
const todaySchedule = computed(() => notificationStore.getTodaySchedule())
const currentClass = computed(() => notificationStore.getCurrentClass())

const showVideoPlayer = ref(false)
const selectedVideo = ref<any>(null)

const groupName = ref('')
const showCreateGroup = ref(false)

const searchStudent = ref('')
const mockStudents = [
  { id: 101, name: '李四', studentId: '2021002' },
  { id: 102, name: '王五', studentId: '2021003' },
  { id: 103, name: '赵六', studentId: '2021004' },
  { id: 104, name: '钱七', studentId: '2021005' },
  { id: 105, name: '孙八', studentId: '2021006' }
]

const filteredStudents = computed(() => {
  if (!searchStudent.value) return mockStudents
  return mockStudents.filter(s => 
    s.name.includes(searchStudent.value) || s.studentId.includes(searchStudent.value)
  )
})

const mockGroupQuestions = [
  { id: 1, question: '请讨论并设计一个高效的排序算法', deadline: '2025-03-25', status: 'pending' },
  { id: 2, question: '分析数据库索引的作用和实现原理', deadline: '2025-03-28', status: 'approved' }
]

const groupAnswer = ref('')

function openVideoPlayer(video: any) {
  selectedVideo.value = video
  showVideoPlayer.value = true
}

function closeVideoPlayer() {
  showVideoPlayer.value = false
}

function downloadDocument() {
  ElMessage.info('模拟下载文档')
}

function goToTask(taskId: number) {
  router.push(`/student/task/${taskId}`)
}

function goToDiscussion(discussionId: number) {
  router.push(`/student/discussion/${discussionId}`)
}

function goToExam(examId: number) {
  router.push(`/student/exam/${examId}`)
}

function goToCourse(courseId: number) {
  router.push(`/student/course/${courseId}`)
}

function createGroup() {
  if (!groupName.value) {
    ElMessage.warning('请输入小组名称')
    return
  }
  notificationStore.createGroup(groupName.value, courseId.value, 1)
  ElMessage.success('小组创建成功')
  showCreateGroup.value = false
  groupName.value = ''
}

function applyToGroup(studentId: number) {
  ElMessage.success(`已发送组队申请给 ${mockStudents.find(s => s.id === studentId)?.name}`)
}

function submitGroupAnswer() {
  if (!groupAnswer.value.trim()) {
    ElMessage.warning('请输入答案')
    return
  }
  ElMessage.success('小组答案已提交，等待教师审核')
  groupAnswer.value = ''
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待完成',
    submitted: '已提交',
    graded: '已批改',
    approved: '已通过'
  }
  return statusMap[status] || status
}

function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    submitted: 'status-submitted',
    graded: 'status-graded',
    approved: 'status-approved'
  }
  return classMap[status] || ''
}

onMounted(() => {
  if (!course.value) {
    router.push('/student/dashboard')
  }
})
</script>

<template>
  <div v-if="course" class="course-detail">
      <div class="course-header">
        <div class="header-left">
          <h1>{{ course.name }}</h1>
          <p>授课教师：{{ course.teacher }}</p>
        </div>
        <div class="header-right">
          <ElProgress :percentage="course.progress" :stroke-width="12" :show-text="true" />
        </div>
      </div>

      <ElTabs v-model="activeTab" type="card" class="course-tabs">
        <ElTabPane label="学习资源" name="resources">
          <div class="resources-section">
            <h3>视频资源</h3>
            <div class="video-list">
              <ElCard
                v-for="video in videos"
                :key="video.id"
                class="video-card"
                hover
              >
                <div class="video-item">
                  <div class="video-thumbnail">
                    <span class="play-icon">▶</span>
                  </div>
                  <div class="video-info">
                    <h4>{{ video.title }}</h4>
                    <p>时长：{{ Math.floor(video.duration / 60) }}分{{ video.duration % 60 }}秒</p>
                    <p>弹题数：{{ video.questions.length }}道</p>
                  </div>
                  <ElButton type="primary" @click="openVideoPlayer(video)">播放</ElButton>
                </div>
              </ElCard>
            </div>

            <h3>文档资源</h3>
            <div class="document-list">
              <ElCard
                v-for="(doc, index) in ['课程讲义.pdf', '实验指导书.docx', '参考资料.zip']"
                :key="index"
                class="document-card"
                hover
              >
                <div class="document-item">
                  <span class="doc-icon">📄</span>
                  <span class="doc-name">{{ doc }}</span>
                  <ElButton @click="downloadDocument">下载</ElButton>
                </div>
              </ElCard>
            </div>
          </div>
        </ElTabPane>

        <ElTabPane label="学习任务" name="tasks">
          <ElTable :data="tasks" class="task-table">
            <ElTableColumn prop="name" label="任务名称" />
            <ElTableColumn prop="deadline" label="截止时间" />
            <ElTableColumn prop="status" label="状态">
              <template #default="scope">
                <span :class="['status-badge', getStatusClass(scope.row.status)]">
                  {{ getStatusText(scope.row.status) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作">
              <template #default="scope">
                <ElButton type="text" @click="goToTask(scope.row.id)">查看</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="问答讨论" name="discussions">
          <div class="discussion-list">
            <ElCard
              v-for="discussion in discussions"
              :key="discussion.id"
              class="discussion-card"
              hover
              @click="goToDiscussion(discussion.id)"
            >
              <div class="discussion-item">
                <h4>{{ discussion.title }}</h4>
                <p class="discussion-meta">
                  {{ discussion.author }} · {{ discussion.createdAt }} · {{ discussion.participantCount }}人参与
                </p>
                <p class="discussion-preview">{{ discussion.content }}</p>
                <p class="reply-count">回复数：{{ discussion.replies.length }}</p>
              </div>
            </ElCard>
          </div>
        </ElTabPane>

        <ElTabPane label="作业考试" name="exams">
          <ElTable :data="exams" class="exam-table">
            <ElTableColumn prop="name" label="名称" />
            <ElTableColumn prop="type" label="类型">
              <template #default="scope">
                <span :class="['type-badge', scope.row.type === 'exam' ? 'type-exam' : 'type-homework']">
                  {{ scope.row.type === 'exam' ? '考试' : '作业' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="deadline" label="截止时间" />
            <ElTableColumn prop="totalScore" label="总分" />
            <ElTableColumn prop="status" label="状态">
              <template #default="scope">
                <span :class="['status-badge', getStatusClass(scope.row.status)]">
                  {{ getStatusText(scope.row.status) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作">
              <template #default="scope">
                <ElButton type="text" @click="goToExam(scope.row.id)">进入</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="小组教学" name="group">
          <div v-if="currentGroup" class="group-section">
            <h3>我的小组</h3>
            <ElCard class="group-info">
              <div class="group-header">
                <h4>{{ currentGroup.name }}</h4>
                <span class="group-code">小组码：{{ currentGroup.code }}</span>
              </div>
              <div class="group-members">
                <h5>成员列表</h5>
                <div class="members-list">
                  <div v-for="member in [1, 2, 3]" :key="member" class="member-item">
                    <span class="member-avatar">{{ ['张三', '李四', '王五'][member - 1] }}</span>
                    <span>{{ ['张三', '李四', '王五'][member - 1] }}</span>
                    <span v-if="member === 1" class="leader-badge">组长</span>
                  </div>
                </div>
              </div>
            </ElCard>

            <h3>小组讨论问题</h3>
            <div class="group-questions">
              <ElCard
                v-for="question in mockGroupQuestions"
                :key="question.id"
                class="question-card"
              >
                <div class="question-header">
                  <h4>问题{{ question.id }}</h4>
                  <span :class="['status-badge', getStatusClass(question.status)]">
                    {{ getStatusText(question.status) }}
                  </span>
                </div>
                <p class="question-text">{{ question.question }}</p>
                <p class="question-deadline">截止时间：{{ question.deadline }}</p>
                <div v-if="question.status === 'pending'" class="answer-section">
                  <ElInput
                    v-model="groupAnswer"
                    type="textarea"
                    placeholder="输入小组讨论答案..."
                    :rows="3"
                  />
                  <ElButton type="primary" @click="submitGroupAnswer">提交答案</ElButton>
                </div>
              </ElCard>
            </div>
          </div>

          <div v-else class="no-group">
            <ElCard class="create-group-card">
              <h3>尚未加入小组</h3>
              <ElButton type="primary" @click="showCreateGroup = true">创建小组</ElButton>
            </ElCard>

            <ElCard class="search-student-card">
              <h3>搜索同学组队</h3>
              <ElInput
                v-model="searchStudent"
                placeholder="搜索姓名或学号..."
                class="search-input"
              />
              <div class="student-list">
                <div
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="student-item"
                >
                  <span>{{ student.name }}</span>
                  <span class="student-id">{{ student.studentId }}</span>
                  <ElButton type="text" @click="applyToGroup(student.id)">申请加入</ElButton>
                </div>
              </div>
            </ElCard>
          </div>
        </ElTabPane>

        <ElTabPane label="课堂学习" name="classroom">
          <div class="classroom-section">
            <h3>今日课表</h3>
            <div class="schedule-list">
              <ElCard
                v-for="schedule in todaySchedule"
                :key="schedule.id"
                :class="['schedule-card', { active: currentClass?.id === schedule.id }]"
              >
                <div class="schedule-header">
                  <h4>{{ schedule.courseName }}</h4>
                  <span v-if="currentClass?.id === schedule.id" class="current-tag">正在上课</span>
                </div>
                <p>{{ schedule.startTime }} - {{ schedule.endTime }}</p>
                <p class="location">{{ schedule.location }}</p>
                <div v-if="currentClass?.id === schedule.id" class="class-actions">
                  <ElButton type="primary" @click="goToCourse(schedule.courseId)">进入课堂</ElButton>
                </div>
              </ElCard>
            </div>

            <div v-if="!currentClass" class="no-class">
              <ElCard>
                <p class="no-class-text">当前没有正在进行的课程</p>
              </ElCard>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <ElDialog
      v-model="showVideoPlayer"
      title="视频学习"
      width="800px"
      :show-footer="false"
      @close="closeVideoPlayer"
    >
      <VideoPlayer
        v-if="selectedVideo"
        :video="selectedVideo"
        @close="closeVideoPlayer"
      />
    </ElDialog>

    <ElDialog
      v-model="showCreateGroup"
      title="创建小组"
      width="400px"
      @close="showCreateGroup = false"
    >
      <ElInput
        v-model="groupName"
        placeholder="请输入小组名称"
        class="group-name-input"
      />
      <p class="group-tip">小组人数不超过5人</p>
      <template #footer>
        <ElButton @click="showCreateGroup = false">取消</ElButton>
        <ElButton type="primary" @click="createGroup">创建</ElButton>
      </template>
    </ElDialog>
</template>

<style scoped>
.course-detail {
  min-height: 100%;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.header-left p {
  color: #718096;
}

.course-tabs {
  background: white;
  border-radius: 12px;
}

.resources-section {
  padding: 20px;
}

.resources-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.video-list, .document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card, .document-card {
  cursor: pointer;
}

.video-item, .document-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.video-thumbnail {
  width: 120px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 24px;
  color: white;
}

.video-info {
  flex: 1;
}

.video-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.video-info p {
  font-size: 13px;
  color: #718096;
}

.doc-icon {
  font-size: 24px;
}

.doc-name {
  flex: 1;
}

.task-table, .exam-table {
  width: 100%;
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

.status-approved {
  background: #f6ffed;
  color: #52c41a;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.type-exam {
  background: #fff1f0;
  color: #cf1322;
}

.type-homework {
  background: #f0f5ff;
  color: #1890ff;
}

.discussion-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discussion-card {
  cursor: pointer;
}

.discussion-item {
  padding: 8px;
}

.discussion-item h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.discussion-meta {
  font-size: 13px;
  color: #718096;
  margin-bottom: 8px;
}

.discussion-preview {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reply-count {
  font-size: 13px;
  color: #667eea;
}

.group-section {
  padding: 20px;
}

.group-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.group-info {
  margin-bottom: 24px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-header h4 {
  font-size: 18px;
  font-weight: 600;
}

.group-code {
  font-size: 13px;
  color: #667eea;
  font-family: monospace;
}

.group-members h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.leader-badge {
  font-size: 11px;
  color: #d46b08;
  background: #fff7e6;
  padding: 2px 8px;
  border-radius: 10px;
}

.group-questions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  padding: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-header h4 {
  font-size: 15px;
  font-weight: 600;
}

.question-text {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
}

.question-deadline {
  font-size: 13px;
  color: #718096;
  margin-bottom: 16px;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-group {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.create-group-card, .search-student-card {
  padding: 20px;
}

.create-group-card h3, .search-student-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.search-input {
  margin-bottom: 16px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.student-id {
  flex: 1;
  font-size: 13px;
  color: #718096;
}

.classroom-section {
  padding: 20px;
}

.classroom-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-card {
  padding: 16px;
  transition: all 0.3s;
}

.schedule-card.active {
  border: 2px solid #667eea;
  background: #f5f7ff;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.schedule-header h4 {
  font-size: 15px;
  font-weight: 600;
}

.current-tag {
  font-size: 12px;
  color: #667eea;
  background: #e6f7ff;
  padding: 4px 12px;
  border-radius: 20px;
}

.location {
  font-size: 13px;
  color: #718096;
}

.class-actions {
  margin-top: 16px;
}

.no-class {
  margin-top: 16px;
}

.no-class-text {
  text-align: center;
  color: #718096;
  padding: 20px;
}

.group-name-input {
  margin-bottom: 16px;
}

.group-tip {
  font-size: 13px;
  color: #718096;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .video-item, .document-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .video-thumbnail {
    width: 100%;
    height: 120px;
  }
}
</style>
