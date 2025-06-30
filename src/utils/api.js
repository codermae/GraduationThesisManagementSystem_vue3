// utils/api.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 优先从 Pinia store 获取 token，fallback 到 localStorage
    const userStore = useUserStore()
    const token = userStore.token || localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    console.log('==============响应拦截器=============');
    console.log(response.data);
    console.log('====================================');
    if (response.config.responseType === 'blob') {
      return response.data
    }
    if (code === 200) {
      // 返回 data 部分，简化组件中的使用
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          {
            ElMessage.error('登录已过期，请重新登录')
            // 使用 Pinia store 的 logout 方法
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
            break
          }
        case 403:
          console.log('====================================');
          console.log(response);
          console.log('====================================');
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default api