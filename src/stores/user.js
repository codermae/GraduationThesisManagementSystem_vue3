import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  }),

  getters: {
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student',
    userInfo: (state) => state.user
  },

  actions: {
    async login(credentials) {
      try {
        // const response = await api.post('/auth/login', credentials)
        // const { data } = response.data
        const  data  = await api.post('/auth/login', credentials)

        this.token = data.token
        this.user = {
          userId: data.userId,
          name: data.name,
          role: data.role,
          className: data.className,
          major: data.major,
          department: data.department
        }
        this.isAuthenticated = true
        
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return data
      } catch (error) {
        throw new Error(error.response?.data?.message || '登录失败')
      }
    },

    async register(userData) {
      try {
        await api.post('/auth/register', userData)
      } catch (error) {
        throw new Error(error.response?.data?.message || '注册失败')
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.clearUserData()
      }
    },

    async checkAuthStatus() {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        try {
          // 验证 token 是否有效
          await api.get('/auth/validate')
          this.token = savedToken
          this.user = JSON.parse(savedUser)
          this.isAuthenticated = true
        } catch (error) {
          this.clearUserData()
        }
      }
    },

    clearUserData() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    updateUserInfo(userInfo) {
      this.user = { ...this.user, ...userInfo }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  }
})