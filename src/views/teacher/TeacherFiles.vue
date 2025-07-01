<template>
  <div class="files-container">
    <el-page-header @back="handleBack" :content="pageTitle" />
    
    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="学生姓名">
            <el-input
              v-model="searchForm.studentName"
              placeholder="请输入学生姓名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select v-model="searchForm.fileCategory" placeholder="请选择文件类型" clearable style="width: 100px">
              <el-option label="开题报告" value="PROPOSAL" />
              <el-option label="中期检查" value="MIDTERM" />
              <el-option label="毕业论文" value="THESIS" />
              <el-option label="答辩PPT" value="DEFENSE" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </el-form-item>
          <el-form-item label="文件格式"> 
            <el-select v-model="searchForm.fileType" placeholder="请选择文件格式" clearable style="width: 100px">
              <el-option label="PDF" value="pdf" />
              <el-option label="Word文档" value="doc,docx" />
              <el-option label="PPT" value="ppt,pptx" />
              <el-option label="Excel" value="xls,xlsx" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetSearch" :icon="Refresh">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalFiles }}</div>
              <div class="stat-label">总文件数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalSize }}</div>
              <div class="stat-label">总文件大小</div>
            </div>
          </el-card>
        </el-col>
        <!-- <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.thesisCount }}</div>
              <div class="stat-label">毕业论文</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.proposalCount }}</div>
              <div class="stat-label">开题报告</div>
            </div>
          </el-card>
        </el-col> -->
      </el-row>

      <!-- 文件列表 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>文件列表</span>
            <div class="header-actions">
              <!-- <el-button
                type="danger"
                :disabled="selectedFiles.length === 0"
                @click="handleBatchDelete"
                :icon="Delete"
              >
                批量删除 ({{ selectedFiles.length }})
              </el-button> -->
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="fileList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="originalName" label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="file-name">
                <el-icon class="file-icon">
                  <Document />
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
          <el-table-column prop="fileSize" label="文件大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.uploadTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="150">
            <template #default="{ row }">
              <span class="remarks">{{ row.remarks || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleDownload(row)"
                :icon="Download"
              >
                下载
              </el-button>
              <!-- <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :icon="Delete"
              >
                删除
              </el-button> -->
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
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Delete, Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  downloadFile,
  deleteFile,
  batchDeleteFiles,
  getFilesPage,
  getMystudentFilesCat,
  getMyStudentFilesAll
 } from '@/api/file'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 页面标题
const pageTitle = computed(() => {
  return route.params.studentId ? '学生文件管理' : '文件管理'
})

// 响应式数据
const loading = ref(false)
const fileList = ref([])
const selectedFiles = ref([])
const statistics = ref({
  totalFiles: 0,
  formattedTotalSize: '0 B',
  thesisCount: 0,
  proposalCount: 0,
  reportCount: 0,
  otherCount: 0
})

// 搜索表单
const searchForm = reactive({
  studentName: '',
  fileCategory: '',
  fileType: ''
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 方法
const handleBack = () => {
  if (route.params.studentId) {
    router.push('/teacher/students')
  } else {
    router.push('/teacher/dashboard')
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchFiles()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    studentName: '',
    fileCategory: '',
    fileType: ''
  })
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchFiles()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchFiles()
}

const handleDownload = async (row) => {
  try {
    const response = await downloadFile(row.fileId)
    
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
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${row.originalName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // console.log(row)
    await deleteFile(row.fileId)
    ElMessage.success('删除成功')
    fetchFiles()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const fileIds = selectedFiles.value.map(file => file.fileId)
    await batchDeleteFiles(fileIds)

    ElMessage.success('批量删除成功')
    selectedFiles.value = []
    fetchFiles()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const fetchFiles = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      fileName: searchForm.studentName,
      fileCategory: searchForm.fileCategory,
      fileType: searchForm.fileType
    }
    if (route.params.studentId) {
      params.studentId = route.params.studentId
    }
    
    const response = await getFilesPage(params)
    // console.log("========111111111============")
    fileList.value = response.records
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    let response
    if (route.params.studentId) {
      response = await getMystudentFilesCat(route.params.studentId)
    } else {
      response = await getMyStudentFilesAll()
    }
    // console.log(route.params.studentId)
    // console.log('aaaaaaaaaaaaaaa',response)
    statistics.value = response
  } catch (error) {
    console.error('获取统计信息失败', error)
  }
}

const getCategoryTagType = (category) => {
  const tagTypes = {
    'PROPOSAL': 'primary',
    'MIDTERM': 'success',
    'THESIS': 'warning',
    'DEFENSE': 'danger',
    'OTHER': 'info'
  }
  return tagTypes[category] || 'info'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听路由参数变化
watch(() => route.params.studentId, () => {
  fetchFiles()
  fetchStatistics()
}, { immediate: true })

// 组件挂载
onMounted(() => {
  fetchFiles()
  fetchStatistics()
})
</script>

<style scoped>
.files-container {
  padding: 20px;
}

.content-wrapper {
  margin-top: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
}

.remarks {
  color: #666;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.el-table .el-table__cell {
  padding: 8px 0;
}
</style>