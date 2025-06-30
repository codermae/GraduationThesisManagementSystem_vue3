<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>学生工作台</h1>
      <p>欢迎回来，{{ userStore.user?.name }}！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ fileStats.totalFiles }}</h3>
            <p>已上传文件</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ selectedTopic ? '已选题' : '未选题' }}</h3>
            <p>选题状态</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ gradeInfo.finalScore || '--' }}</h3>
            <p>当前成绩</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ selectedTopic?.teacherName || '--' }}</h3>
            <p>指导老师</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 选题信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>我的选题</span>
          </div>
        </template>
        <div v-if="selectedTopic" class="topic-info">
          <h3>{{ selectedTopic.title }}</h3>
          <div class="topic-details">
            <el-tag type="success">{{ selectedTopic.difficulty }}</el-tag>
            <el-tag type="info">{{ selectedTopic.direction }}</el-tag>
            <span class="teacher-info">指导老师：{{ selectedTopic.teacherName }}</span>
          </div>
          <p class="topic-content">{{ selectedTopic.content }}</p>
        </div>
        <div v-else class="no-selection">
          <el-empty description="还未选择题目">
            <el-button type="primary" @click="$router.push('/student/topics')">
              去选题
            </el-button>
          </el-empty>
        </div>
      </el-card>

      <!-- 文件上传状态 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>文件提交状态</span>
            <el-button type="primary" size="small" @click="$router.push('/student/files')">
              管理文件
            </el-button>
          </div>
        </template>
        <div class="file-status">
          <div class="status-item">
            <span class="status-label">开题报告：</span>
            <el-tag :type="getFileStatusType('proposal')">
              {{ getFileStatusText('proposal') }}
            </el-tag>
          </div>
          <div class="status-item">
            <span class="status-label">中期检查：</span>
            <el-tag :type="getFileStatusType('report')">
              {{ getFileStatusText('report') }}
            </el-tag>
          </div>
          <div class="status-item">
            <span class="status-label">毕业论文：</span>
            <el-tag :type="getFileStatusType('thesis')">
              {{ getFileStatusText('thesis') }}
            </el-tag>
          </div>
          <div class="status-item">
            <span class="status-label">答辩PPT：</span>
            <el-tag :type="getFileStatusType('presentation')">
              {{ getFileStatusText('presentation') }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近动态 -->
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <span>最近文件</span>
        </div>
      </template>
      <div v-if="recentFiles.length > 0">
        <div v-for="file in recentFiles" :key="file.fileId" class="activity-item">
          <div class="activity-content">
            <div class="activity-title">{{ file.originalName }}</div>
            <div class="activity-meta">
              <span>{{ file.fileCategoryName }}</span>
              <span>{{ formatDate(file.uploadTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无文件" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Document, Collection, Star, User } from '@element-plus/icons-vue'
import { getMySelectedTopic } from '@/api/topics'
import { getFilesStatistics, getStudentFiles } from '@/api/file'
import { getGradeDetail } from '@/api/grades'
// import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const selectedTopic = ref(null)
const fileStats = ref({
  totalFiles: 0,
  totalSize: 0,
  proposalCount: 0,
  reportCount: 0,
  thesisCount: 0,
  otherCount: 0
})
const gradeInfo = ref({})
const recentFiles = ref([])

// 获取我的选题
const fetchMyTopic = async () => {
  try {
    const response = await getMySelectedTopic()
    selectedTopic.value = response
    // console.log('获取选题信息:', selectedTopic.value)
  } catch (error) {
    console.error('获取选题信息失败:', error)
  }
}

// 获取文件统计
const fetchFileStats = async () => {
  try {
    const response = await getFilesStatistics(userStore.user.userId)
    // console.log('获取文件统计信息:', response)
    fileStats.value = response
  } catch (error) {
    console.error('获取文件统计失败:', error)
  }
}

// 获取成绩信息
const fetchGradeInfo = async () => {
  try {
    const response = await getGradeDetail(userStore.user.userId)
    // console.log('获取成绩信息:', response)
    gradeInfo.value = response
  } catch (error) {
    console.error('获取成绩信息失败:', error)
  }
}

// 获取最近文件
const fetchRecentFiles = async () => {
  try {
    const response = await getStudentFiles(userStore.user.userId)
    // console.log('获取最近文件:', response)
    recentFiles.value = response.slice(0, 5) // 只显示最近5个文件
  } catch (error) {
    console.error('获取最近文件失败:', error)
  }
}

// 获取文件状态类型
const getFileStatusType = (category) => {
  const hasFile = fileStats.value[`${category}Count`] > 0
  return hasFile ? 'success' : 'info'
}

// 获取文件状态文本
const getFileStatusText = (category) => {
  const hasFile = fileStats.value[`${category}Count`] > 0
  return hasFile ? '已提交' : '未提交'
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchMyTopic()
  fetchFileStats()
  fetchGradeInfo()
  fetchRecentFiles()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.dashboard-header p {
  margin: 0;
  color: #909399;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.topic-info h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.topic-details {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.teacher-info {
  color: #606266;
  font-size: 14px;
}

.topic-content {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.no-selection {
  text-align: center;
  padding: 20px;
}

.file-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  min-width: 80px;
  color: #606266;
  font-size: 14px;
}

.activity-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>