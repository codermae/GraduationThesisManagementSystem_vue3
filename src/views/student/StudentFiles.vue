<template>
  <div class="files-container">
    <div class="page-header">
      <h2>文件管理</h2>
      <p class="page-desc">上传和管理毕业设计相关材料</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalFiles || 0 }}</div>
          <div class="stat-label">总文件数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatFileSize(statistics.totalSize) || '0 KB' }}</div>
          <div class="stat-label">总大小</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><EditPen /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.proposalCount || 0 }}</div>
          <div class="stat-label">开题报告</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Notebook /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.thesisCount || 0 }}</div>
          <div class="stat-label">论文文档</div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Upload /></el-icon>
        上传文件
      </el-button>
      <el-button 
        type="danger" 
        :disabled="selectedFiles.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <div class="action-right">
        <el-input
          v-model="searchForm.fileName"
          placeholder="搜索文件名"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.fileCategory"
          placeholder="文件类型"
          clearable
          style="width: 120px; margin-left: 10px"
          @change="handleSearch"
        >
          <el-option label="开题报告" value="PROPOSAL" />
          <el-option label="中期报告" value="REPORT" />
          <el-option label="论文" value="THESIS" />
          <el-option label="答辩PPT" value="PRESENTATION" />
          <el-option label="其他" value="OTHER" />
        </el-select>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="file-list">
      <el-table
        :data="fileList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="originalName" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-name">
              <el-icon class="file-icon">
                <component :is="getFileIcon(row.fileType)" />
              </el-icon>
              <span>{{ row.originalName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="fileCategoryName" label="文件类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.fileCategory)">
              {{ row.fileCategory }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleDownload(row)"
              :loading="downloadingFiles.includes(row.fileId)"
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文件"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef" label-width="80px">
        <el-form-item label="文件类型" prop="fileCategory">
          <el-select v-model="uploadForm.fileCategory" placeholder="请选择文件类型" style="width: 100%">
            <el-option label="开题报告" value="PROPOSAL" />
            <el-option label="中期报告" value="REPORT" />
            <el-option label="论文" value="THESIS" />
            <el-option label="答辞PPT" value="PRESENTATION" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件" prop="file">
          <el-upload
            ref="uploadRef"
            :file-list="uploadFileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :auto-upload="false"
            :limit="1"
            drag
            style="width: 100%"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 doc/docx/pdf/ppt/pptx 格式，文件大小不超过 50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="uploadForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  FolderOpened,
  EditPen,
  Notebook,
  Upload,
  Delete,
  Search,
  Download,
  UploadFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { 
  getFilesPage,
  uploadFile,
  getFilesStatistics,
  downloadFile,
  deleteFile,
  batchDeleteFiles
 } from '@/api/file'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const showUploadDialog = ref(false)
const downloadingFiles = ref([])
const selectedFiles = ref([])
const uploadFileList = ref([])

// 统计信息
const statistics = ref({})

// 搜索表单
const searchForm = reactive({
  fileName: '',
  fileCategory: '',
  pageNum: 1,
  pageSize: 10
})

// 上传表单
const uploadForm = reactive({
  fileCategory: '',
  remarks: '',
  file: null
})

// 上传表单验证规则
const uploadRules = {
  fileCategory: [
    { required: true, message: '请选择文件类型', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请选择要上传的文件', trigger: 'change' }
  ]
}

// 文件列表
const fileList = ref([])

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表单引用
const uploadFormRef = ref()
const uploadRef = ref()

// 获取文件统计信息
const getFileStatistics = async () => {
  try {
    const response = await getFilesStatistics(userStore.user.userId)
    // console.log('====================================');
    // console.log('获取文件统计信息:', response);
    // console.log('====================================');
    statistics.value = response
  } catch (error) {
    console.error('获取文件统计失败:', error)
  }
}

// 获取文件列表
const getFileList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.current,
      pageSize: pagination.size,
      studentId: userStore.user.userId
    }
    const response = await getFilesPage(params)
    // console.log('====================================');
    // console.log('获取文件列表:', response);
    // console.log('====================================');
    fileList.value = response.records
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取文件列表失败')
    console.error('获取文件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  getFileList()
}

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

// 文件变化处理
const handleFileChange = (file, fileList) => {
  uploadForm.file = file.raw
  uploadFileList.value = fileList
}

// 文件移除处理
const handleFileRemove = () => {
  uploadForm.file = null
  uploadFileList.value = []
}

// 上传文件
const handleUpload = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return

    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('fileCategory', uploadForm.fileCategory)
      formData.append('remarks', uploadForm.remarks)
      formData.append('studentId', userStore.user.userId)

      const response = await uploadFile(formData)
      // console.log(response)
        ElMessage.success('文件上传成功')
        showUploadDialog.value = false
        resetUploadForm()
        await getFileList()
        await getFileStatistics()
    } catch (error) {
      ElMessage.error('文件上传失败')
      console.error('文件上传失败:', error)
    } finally {
      uploading.value = false
    }
  })
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.fileCategory = ''
  uploadForm.remarks = ''
  uploadForm.file = null
  uploadFileList.value = []
  uploadFormRef.value?.resetFields()
}

// 下载文件
const handleDownload = async (row) => {
  downloadingFiles.value.push(row.fileId)
  try {
    const response = await downloadFile(row.fileId)
    // console.log('====================================');
    // console.log('下载文件:', response);
    // console.log('====================================');
    // 创建下载链接
    const blob = new Blob([response])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
  } catch (error) {
    ElMessage.error('文件下载失败')
    console.error('文件下载失败:', error)
  } finally {
    downloadingFiles.value = downloadingFiles.value.filter(id => id !== row.fileId)
  }
}

// 删除文件
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteFile(row.fileId)
    // console.log(response)
    ElMessage.success('文件删除成功')
    await getFileList()
    await getFileStatistics()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败')
      console.error('文件删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const fileIds = selectedFiles.value.map(file => file.fileId)
    const response = await batchDeleteFiles(fileIds)
    // console.log(response)
      ElMessage.success('批量删除成功')
      selectedFiles.value = []
      await getFileList()
      await getFileStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
    }
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.size = val
  pagination.current = 1
  getFileList()
}

const handleCurrentChange = (val) => {
  pagination.current = val
  getFileList()
}

// 工具函数
const getFileIcon = (fileType) => {
  const iconMap = {
    'pdf': 'Document',
    'doc': 'EditPen',
    'docx': 'EditPen',
    'ppt': 'Notebook',
    'pptx': 'Notebook',
    'default': 'Document'
  }
  return iconMap[fileType?.toLowerCase()] || iconMap.default
}

const getCategoryTagType = (category) => {
  const typeMap = {
    'PROPOSAL': 'success',
    'REPORT': 'warning',
    'THESIS': 'primary',
    'PRESENTATION': 'info',
    'OTHER': 'danger'
  }
  return typeMap[category] || 'default'
}

const formatFileSize = (size) => {
  if (!size) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  getFileList()
  getFileStatistics()
})
</script>

<style scoped>
.files-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-bar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-right {
  display: flex;
  align-items: center;
}

.file-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
  font-size: 16px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style>