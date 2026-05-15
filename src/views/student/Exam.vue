<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../../stores/courseStore';
import { ElMessage, ElButton, ElRadio, ElRadioGroup, ElCheckboxGroup, ElCheckbox, ElInput, ElUpload, ElCard } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();

const examId = computed(() => Number(route.params.examId));
const exam = computed(() => courseStore.getExamById(examId.value));

const singleAnswers = ref<Record<number, number | undefined>>({});
const multipleAnswers = ref<Record<number, number[]>>({});
const essayAnswers = ref<Record<number, string>>({});

const timeRemaining = ref(0);
const screenWarnCount = ref(0);
const maxScreenWarn = 3;
const isSubmitted = ref(false);
const isAutoSubmit = ref(false);

let timer: number | null = null;

const isExam = computed(() => exam.value?.type === 'exam');

function initAnswers() {
  if (!exam.value) return;
  exam.value.questions.forEach(q => {
    if (q.type === 'essay') {
      essayAnswers.value[q.id] = '';
    } else if (q.type === 'multiple') {
      multipleAnswers.value[q.id] = [];
    } else {
      singleAnswers.value[q.id] = undefined;
    }
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function handleVisibilityChange() {
  if (document.hidden && isExam.value && !isSubmitted.value) {
    screenWarnCount.value++;
    ElMessage.warning(`检测到切屏！第 ${screenWarnCount.value}/${maxScreenWarn} 次警告`);
    if (screenWarnCount.value >= maxScreenWarn) {
      ElMessage.error('切屏超过3次，自动交卷');
      submitExam(true);
    }
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

function submitExam(auto = false) {
  if (isSubmitted.value) return;
  
  isSubmitted.value = true;
  isAutoSubmit.value = auto;
  
  if (timer) {
    clearInterval(timer);
  }
  
  if (exam.value) {
    courseStore.submitExam(exam.value.id);
  }
  
  let correctCount = 0;
  let totalQuestions = 0;
  
  exam.value?.questions.forEach(q => {
    if (q.type === 'essay') return;
    
    totalQuestions++;
    let userAnswer: number[] = [];
    
    if (q.type === 'multiple') {
      userAnswer = multipleAnswers.value[q.id] || [];
    } else {
      const single = singleAnswers.value[q.id];
      if (single !== undefined) {
        userAnswer = [single];
      }
    }
    
    const correctAnswer = q.answer as number[];
    if (arraysEqual(userAnswer.sort(), correctAnswer.sort())) {
      correctCount++;
    }
  });
  
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  
  if (auto) {
    ElMessage.info(`考试已自动提交！客观题正确率：${accuracy}%`);
  } else {
    ElMessage.success(`提交成功！客观题正确率：${accuracy}%`);
  }
}

function handleSubmit() {
  if (confirm('确定要提交吗？提交后无法修改')) {
    submitExam(false);
  }
}

onMounted(() => {
  if (!exam.value) {
    router.push('/student/dashboard');
    return;
  }
  
  initAnswers();
  
  if (isExam.value) {
    timeRemaining.value = exam.value.duration * 60;
    timer = window.setInterval(() => {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) {
        submitExam(true);
      }
    }, 1000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div v-if="exam" class="exam-page">
      <div class="exam-header">
        <div class="header-left">
          <h1>{{ exam.name }}</h1>
          <p>{{ exam.type === 'exam' ? '考试' : '作业' }} · 总分：{{ exam.totalScore }}分</p>
        </div>
        <div v-if="isExam" class="header-right">
          <div class="timer" :class="{ warning: timeRemaining < 300 }">
            ⏱️ {{ formatTime(timeRemaining) }}
          </div>
        </div>
      </div>

      <ElCard class="exam-card">
        <div v-if="isExam && !isSubmitted" class="exam-warning">
          <p>⚠️ 考试期间请不要切换页面，切屏超过{{ maxScreenWarn }}次将自动交卷</p>
          <p>已警告次数：{{ screenWarnCount }}/{{ maxScreenWarn }}</p>
        </div>

        <div v-if="isSubmitted" class="submitted-info">
          <div class="submitted-icon">{{ isAutoSubmit ? '⏰' : '✅' }}</div>
          <h2>{{ isAutoSubmit ? '考试已自动提交' : '提交成功' }}</h2>
          <p>感谢您的作答，成绩将在批改后公布</p>
          <ElButton type="primary" @click="router.push('/student/course/1')">返回课程</ElButton>
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(question, index) in exam.questions"
            :key="question.id"
            class="question-item"
          >
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <span class="question-type">{{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : question.type === 'judge' ? '判断题' : '主观题' }}</span>
              <span class="question-score">（{{ question.score }}分）</span>
            </div>
            <p class="question-text">{{ question.question }}</p>

            <div v-if="question.type === 'single'" class="question-options">
              <ElRadioGroup v-model="singleAnswers[question.id]">
                <ElRadio
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  :label="optIndex"
                >
                  {{ option }}
                </ElRadio>
              </ElRadioGroup>
            </div>

            <div v-else-if="question.type === 'multiple'" class="question-options">
              <ElCheckboxGroup v-model="multipleAnswers[question.id]">
                <ElCheckbox
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  :label="optIndex"
                >
                  {{ option }}
                </ElCheckbox>
              </ElCheckboxGroup>
            </div>

            <div v-else-if="question.type === 'judge'" class="question-options">
              <ElRadioGroup v-model="singleAnswers[question.id]">
                <ElRadio :label="0">正确</ElRadio>
                <ElRadio :label="1">错误</ElRadio>
              </ElRadioGroup>
            </div>

            <div v-else class="essay-section">
              <ElInput
                v-model="essayAnswers[question.id]"
                type="textarea"
                placeholder="请输入你的答案..."
                :rows="6"
                class="essay-input"
              />
              <div class="essay-upload">
                <ElUpload action="" :auto-upload="false">
                  <ElButton>上传附件</ElButton>
                </ElUpload>
              </div>
            </div>
          </div>

          <div class="submit-section">
            <ElButton
              type="primary"
              class="submit-btn"
              @click="handleSubmit"
            >
              提交{{ exam.type === 'exam' ? '试卷' : '作业' }}
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>
</template>

<style scoped>
.exam-page {
  min-height: 100%;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.header-left h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.header-left p {
  font-size: 14px;
  color: #718096;
}

.timer {
  font-size: 20px;
  font-weight: 600;
  color: #667eea;
  padding: 8px 16px;
  background: #f5f7ff;
  border-radius: 8px;
}

.timer.warning {
  color: #cf1322;
  background: #fff1f0;
}

.exam-card {
  max-width: 800px;
  margin: 0 auto;
}

.exam-warning {
  padding: 16px;
  background: #fff7e6;
  border-radius: 8px;
  margin-bottom: 20px;
}

.exam-warning p {
  font-size: 14px;
  color: #d46b08;
  margin: 4px 0;
}

.submitted-info {
  text-align: center;
  padding: 40px;
}

.submitted-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.submitted-info h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.submitted-info p {
  color: #718096;
  margin-bottom: 24px;
}

.questions-list {
  padding: 16px 0;
}

.question-item {
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
}

.question-type {
  font-size: 13px;
  color: #667eea;
  padding: 2px 8px;
  background: #e6f7ff;
  border-radius: 4px;
}

.question-score {
  font-size: 13px;
  color: #718096;
}

.question-text {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.essay-section {
  margin-top: 8px;
}

.essay-input {
  width: 100%;
  margin-bottom: 12px;
}

.essay-upload {
  margin-top: 8px;
}

.submit-section {
  text-align: center;
  margin-top: 24px;
}

.submit-btn {
  padding: 12px 48px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .exam-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .timer {
    font-size: 16px;
  }
}
</style>
