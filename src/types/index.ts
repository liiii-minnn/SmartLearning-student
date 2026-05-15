export interface User {
  id: number
  account: string
  email: string
  phone: string
  password: string
  role: 'student' | 'teacher' | 'admin'
  name: string
  lastPwdChange?: string
}

export interface Course {
  id: number
  name: string
  teacher: string
  cover: string
  progress: number
  description: string
  credits: number
  hours: number
  semester: string
}

export interface VideoResource {
  id: number
  courseId: number
  title: string
  duration: number
  quizPoints: number[]
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: number
  timePoint: number
  type: 'single' | 'multiple'
  question: string
  options: string[]
  answer: number[]
}

export interface Task {
  id: number
  courseId: number
  name: string
  deadline: string
  status: 'pending' | 'submitted' | 'graded'
  description: string
  attachments: string[]
}

export interface Discussion {
  id: number
  courseId: number
  title: string
  author: string
  authorRole: 'teacher' | 'student'
  createdAt: string
  content: string
  replies: Reply[]
  participantCount: number
}

export interface Reply {
  id: number
  author: string
  content: string
  createdAt: string
}

export interface Exam {
  id: number
  courseId: number
  name: string
  type: 'homework' | 'exam'
  deadline: string
  totalScore: number
  duration: number
  status: 'pending' | 'submitted' | 'graded'
  questions: ExamQuestion[]
}

export interface ExamQuestion {
  id: number
  type: 'single' | 'multiple' | 'judge' | 'essay'
  question: string
  options?: string[]
  answer: number[] | string
  score: number
}

export interface Group {
  id: number
  name: string
  courseId: number
  leaderId: number
  members: number[]
  code: string
}

export interface GroupApplication {
  id: number
  groupId: number
  userId: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface Notification {
  id: number
  userId: number
  type: 'group_application' | 'homework_submit' | 'grade' | 'system'
  title: string
  content: string
  read: boolean
  createdAt: string
}

export interface Attendance {
  userId: number
  courseId: number
  date: string
  attended: boolean
}

export interface ClassSchedule {
  id: number
  courseId: number
  courseName: string
  weekday: number
  startTime: string
  endTime: string
  location: string
}

export interface StudyLog {
  userId: number
  videoId: number
  watchedDuration: number
  quizResults: QuizResult[]
  completed: boolean
}

export interface QuizResult {
  questionId: number
  timePoint: number
  userAnswer: number[]
  correct: boolean
}
