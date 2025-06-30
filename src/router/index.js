import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/UserLogin.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/UserRegister.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      {
        path: '',
        redirect: '/teacher/dashboard'
      },
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/views/teacher/TeacherDashboard.vue')
      },
      {
        path: 'topics',
        name: 'TeacherTopics',
        component: () => import('@/views/teacher/TeacherTopics.vue')
      },
      {
        path: 'students',
        name: 'TeacherStudents',
        component: () => import('@/views/teacher/TeacherStudents.vue')
      },
      {
        path: 'grades',
        name: 'TeacherGrades',
        component: () => import('@/views/teacher/TeacherGrades.vue')
      },
      {
        path: 'files/:studentId?',
        name: 'TeacherFiles',
        component: () => import('@/views/teacher/TeacherFiles.vue')
      }
    ]
  },
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: '',
        redirect: '/student/dashboard'
      },
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('@/views/student/StudentDashboard.vue')
      },
      {
        path: 'topics',
        name: 'StudentTopics',
        component: () => import('@/views/student/StudentTopics.vue')
      },
      {
        path: 'files',
        name: 'StudentFiles',
        component: () => import('@/views/student/StudentFiles.vue')
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('@/views/student/StudentGrades.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      next('/login')
      return
    }
    
    if (to.meta.role && userStore.user?.role !== to.meta.role) {
      // 角色不匹配，重定向到对应角色的首页
      const redirectPath = userStore.user?.role === 'teacher' ? '/teacher' : '/student'
      next(redirectPath)
      return
    }
  }
  
  next()
})

export default router