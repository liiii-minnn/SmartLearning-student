<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useCourseStore } from '../../stores/courseStore'
import { ElCard, ElButton, ElInput, ElDialog, ElTable, ElTableColumn, ElMessage } from 'element-plus'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const courseStore = useCourseStore()

const showCreateGroup = ref(false)
const groupName = ref('')
const selectedCourseId = ref(1)

onMounted(() => {
  notificationStore.initMockData()
})

const currentUserGroup = computed(() => {
  const userId = authStore.user?.id
  if (!userId) return null
  return notificationStore.groups.find(g => g.members.includes(userId))
})

const courses = computed(() => courseStore.courses)

function createGroup() {
  if (!groupName.value.trim()) {
    ElMessage.warning('请输入小组名称')
    return
  }
  
  if (!selectedCourseId.value) {
    ElMessage.warning('请选择课程')
    return
  }
  
  notificationStore.createGroup(groupName.value, selectedCourseId.value, authStore.user?.id || 0)
  
  showCreateGroup.value = false
  groupName.value = ''
  ElMessage.success('小组创建成功')
}

function applyToGroup(groupId: number) {
  notificationStore.applyToGroup(groupId, authStore.user?.id || 0)
  ElMessage.success('申请已发送，请等待组长同意')
}

const availableGroups = computed(() => {
  const userId = authStore.user?.id
  if (!userId) return []
  return notificationStore.groups.filter(g => !g.members.includes(userId))
})
</script>

<template>
  <div class="groups-page">
    <div class="page-header">
      <h1>小组教学</h1>
    </div>

    <div v-if="!currentUserGroup" class="no-group">
      <ElCard class="create-card">
        <h3>您还没有加入任何小组</h3>
        <p>您可以创建新小组或加入其他小组</p>
        <div class="actions">
          <ElButton type="primary" @click="showCreateGroup = true">创建小组</ElButton>
        </div>
      </ElCard>

      <ElCard class="join-card">
        <h3>加入已有小组</h3>
        <div v-if="availableGroups.length > 0">
          <div v-for="group in availableGroups" :key="group.id" class="group-item">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-code">小组码：{{ group.code }}</span>
              <span class="member-count">成员数：{{ group.members.length }}/5</span>
            </div>
            <ElButton type="primary" size="small" @click="applyToGroup(group.id)">
              申请加入
            </ElButton>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无可用小组，您可以创建一个新小组</p>
        </div>
      </ElCard>
    </div>

    <div v-else class="has-group">
      <ElCard class="group-info">
        <h3>我的小组</h3>
        <div class="group-details">
          <div class="detail-item">
            <span class="label">小组名称</span>
            <span class="value">{{ currentUserGroup.name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">小组码</span>
            <span class="value group-code">{{ currentUserGroup.code }}</span>
          </div>
          <div class="detail-item">
            <span class="label">所属课程</span>
            <span class="value">{{ courses.find(c => c.id === currentUserGroup?.courseId)?.name || '未知' }}</span>
          </div>
        </div>
        
        <h4>小组成员</h4>
        <ElTable :data="currentUserGroup?.members.map(id => ({ id, name: id === currentUserGroup?.leaderId ? '组长' : '成员' }))" border>
          <ElTableColumn prop="name" label="角色" />
        </ElTable>
      </ElCard>
    </div>

    <ElDialog v-model="showCreateGroup" title="创建小组" @close="groupName = ''">
      <div class="create-form">
        <ElInput
          v-model="groupName"
          placeholder="请输入小组名称"
          class="form-input"
        />
        <ElInput
          v-model="selectedCourseId"
          type="select"
          placeholder="请选择课程"
          class="form-input"
        >
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.name }}
          </option>
        </ElInput>
        <p class="tip">小组人数不超过5人</p>
      </div>
      <template #footer>
        <ElButton @click="showCreateGroup = false">取消</ElButton>
        <ElButton type="primary" @click="createGroup">创建</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.groups-page {
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
}

.no-group, .has-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.create-card, .join-card, .group-info {
  border-radius: 12px;
}

.create-card h3, .join-card h3, .group-info h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.create-card p, .join-card p {
  color: #718096;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 12px;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.group-item:last-child {
  border-bottom: none;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-weight: 500;
}

.group-code, .member-count {
  font-size: 12px;
  color: #718096;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #a0aec0;
}

.group-details {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.detail-item .value {
  font-weight: 500;
}

.group-code {
  background: #e6fffa;
  color: #319795;
  padding: 4px 12px;
  border-radius: 8px;
}

.group-info h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: #718096;
}

.create-form {
  padding: 16px 0;
}

.form-input {
  width: 100%;
  margin-bottom: 12px;
}

.tip {
  font-size: 12px;
  color: #718096;
}

@media (max-width: 768px) {
  .no-group, .has-group {
    grid-template-columns: 1fr;
  }
}
</style>