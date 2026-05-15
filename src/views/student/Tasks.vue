<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { ElTable, ElTableColumn, ElButton, ElCard } from 'element-plus'

const router = useRouter()
const courseStore = useCourseStore()

const tasks = computed(() => {
  return courseStore.tasks.map(task => {
    const course = courseStore.courses.find(c => c.id === task.courseId)
    return {
      ...task,
      courseName: course?.name || '未知课程',
      courseId: task.courseId
    }
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
})

function goToTask(taskId: number) {
  router.push(`/student/task/${taskId}`)
}

function goToCourse(courseId: number) {
  router.push(`/student/course/${courseId}`)
}
</script>

<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1>学习任务</h1>
      <p>共 {{ tasks.length }} 个任务</p>
    </div>

    <ElCard class="tasks-card">
      <ElTable :data="tasks" border :row-key="'id'">
        <ElTableColumn prop="courseName" label="课程" min-width="150">
          <template #default="scope">
            <span class="course-link" @click="goToCourse(scope.row.courseId)">
              {{ scope.row.courseName }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="任务名称" min-width="200" />
        <ElTableColumn prop="dueDate" label="截止时间" min-width="120" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <span :class="['status-tag', scope.row.status]">
              {{ scope.row.status === 'completed' ? '已完成' : scope.row.status === 'submitted' ? '已提交待批改' : '未完成' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="submissionStatus" label="提交状态" min-width="120" />
        <ElTableColumn label="操作" min-width="100">
          <template #default="scope">
            <ElButton type="primary" size="small" @click="goToTask(scope.row.id)">
              查看详情
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.tasks-page {
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

.tasks-card {
  border-radius: 12px;
}

.course-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.course-link:hover {
  color: #5a6fd6;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.status-tag.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-tag.submitted {
  background: #feebc8;
  color: #744210;
}

.status-tag.pending {
  background: #fed7d7;
  color: #742a2a;
}
</style>