// api/topics.js
import api from '@/utils/api'

// 获取选题分页
export const getTopicsPage = (params) => {
  return api.get('/topics', { params })
}

// 创建选题
export const createTopic = (data) => {
  return api.post('/topics', data)
}

// 更新选题
export const updateTopic = (data) => {
  return api.put('/topics', data)
}

// 获取选题详情
export const getTopicDetail = (topicId) => {
  return api.get(`/topics/${topicId}`)
}

// 删除选题
export const deleteTopic = (topicId) => {
  return api.delete(`/topics/${topicId}`)
}

// 学生选题
export const selectTopic = (data) => {
  return api.post('/topics/select', data)
}

// 取消选题
export const cancelSelectTopic = (data) => {
  return api.delete('/topics/select', { data })
}

// 获取某选题的选题记录
export const getTopicSelections = (topicId) => {
  return api.get(`/topics/${topicId}/selections`)
}

// 获取某教师的选题
export const getTeacherTopics = (teacherId) => {
  return api.get(`/topics/teacher/${teacherId}`)
}

// 获取我的选题（教师发布的选题）
export const getMyTopics = () => {
  return api.get('/topics/my-topics')
}

// 获取我的学生选题
export const getMyStudentsTopics = () => {
  return api.get('/topics/my-students')
}

// 获取我的选题记录（学生已选的题目）
export const getMySelectedTopic = () => {
  return api.get('/topics/my-selection')
}