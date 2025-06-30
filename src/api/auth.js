// api/auth.js
import api from '@/utils/api'

// 用户注册
export const register = (data) => {
  return api.post('/auth/register', data)
}

// 用户登录
export const login = (data) => {
  return api.post('/auth/login', data)
}

// 刷新令牌
export const refreshToken = () => {
  return api.post('/auth/refresh')
}

// 用户登出
export const logout = () => {
  return api.post('/auth/logout')
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get('/auth/me')
}

// 验证令牌
export const validateToken = () => {
  return api.get('/auth/validate')
}