// api/files.js
import api from '@/utils/api'

// 文件分页查询
export const getFilesPage = (data) => {
  return api.post('/files/page', data)
}

// 文件上传
export const uploadFile = (formData) => {
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询学生文件
export const getStudentFiles = (studentId) => {
  return api.get(`/files/student/${studentId}`)
}

// 获取文件统计
export const getFilesStatistics = () => {
  return api.get('/files/statistics')
}

// 获取学生文件统计
export const getStudentFilesStatistics = (studentId) => {
  return api.get(`/files/statistics/${studentId}`)
}

// 文件下载
export const downloadFile = (fileId) => {
  return api.get(`/files/download/${fileId}`, {
    responseType: 'blob'
  })
}

// 删除文件
export const deleteFile = (fileId) => {
  return api.delete(`/files/${fileId}`)
}

// 批量删除文件
export const batchDeleteFiles = (data) => {
  return api.delete('/files/batch', { data })
}

// 老师查看所有指导学生的文件统计
export const getMyStudentFilesAll = () => {
  return api.get('/files/teacher/my-students/files')
}

// 老师查看指定学生的文件列表（按类别分组）
export const getMystudentFilesCat = (studentId) => {
  return api.get(`/files/teacher/student/${studentId}/files`)
}