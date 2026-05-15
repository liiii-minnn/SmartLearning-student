import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Course, VideoResource, Task, Discussion, Exam, StudyLog } from '../types'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  const videos = ref<VideoResource[]>([])
  const tasks = ref<Task[]>([])
  const discussions = ref<Discussion[]>([])
  const exams = ref<Exam[]>([])
  const studyLogs = ref<StudyLog[]>([])
  const currentSemester = ref('2024-2025第一学期')
  const searchKeyword = ref('')

  const semesters = ['2024-2025第一学期', '2023-2024第二学期', '2023-2024第一学期']

  const filteredCourses = computed(() => {
    return courses.value.filter(course => {
      const matchSemester = course.semester === currentSemester.value
      const matchKeyword = searchKeyword.value 
        ? course.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        : true
      return matchSemester && matchKeyword
    })
  })

  function initMockData() {
    if (courses.value.length === 0) {
      courses.value = [
        { id: 1, name: '数据结构', teacher: '李老师', cover: 'https://picsum.photos/seed/ds/400/300', progress: 65, description: '学习各种数据结构及其操作', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 2, name: '操作系统', teacher: '王老师', cover: 'https://picsum.photos/seed/os/400/300', progress: 40, description: '操作系统原理与实现', credits: 4, hours: 64, semester: '2024-2025第一学期' },
        { id: 3, name: '计算机网络', teacher: '张老师', cover: 'https://picsum.photos/seed/cn/400/300', progress: 80, description: '网络协议与通信原理', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 4, name: '数据库原理', teacher: '刘老师', cover: 'https://picsum.photos/seed/db/400/300', progress: 30, description: '数据库设计与SQL', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 5, name: '软件工程', teacher: '陈老师', cover: 'https://picsum.photos/seed/se/400/300', progress: 55, description: '软件开发方法与实践', credits: 4, hours: 64, semester: '2024-2025第一学期' },
        { id: 6, name: '人工智能', teacher: '赵老师', cover: 'https://picsum.photos/seed/ai/400/300', progress: 20, description: 'AI基础与机器学习', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 7, name: '编译原理', teacher: '孙老师', cover: 'https://picsum.photos/seed/cp/400/300', progress: 70, description: '编译器设计与实现', credits: 4, hours: 64, semester: '2023-2024第二学期' },
        { id: 8, name: '算法设计', teacher: '周老师', cover: 'https://picsum.photos/seed/algo/400/300', progress: 90, description: '经典算法与复杂度分析', credits: 3, hours: 48, semester: '2023-2024第二学期' },
        { id: 9, name: '面向对象设计', teacher: '吴老师', cover: 'https://picsum.photos/seed/oo/400/300', progress: 50, description: 'UML与设计模式', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 10, name: '云计算', teacher: '郑老师', cover: 'https://picsum.photos/seed/cloud/400/300', progress: 15, description: '云平台与分布式系统', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 11, name: '信息安全', teacher: '黄老师', cover: 'https://picsum.photos/seed/sec/400/300', progress: 45, description: '网络安全与加密技术', credits: 3, hours: 48, semester: '2024-2025第一学期' },
        { id: 12, name: '移动开发', teacher: '冯老师', cover: 'https://picsum.photos/seed/mobile/400/300', progress: 25, description: 'iOS与Android开发', credits: 3, hours: 48, semester: '2023-2024第二学期' }
      ]
    }

    if (videos.value.length === 0) {
      videos.value = [
        {
          id: 1,
          courseId: 1,
          title: '第一章：线性表',
          duration: 1200,
          quizPoints: [15, 45, 80],
          questions: [
            { id: 1, timePoint: 15, type: 'single', question: '以下哪种数据结构是线性结构？', options: ['树', '图', '链表', '堆'], answer: [2] },
            { id: 2, timePoint: 45, type: 'single', question: '链表的优势是什么？', options: ['随机访问', '插入删除效率高', '空间连续', '查找速度快'], answer: [1] },
            { id: 3, timePoint: 80, type: 'multiple', question: '以下哪些是线性表的基本操作？', options: ['插入', '删除', '排序', '查找'], answer: [0, 1, 3] }
          ]
        },
        {
          id: 2,
          courseId: 1,
          title: '第二章：栈和队列',
          duration: 900,
          quizPoints: [20, 50],
          questions: [
            { id: 4, timePoint: 20, type: 'single', question: '栈的特点是什么？', options: ['先进先出', '先进后出', '随机访问', '无序存储'], answer: [1] },
            { id: 5, timePoint: 50, type: 'single', question: '队列的特点是什么？', options: ['先进先出', '先进后出', '随机访问', '无序存储'], answer: [0] }
          ]
        },
        {
          id: 3,
          courseId: 2,
          title: '第一章：操作系统概述',
          duration: 1000,
          quizPoints: [30, 60],
          questions: [
            { id: 6, timePoint: 30, type: 'single', question: '操作系统的主要功能不包括？', options: ['进程管理', '内存管理', '用户认证', '文件管理'], answer: [2] },
            { id: 7, timePoint: 60, type: 'multiple', question: '以下哪些是操作系统类型？', options: ['批处理系统', '分时系统', '实时系统', '分布式系统'], answer: [0, 1, 2, 3] }
          ]
        }
      ]
    }

    if (tasks.value.length === 0) {
      tasks.value = [
        { id: 1, courseId: 1, name: '线性表实验报告', deadline: '2025-03-20', status: 'pending', description: '完成线性表的实现与测试', attachments: ['实验指导书.pdf'] },
        { id: 2, courseId: 1, name: '栈和队列作业', deadline: '2025-03-25', status: 'pending', description: '完成课后习题1-5题', attachments: ['作业要求.docx'] },
        { id: 3, courseId: 2, name: '进程管理报告', deadline: '2025-03-18', status: 'submitted', description: '分析进程调度算法', attachments: [] },
        { id: 4, courseId: 3, name: '网络协议分析', deadline: '2025-03-22', status: 'graded', description: '抓包分析HTTP协议', attachments: ['实验报告模板.pdf'] }
      ]
    }

    if (discussions.value.length === 0) {
      discussions.value = [
        {
          id: 1,
          courseId: 1,
          title: '关于链表和数组的讨论',
          author: '李老师',
          authorRole: 'teacher',
          createdAt: '2025-03-10 10:00',
          content: '请大家讨论一下链表和数组各自的优缺点',
          replies: [
            { id: 1, author: '张三', content: '链表插入删除方便，数组访问快', createdAt: '2025-03-10 10:30' },
            { id: 2, author: '李四', content: '数组内存连续，缓存友好', createdAt: '2025-03-10 11:00' }
          ],
          participantCount: 5
        },
        {
          id: 2,
          courseId: 2,
          title: '进程同步问题',
          author: '王老师',
          authorRole: 'teacher',
          createdAt: '2025-03-08 14:00',
          content: '如何解决生产者-消费者问题？',
          replies: [],
          participantCount: 3
        }
      ]
    }

    if (exams.value.length === 0) {
      exams.value = [
        {
          id: 1,
          courseId: 1,
          name: '数据结构期中考试',
          type: 'exam',
          deadline: '2025-04-01',
          totalScore: 100,
          duration: 120,
          status: 'pending',
          questions: [
            { id: 1, type: 'single', question: '数组的时间复杂度', options: ['O(1)', 'O(n)', 'O(logn)', 'O(n^2)'], answer: [0], score: 10 },
            { id: 2, type: 'single', question: '链表删除节点的时间复杂度', options: ['O(1)', 'O(n)', 'O(logn)', 'O(n^2)'], answer: [1], score: 10 },
            { id: 3, type: 'multiple', question: '以下哪些是栈的应用', options: ['括号匹配', '表达式求值', '队列实现', '递归'], answer: [0, 1, 2], score: 15 },
            { id: 4, type: 'judge', question: '队列是先进先出的数据结构', answer: [0], score: 5 },
            { id: 5, type: 'essay', question: '请简述快速排序的原理', answer: '', score: 20 }
          ]
        },
        {
          id: 2,
          courseId: 2,
          name: '操作系统第一次作业',
          type: 'homework',
          deadline: '2025-03-25',
          totalScore: 50,
          duration: 60,
          status: 'pending',
          questions: [
            { id: 6, type: 'single', question: '进程和线程的主要区别', options: ['资源分配', '执行速度', '创建时间', '内存占用'], answer: [0], score: 10 },
            { id: 7, type: 'essay', question: '请描述进程的三种基本状态', answer: '', score: 20 }
          ]
        }
      ]
    }
  }

  function getCourseById(id: number): Course | undefined {
    return courses.value.find(c => c.id === id)
  }

  function getVideosByCourseId(courseId: number): VideoResource[] {
    return videos.value.filter(v => v.courseId === courseId)
  }

  function getTasksByCourseId(courseId: number): Task[] {
    return tasks.value.filter(t => t.courseId === courseId).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  function getTaskById(id: number): Task | undefined {
    return tasks.value.find(t => t.id === id)
  }

  function getDiscussionsByCourseId(courseId: number): Discussion[] {
    return discussions.value.filter(d => d.courseId === courseId)
  }

  function getDiscussionById(id: number): Discussion | undefined {
    return discussions.value.find(d => d.id === id)
  }

  function addDiscussionReply(discussionId: number, content: string, author: string) {
    const discussion = discussions.value.find(d => d.id === discussionId)
    if (discussion) {
      discussion.replies.push({
        id: Date.now(),
        author,
        content,
        createdAt: new Date().toLocaleString()
      })
      discussion.participantCount++
    }
  }

  function getExamsByCourseId(courseId: number): Exam[] {
    return exams.value.filter(e => e.courseId === courseId)
  }

  function getExamById(id: number): Exam | undefined {
    return exams.value.find(e => e.id === id)
  }

  function submitTask(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = 'submitted'
    }
  }

  function submitExam(examId: number) {
    const exam = exams.value.find(e => e.id === examId)
    if (exam) {
      exam.status = 'submitted'
    }
  }

  function addStudyLog(log: StudyLog) {
    studyLogs.value.push(log)
  }

  function updateStudyLog(videoId: number, updates: Partial<StudyLog>) {
    const log = studyLogs.value.find(l => l.videoId === videoId)
    if (log) {
      Object.assign(log, updates)
    }
  }

  return {
    courses,
    videos,
    tasks,
    discussions,
    exams,
    studyLogs,
    currentSemester,
    searchKeyword,
    semesters,
    filteredCourses,
    initMockData,
    getCourseById,
    getVideosByCourseId,
    getTasksByCourseId,
    getTaskById,
    getDiscussionsByCourseId,
    getDiscussionById,
    addDiscussionReply,
    getExamsByCourseId,
    getExamById,
    submitTask,
    submitExam,
    addStudyLog,
    updateStudyLog
  }
})
