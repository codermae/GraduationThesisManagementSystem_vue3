// api/user.js
import api from '@/utils/api'

// 更新教师信息
export const updateTeacherInfo = (data) => {
  return api.put('/user/teacher', data)
}

// 更新学生信息
export const updateStudentInfo = (data) => {
  return api.put('/user/student', data)
}

// 获取教师信息
export const getTeacherInfo = (teacherId) => {
  return api.get(`/user/teacher/${teacherId}`)
}

// 获取学生信息
export const getStudentInfo = (studentId) => {
  return api.get(`/user/student/${studentId}`)
}

// 修改密码
export const changePassword = (data) => {
  return api.put('/user/change-password',data)
}