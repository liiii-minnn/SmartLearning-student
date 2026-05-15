<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { ElTable, ElTableColumn, ElButton, ElCard } from 'element-plus'

const router = useRouter()
const courseStore = useCourseStore()

const exams = computed(() => {
  return courseStore.exams.map(exam => {
    const course = courseStore.courses.find(c => c.id === exam.courseId)
    return {
      ...exam,
      courseName: course?.name || '未知课程',
      courseId: exam.courseId
    }
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
})

function goToExam(examId: number) {
  router.push(`/student/exam/${examId}`)
}

function goToCourse(courseId: number) {
  router.push(`/student/course/${courseId}`)
}
</script>

<template>
  <div class="exams-page">
    <div class="page-header">
      <h1>作业考试</h1>
      <p>共 {{ exams.length }} 项作业/考试</p>
    </div>

    <ElCard class="exams-card">
      <ElTable :data="exams" border :row-key="'id'">
        <ElTableColumn prop="courseName" label="课程" min-width="150">
          <template #default="scope">
            <span class="course-link" @click="goToCourse(scope.row.courseId)">
              {{ scope.row.courseName }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="名称" min-width="200" />
        <ElTableColumn prop="type" label="类型" min-width="80">
          <template #default="scope">
            <span :class="['type-tag', scope.row.type]">
              {{ scope.row.type === 'exam' ? '考试' : '作业' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="dueDate" label="截止时间" min-width="120" />
        <ElTableColumn prop="totalScore" label="总分" min-width="80" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <span :class="['status-tag', scope.row.status]">
              {{ scope.row.status === 'completed' ? '已完成' : scope.row.status === 'submitted' ? '待批阅' : '未完成' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" min-width="100">
          <template #default="scope">
            <ElButton type="primary" size="small" @click="goToExam(scope.row.id)">
              开始作答
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.exams-page {
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

.exams-card {
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

.type-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.type-tag.exam {
  background: #fed7d7;
  color: #742a2a;
}

.type-tag.homework {
  background: #ebf8ff;
  color: #2c5282;
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
  background: #e2e8f0;
  color: #4a5568;
}
</style>