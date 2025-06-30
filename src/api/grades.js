// api/grade.js
import api from '@/utils/api'

// 论文打分
export const scoreThesis = (data) => {
  return api.post('/grade/thesis/score', data)
}

// 答辩打分
export const scoreDefense = (data) => {
  return api.post('/grade/defense/score', data)
}

// 批量论文打分
export const batchScoreThesis = (data) => {
  return api.post('/grade/thesis/batch-score', data)
}

// 批量答辩打分
export const batchScoreDefense = (data) => {
  return api.post('/grade/defense/batch-score', data)
}

// 查询学生成绩
export const getGradeList = (data) => {
  return api.post('/grade/list', data)
}

// 获取论文成绩
export const getThesisGrade = (studentId) => {
  return api.get(`/grade/thesis/${studentId}`)
}

// 获取答辩成绩
export const getDefenseGrade = (studentId) => {
  return api.get(`/grade/defense/${studentId}`)
}

// 获取最终成绩
export const getFinalGrade = (studentId) => {
  return api.get(`/grade/final/${studentId}`)
}

// 获取学生成绩详情
export const getGradeDetail = (studentId) => {
  return api.get(`/grade/detail/${studentId}`)
}

// 计算最终成绩（单个）
export const calculateFinalGrade = (studentId) => {
  return api.post(`/grade/final/calculate/${studentId}`)
}

// 批量计算最终成绩
export const batchCalculateFinalGrade = (data) => {
  return api.post('/grade/final/batch-calculate', data)
}

// 获取成绩统计
export const getGradeStatistics = () => {
  return api.get('/grade/statistics')
}

// 分析成绩
export const analyzeGrade = () => {
  return api.get('/grade/analyze')
}

// 导出成绩
export const exportGrade = (data) => {
  return api.post('/grade/export', data, {
    responseType: 'blob'
  })
}