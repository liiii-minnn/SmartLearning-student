import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/ForgotPassword.vue')
    },
    {
      path: '/student',
      name: 'Student',
      component: () => import('../components/StudentLayout.vue'),
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: 'dashboard',
          name: 'StudentDashboard',
          component: () => import('../views/student/Dashboard.vue')
        },
        {
          path: 'tasks',
          name: 'StudentTasks',
          component: () => import('../views/student/Tasks.vue')
        },
        {
          path: 'discussions',
          name: 'StudentDiscussions',
          component: () => import('../views/student/Discussions.vue')
        },
        {
          path: 'exams',
          name: 'StudentExams',
          component: () => import('../views/student/Exams.vue')
        },
        {
          path: 'groups',
          name: 'StudentGroups',
          component: () => import('../views/student/Groups.vue')
        },
        {
          path: 'classroom',
          name: 'StudentClassroom',
          component: () => import('../views/student/Classroom.vue')
        },
        {
          path: 'course/:courseId',
          name: 'StudentCourseDetail',
          component: () => import('../views/student/CourseDetail.vue')
        },
        {
          path: 'task/:taskId',
          name: 'StudentTaskDetail',
          component: () => import('../views/student/TaskDetail.vue')
        },
        {
          path: 'exam/:examId',
          name: 'StudentExam',
          component: () => import('../views/student/Exam.vue')
        },
        {
          path: 'discussion/:discussionId',
          name: 'StudentDiscussion',
          component: () => import('../views/student/DiscussionDetail.vue')
        }
      ]
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teacher',
      name: 'Teacher',
      component: () => import('../views/Teacher.vue'),
      meta: { requiresAuth: true, role: 'teacher' }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/textbook',
      name: 'Textbook',
      component: () => import('../views/Textbook.vue')
    },
    {
      path: '/schools',
      name: 'Schools',
      component: () => import('../views/Schools.vue')
    },
    {
      path: '/question-bank',
      name: 'QuestionBank',
      component: () => import('../views/QuestionBank.vue')
    },
    {
      path: '/practice',
      name: 'Practice',
      component: () => import('../views/Practice.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    authStore.loadFromStorage()
    
    if (!authStore.isLoggedIn) {
      next('/login')
      return
    }
    
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      if (authStore.isStudent) {
        next('/student/dashboard')
      } else if (authStore.isTeacher) {
        next('/teacher')
      } else if (authStore.isAdmin) {
        next('/admin')
      } else {
        next('/login')
      }
      return
    }
  }
  
  next()
})

export default router
