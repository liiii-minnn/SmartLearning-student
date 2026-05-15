<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCourseStore } from '../stores/courseStore'
import { ElMessage, ElButton, ElRadio, ElRadioGroup, ElCheckboxGroup, ElCheckbox } from 'element-plus'

const props = defineProps<{
  video: any
}>()

const emit = defineEmits<{
  close: []
}>()

const courseStore = useCourseStore()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const showQuiz = ref(false)
const currentQuestion = ref<any>(null)
const answeredQuestions = ref<Set<number>>(new Set())
const quizResults = ref<{ questionId: number; correct: boolean }[]>([])

const selectedSingleAnswer = ref<number | undefined>(undefined)
const selectedMultipleAnswers = ref<number[]>([])

function getSelectedAnswers(): number[] {
  if (currentQuestion.value?.type === 'single') {
    return selectedSingleAnswer.value !== undefined ? [selectedSingleAnswer.value] : []
  }
  return selectedMultipleAnswers.value
}

function clearAnswers() {
  selectedSingleAnswer.value = undefined
  selectedMultipleAnswers.value = []
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    
    const questions = props.video.questions || []
    for (const question of questions) {
      if (
        !answeredQuestions.value.has(question.id) &&
        Math.abs(currentTime.value - question.timePoint) < 1
      ) {
        answeredQuestions.value.add(question.id)
        showQuestion(question)
        break
      }
    }
  }
}

function showQuestion(question: any) {
  currentQuestion.value = question
  clearAnswers()
  showQuiz.value = true
  if (videoRef.value) {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

function submitAnswer() {
  if (!currentQuestion.value) return
  
  const correct = arraysEqual(getSelectedAnswers().sort(), currentQuestion.value.answer.sort())
  quizResults.value.push({
    questionId: currentQuestion.value.id,
    correct
  })
  
  if (correct) {
    ElMessage.success('回答正确！')
  } else {
    ElMessage.error('回答错误，正确答案是：' + currentQuestion.value.answer.map((idx: number) => currentQuestion.value.options[idx]).join(', '))
  }
  
  showQuiz.value = false
  currentQuestion.value = null
  
  if (videoRef.value) {
    videoRef.value.play()
    isPlaying.value = true
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val === b[idx])
}

function handleVideoEnd() {
  isPlaying.value = false
  const total = quizResults.value.length
  const correct = quizResults.value.filter(r => r.correct).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  ElMessage.info(`视频播放完成！本次答题正确率：${accuracy}%`)
  
  courseStore.addStudyLog({
    userId: 1,
    videoId: props.video.id,
    watchedDuration: duration.value,
    quizResults: quizResults.value.map(r => ({
      questionId: r.questionId,
      timePoint: props.video.questions.find((q: any) => q.id === r.questionId)?.timePoint || 0,
      userAnswer: [],
      correct: r.correct
    })),
    completed: true
  })
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

function closePlayer() {
  emit('close')
}

onMounted(() => {
  answeredQuestions.value = new Set()
  quizResults.value = []
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <div class="video-player">
    <div class="video-container">
      <video
        ref="videoRef"
        @timeupdate="handleTimeUpdate"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="handleVideoEnd"
        @loadedmetadata="handleLoadedMetadata"
        class="video-element"
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      
      <div class="video-controls" :class="{ hidden: isPlaying }">
        <button class="play-btn" @click="togglePlay">
          <span class="play-icon">▶</span>
        </button>
      </div>
      
      <div class="progress-bar" @click="(e) => { if (videoRef) videoRef.currentTime = (e.offsetX / (e.currentTarget as HTMLElement).offsetWidth) * duration }">
        <div class="progress-fill" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
        <div
          v-for="q in video.questions"
          :key="q.id"
          class="quiz-marker"
          :style="{ left: `${(q.timePoint / duration) * 100}%` }"
          :title="`${formatTime(q.timePoint)} 有问题`"
        ></div>
      </div>
      
      <div class="time-display">
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      
      <button class="close-btn" @click="closePlayer">✕</button>
    </div>
    
    <div class="video-info">
      <h3>{{ video.title }}</h3>
      <div class="info-row">
        <span>时长：{{ formatTime(video.duration) }}</span>
        <span>弹题数：{{ video.questions.length }}道</span>
      </div>
    </div>

    <ElButton v-if="!isPlaying" type="primary" @click="togglePlay" class="play-button">
      {{ currentTime > 0 ? '继续播放' : '开始播放' }}
    </ElButton>

    <div v-if="showQuiz" class="quiz-overlay">
      <div class="quiz-modal">
        <div class="quiz-header">
          <h4>课堂测验</h4>
          <span class="quiz-time">{{ formatTime(currentQuestion?.timePoint || 0) }}</span>
        </div>
        <div class="quiz-content">
          <p class="quiz-question">{{ currentQuestion?.question }}</p>
          
          <div v-if="currentQuestion?.type === 'single'" class="quiz-options">
            <ElRadioGroup v-model="selectedSingleAnswer">
              <ElRadio
                v-for="(option, index) in currentQuestion?.options"
                :key="index"
                :label="index"
              >
                {{ option }}
              </ElRadio>
            </ElRadioGroup>
          </div>
          
          <div v-else class="quiz-options">
            <ElCheckboxGroup v-model="selectedMultipleAnswers">
              <ElCheckbox
                v-for="(option, index) in currentQuestion?.options"
                :key="index"
                :label="index"
              >
                {{ option }}
              </ElCheckbox>
            </ElCheckboxGroup>
          </div>
        </div>
        <div class="quiz-footer">
          <ElButton @click="showQuiz = false">跳过</ElButton>
          <ElButton type="primary" :disabled="getSelectedAnswers().length === 0" @click="submitAnswer">
            提交答案
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player {
  width: 100%;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.video-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.video-controls.hidden {
  opacity: 0;
  pointer-events: none;
}

.play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 32px;
  color: white;
  margin-left: 4px;
}

.progress-bar {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: #667eea;
  border-radius: 3px;
  transition: width 0.1s;
}

.quiz-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid white;
}

.time-display {
  position: absolute;
  bottom: 8px;
  right: 20px;
  color: white;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.video-info {
  margin-top: 16px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.video-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #718096;
}

.play-button {
  margin-top: 16px;
  width: 100%;
}

.quiz-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.quiz-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #667eea;
  color: white;
}

.quiz-header h4 {
  font-size: 16px;
  font-weight: 600;
}

.quiz-time {
  font-size: 13px;
  opacity: 0.9;
}

.quiz-content {
  padding: 20px;
}

.quiz-question {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1a202c;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quiz-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .video-element {
    height: 250px;
  }
  
  .progress-bar {
    bottom: 24px;
    left: 12px;
    right: 12px;
  }
  
  .quiz-modal {
    margin: 12px;
  }
}
</style>
