import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, Group, GroupApplication, ClassSchedule, Attendance } from '../types'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const groups = ref<Group[]>([])
  const applications = ref<GroupApplication[]>([])
  const schedules = ref<ClassSchedule[]>([])
  const attendances = ref<Attendance[]>([])
  const scores = ref<Record<number, number>>({})

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function initMockData() {
    if (notifications.value.length === 0) {
      notifications.value = [
        { id: 1, userId: 1, type: 'homework_submit', title: '作业已批改', content: '您的操作系统作业已批改，得分：45/50', read: false, createdAt: '2025-03-15 09:00' },
        { id: 2, userId: 1, type: 'group_application', title: '小组申请通过', content: '您的小组申请已被批准', read: false, createdAt: '2025-03-14 16:30' },
        { id: 3, userId: 1, type: 'system', title: '系统维护通知', content: '系统将于本周日进行维护升级', read: true, createdAt: '2025-03-13 10:00' }
      ]
    }

    if (schedules.value.length === 0) {
      schedules.value = [
        { id: 1, courseId: 1, courseName: '数据结构', weekday: 1, startTime: '08:00', endTime: '09:40', location: '教学楼A-301' },
        { id: 2, courseId: 2, courseName: '操作系统', weekday: 2, startTime: '10:00', endTime: '11:40', location: '教学楼B-205' },
        { id: 3, courseId: 3, courseName: '计算机网络', weekday: 3, startTime: '14:00', endTime: '15:40', location: '实验楼C-102' },
        { id: 4, courseId: 4, courseName: '数据库原理', weekday: 4, startTime: '08:00', endTime: '09:40', location: '教学楼A-301' },
        { id: 5, courseId: 5, courseName: '软件工程', weekday: 5, startTime: '14:00', endTime: '15:40', location: '教学楼B-205' }
      ]
    }
  }

  function getNotifications(userId: number): Notification[] {
    return notifications.value.filter(n => n.userId === userId)
  }

  function markAsRead(notificationId: number) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  function addNotification(notification: Omit<Notification, 'id' | 'read'>) {
    notifications.value.push({
      ...notification,
      id: Date.now(),
      read: false
    })
  }

  function createGroup(name: string, courseId: number, leaderId: number): Group {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase()
    const group: Group = {
      id: Date.now(),
      name,
      courseId,
      leaderId,
      members: [leaderId],
      code
    }
    groups.value.push(group)
    return group
  }

  function getGroupById(groupId: number): Group | undefined {
    return groups.value.find(g => g.id === groupId)
  }

  function getGroupsByCourseId(courseId: number): Group[] {
    return groups.value.filter(g => g.courseId === courseId)
  }

  function getGroupByMemberId(memberId: number): Group | undefined {
    return groups.value.find(g => g.members.includes(memberId))
  }

  function applyToGroup(groupId: number, userId: number) {
    const application: GroupApplication = {
      id: Date.now(),
      groupId,
      userId,
      status: 'pending'
    }
    applications.value.push(application)
    
    const group = getGroupById(groupId)
    if (group) {
      addNotification({
        userId: group.leaderId,
        type: 'group_application',
        title: '新的小组申请',
        content: `用户申请加入您的小组 "${group.name}"`,
        createdAt: new Date().toLocaleString()
      })
    }
  }

  function approveApplication(applicationId: number) {
    const application = applications.value.find(a => a.id === applicationId)
    if (application && application.status === 'pending') {
      application.status = 'approved'
      const group = getGroupById(application.groupId)
      if (group && !group.members.includes(application.userId)) {
        group.members.push(application.userId)
      }
    }
  }

  function getTodaySchedule(): ClassSchedule[] {
    const today = new Date().getDay() || 7
    const weekday = today // 周日为7，转换为1-7
    return schedules.value.filter(s => s.weekday === weekday)
  }

  function getCurrentClass(): ClassSchedule | null {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    for (const schedule of schedules.value) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number)
      const [endHour, endMin] = schedule.endTime.split(':').map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      if (currentTime >= startTime && currentTime <= endTime) {
        return schedule
      }
    }
    return null
  }

  function recordAttendance(userId: number, courseId: number) {
    const today = new Date().toISOString().split('T')[0]
    const existing = attendances.value.find(
      a => a.userId === userId && a.courseId === courseId && a.date === today
    )
    if (!existing) {
      attendances.value.push({ userId, courseId, date: today, attended: true })
    }
  }

  function addScore(courseId: number, points: number) {
    scores.value[courseId] = (scores.value[courseId] || 0) + points
  }

  function getScore(courseId: number): number {
    return scores.value[courseId] || 0
  }

  return {
    notifications,
    groups,
    applications,
    schedules,
    attendances,
    scores,
    unreadCount,
    initMockData,
    getNotifications,
    markAsRead,
    addNotification,
    createGroup,
    getGroupById,
    getGroupsByCourseId,
    getGroupByMemberId,
    applyToGroup,
    approveApplication,
    getTodaySchedule,
    getCurrentClass,
    recordAttendance,
    addScore,
    getScore
  }
})
