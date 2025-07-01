<template>
  <div class="topics-page">
    <div class="page-header">
      <h1>课题选择</h1>
      <p>请选择您感兴趣的毕业设计课题</p>
    </div>

    <!-- 我的选题状态 -->
    <el-card v-if="mySelection" class="my-selection-card">
      <template #header>
        <div class="card-header">
          <span>我的选题</span>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleCancelSelection"
            :loading="cancelLoading"
          >
            取消选题
          </el-button>
        </div>
      </template>
      <div class="selected-topic">
        <h3>{{ mySelection.title }}</h3>
        <div class="topic-meta">
          <el-tag type="success">{{ mySelection.difficulty }}</el-tag>
          <el-tag type="info">{{ mySelection.direction }}</el-tag>
          <span class="teacher-info">指导老师：{{ mySelection.teacherName }}</span>
          <span class="selection-date">选题时间：{{ formatDate(mySelection.selectionDate) }}</span>
        </div>
        <p class="topic-description">{{ mySelection.content }}</p>
      </div>
    </el-card>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="题目名称">
          <el-input 
            v-model="searchForm.title" 
            placeholder="请输入题目名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-select 
            v-model="searchForm.difficulty" 
            placeholder="请选择难度"
            clearable
            style="width: 120px"
          >
            <el-option label="简单" value="简单" />
            <el-option label="中等" value="中等" />
            <el-option label="困难" value="困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="研究方向">
          <el-input 
            v-model="searchForm.direction" 
            placeholder="请输入研究方向"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="指导老师">
          <el-input 
            v-model="searchForm.teacherName" 
            placeholder="请输入老师姓名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.isSelected" 
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="未选" :value="false" />
            <el-option label="已选" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课题列表 -->
    <el-card class="topics-card">
      <div v-if="topics.length > 0" class="topics-list">
        <div 
          v-for="topic in topics" 
          :key="topic.topicId" 
          class="topic-item"
          :class="{ 'selected': topic.isSelected }"
        >
          <div class="topic-content">
            <div class="topic-header">
              <h3 class="topic-title">{{ topic.title }}</h3>
              <div class="topic-status">
                <el-tag v-if="topic.isSelected" type="warning" size="small">
                  已被选择
                </el-tag>
                <el-tag v-else type="success" size="small">
                  可选择
                </el-tag>
              </div>
            </div>
            
            <div class="topic-meta">
              <div class="meta-left">
                <el-tag size="small">{{ topic.difficulty }}</el-tag>
                <el-tag type="info" size="small">{{ topic.direction }}</el-tag>
              </div>
              <div class="meta-right">
                <span class="teacher-name">{{ topic.teacherName }}</span>
                <span class="department">{{ topic.departmentName }}</span>
              </div>
            </div>
            
            <p class="topic-description">{{ topic.content }}</p>
            
            <div class="topic-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="showTopicDetail(topic)"
              >
                查看详情
              </el-button>
              <el-button 
                v-if="!topic.isSelected && !mySelection"
                type="success" 
                size="small"
                @click="handleSelectTopic(topic)"
                :loading="selectLoading"
              >
                选择此题
              </el-button>
              <span v-else-if="topic.isSelected" class="selected-by">
                已被 {{ topic.selectedStudentName }} 选择
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无课题数据" />
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 课题详情对话框 -->
    <el-dialog
      v-model="detailDialog"
      title="课题详情"
      width="60%"
      :close-on-click-modal="false"
    >
      <div v-if="selectedTopicDetail" class="topic-detail">
        <h2>{{ selectedTopicDetail.title }}</h2>
        <div class="detail-meta">
          <div class="meta-row">
            <span class="label">指导老师：</span>
            <span>{{ selectedTopicDetail.teacherName }}</span>
          </div>
          <div class="meta-row">
            <span class="label">所属院系：</span>
            <span>{{ selectedTopicDetail.departmentName }}</span>
          </div>
          <div class="meta-row">
            <span class="label">难度等级：</span>
            <el-tag>{{ selectedTopicDetail.difficulty }}</el-tag>
          </div>
          <div class="meta-row">
            <span class="label">研究方向：</span>
            <el-tag type="info">{{ selectedTopicDetail.direction }}</el-tag>
          </div>
          <div class="meta-row">
            <span class="label">选题状态：</span>
            <el-tag :type="selectedTopicDetail.isSelected ? 'warning' : 'success'">
              {{ selectedTopicDetail.isSelected ? '已被选择' : '可选择' }}
            </el-tag>
          </div>
        </div>
        <div class="topic-content-detail">
          <h4>课题内容：</h4>
          <p>{{ selectedTopicDetail.content }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialog = false">关闭</el-button>
          <el-button 
            v-if="!selectedTopicDetail?.isSelected && !mySelection"
            type="primary"
            @click="handleSelectTopicFromDetail"
            :loading="selectLoading"
          >
            选择此题
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
// import { useUserStore } from '@/stores/user'
import { getTopicsPage, getMySelectedTopic, selectTopic, cancelSelectTopic } from '@/api/topics'
import { ElMessage, ElMessageBox } from 'element-plus'

// const userStore = useUserStore()

const topics = ref([])
const mySelection = ref(null)
const selectLoading = ref(false)
const cancelLoading = ref(false)
const detailDialog = ref(false)
const selectedTopicDetail = ref(null)

const searchForm = reactive({
  title: '',
  difficulty: '',
  direction: '',
  teacherName: '',
  isSelected: null
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取课题列表
const fetchTopics = async () => {
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      size: pagination.size
    }
    const response = await getTopicsPage(params)
    // console.log('dadada',response)
    topics.value = response.records
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取课题列表失败')
    console.error('获取课题列表失败:', error)
  }
}

// 获取我的选题
const fetchMySelection = async () => {
  try {
    const response = await getMySelectedTopic()
    // console.log('====================================');
    // console.log('我的选题信息:', response);
    // console.log('====================================');
    mySelection.value = response
  } catch (error) {
    console.error('获取我的选题失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTopics()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.isSelected = null
  pagination.page = 1
  fetchTopics()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  fetchTopics()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchTopics()
}

// 选择课题
const handleSelectTopic = async (topic) => {
  if (mySelection.value) {
    ElMessage.warning('您已经选择了课题，请先取消当前选题')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要选择课题"${topic.title}"吗？`,
      '确认选题',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectLoading.value = true
    const response = await selectTopic({ topicId: topic.topicId })
    // console.log(response)
    ElMessage.success('选题成功')
    await fetchMySelection()
    await fetchTopics()
    detailDialog.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('选题失败')
      console.error('选题失败:', error)
    }
  } finally {
    selectLoading.value = false
  }
}

// 取消选题
const handleCancelSelection = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消当前选题吗？取消后需要重新选择。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    cancelLoading.value = true
    const response = await cancelSelectTopic()
    // console.log(response)
    ElMessage.success('取消选题成功')
    mySelection.value = null
    await fetchTopics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消选题失败')
      console.error('取消选题失败:', error)
    }
  } finally {
    cancelLoading.value = false
  }
}

// 显示课题详情
const showTopicDetail = (topic) => {
  selectedTopicDetail.value = topic
  detailDialog.value = true
}

// 从详情对话框选择课题
const handleSelectTopicFromDetail = () => {
  handleSelectTopic(selectedTopicDetail.value)
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchMySelection()
  fetchTopics()
})
</script>

<style scoped>
.topics-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.my-selection-card {
  margin-bottom: 20px;
  border: 2px solid #67c23a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.selected-topic h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.teacher-info, .selection-date {
  color: #606266;
  font-size: 14px;
}

.topic-description {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.search-card {
  margin-bottom: 20px;
}

.topics-card {
  min-height: 400px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.topic-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.topic-item.selected {
  background-color: #fdf6ec;
  border-color: #e6a23c;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.topic-title {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  margin-right: 12px;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meta-left {
  display: flex;
  gap: 8px;
}

.meta-right {
  display: flex;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

.topic-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.topic-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-by {
  color: #e6a23c;
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.topic-detail h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.detail-meta-item {
  display: flex;
  flex-direction: column;
}

.detail-meta-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.topic-detail-content {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.topic-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.topic-buttons .el-button + .el-button {
  margin-left: 0;
}

/* 状态标签 */
.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-tag.approved {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-tag.rejected {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-tag.unsubmitted {
  background-color: #f5f7fa;
  color: #909399;
}

/* 对话框相关样式 */
:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: normal;
  background-color: #f5f7fa;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .topic-header,
  .topic-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-right {
    margin-top: 8px;
  }

  .topic-title {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>