<template>
  <div class="students-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的学生</h2>
      <p class="page-description">管理您指导的学生，查看选题情况和文件提交状态</p>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="学生姓名">
          <el-input
            v-model="filterForm.studentName"
            placeholder="请输入学生姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="班级">
          <el-input
            v-model="filterForm.className"
            placeholder="请输入班级"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="专业">
          <el-input
            v-model="filterForm.major"
            placeholder="请输入专业"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学生列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>学生列表 ({{ total }})</span>
          <div class="header-actions">
            <el-button type="success" @click="handleBatchGrade" :disabled="!multipleSelection.length">
              <el-icon><Edit /></el-icon>
              批量评分
            </el-button>
            <el-button type="primary" @click="handleExportGrades">
              <el-icon><Download /></el-icon>
              导出成绩
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="studentList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="studentId" label="学号" width="120" />
        
        <el-table-column prop="studentName" label="学生姓名" width="100">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewStudent(row)">
              {{ row.studentName }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="className" label="班级" width="120" />
        
        <el-table-column prop="major" label="专业" width="150" />
        
        <el-table-column prop="topicTitle" label="选题" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.topicTitle" placement="top" :disabled="!row.topicTitle">
              <span class="topic-title">{{ row.topicTitle || '未选题' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="论文成绩" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.thesisScore !== null"
              :type="getScoreType(row.thesisScore)"
              size="small"
            >
              {{ row.thesisScore }}
            </el-tag>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>
        
        <el-table-column label="答辩成绩" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.defenseScore !== null"
              :type="getScoreType(row.defenseScore)"
              size="small"
            >
              {{ row.defenseScore }}
            </el-tag>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>
        
        <el-table-column label="最终成绩" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.finalScore !== null"
              :type="getScoreType(row.finalScore)"
              size="small"
              effect="dark"
            >
              {{ row.finalScore }}
            </el-tag>
            <span v-else class="no-score">未计算</span>
          </template>
        </el-table-column>
        
        <el-table-column label="文件状态" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.fileCount || 0" class="file-badge-custom">
              <el-button link @click="handleViewFiles(row)">
                <el-icon><Document /></el-icon>
              </el-button>
            </el-badge>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleGradeThesis(row)">
                论文评分
              </el-button>
              <el-button type="success" size="small" @click="handleGradeDefense(row)">
                答辩评分
              </el-button>
              <el-button type="info" size="small" @click="handleViewDetail(row)">
                详情
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 论文评分对话框 -->
    <el-dialog
      v-model="thesisGradeDialog.visible"
      title="论文评分"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="thesisFormRef"
        :model="thesisGradeDialog.form"
        :rules="thesisGradeRules"
        label-width="100px"
      >
        <el-form-item label="学生信息">
          <span>{{ thesisGradeDialog.studentInfo }}</span>
        </el-form-item>
        <el-form-item label="论文成绩" prop="thesisScore">
          <el-input-number
            v-model="thesisGradeDialog.form.thesisScore"
            :min="0"
            :max="100"
            :precision="1"
            style="width: 200px"
          />
          <span style="margin-left: 10px">分</span>
        </el-form-item>
        <el-form-item label="评语" prop="remarks">
          <el-input
            v-model="thesisGradeDialog.form.remarks"
            type="textarea"
            :rows="4"
            placeholder="请输入评语"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="thesisGradeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitThesisGrade" :loading="thesisGradeDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 答辩评分对话框 -->
    <el-dialog
      v-model="defenseGradeDialog.visible"
      title="答辩评分"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="defenseFormRef"
        :model="defenseGradeDialog.form"
        :rules="defenseGradeRules"
        label-width="100px"
      >
        <el-form-item label="学生信息">
          <span>{{ defenseGradeDialog.studentInfo }}</span>
        </el-form-item>
        <el-form-item label="答辩成绩" prop="score">
          <el-input-number
            v-model="defenseGradeDialog.form.score"
            :min="0"
            :max="100"
            :precision="1"
            style="width: 200px"
          />
          <span style="margin-left: 10px">分</span>
        </el-form-item>
        <el-form-item label="评语" prop="comments">
          <el-input
            v-model="defenseGradeDialog.form.comments"
            type="textarea"
            :rows="4"
            placeholder="请输入评语"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="defenseGradeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDefenseGrade" :loading="defenseGradeDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 学生详情对话框 -->
    <el-dialog
      v-model="studentDetailDialog.visible"
      title="学生详情"
      width="800px"
    >
      <el-descriptions v-if="studentDetailDialog.data" :column="2" border>
        <el-descriptions-item label="学号">{{ studentDetailDialog.data.studentId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ studentDetailDialog.data.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ studentDetailDialog.data.className }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ studentDetailDialog.data.major }}</el-descriptions-item>
        <el-descriptions-item label="选题">{{ studentDetailDialog.data.topicTitle || '未选题' }}</el-descriptions-item>
        <el-descriptions-item label="论文成绩">
          <el-tag v-if="studentDetailDialog.data.thesisScore !== null" :type="getScoreType(studentDetailDialog.data.thesisScore)">
            {{ studentDetailDialog.data.thesisScore }}
          </el-tag>
          <span v-else>未评分</span>
        </el-descriptions-item>
        <el-descriptions-item label="答辩成绩">
          <el-tag v-if="studentDetailDialog.data.defenseScore !== null" :type="getScoreType(studentDetailDialog.data.defenseScore)">
            {{ studentDetailDialog.data.defenseScore }}
          </el-tag>
          <span v-else>未评分</span>
        </el-descriptions-item>
        <el-descriptions-item label="最终成绩">
          <el-tag v-if="studentDetailDialog.data.finalScore !== null" :type="getScoreType(studentDetailDialog.data.finalScore)" effect="dark">
            {{ studentDetailDialog.data.finalScore }}
          </el-tag>
          <span v-else>未计算</span>
        </el-descriptions-item>
        <el-descriptions-item label="论文评语" span="2">
          {{ studentDetailDialog.data.thesisRemarks || '暂无评语' }}
        </el-descriptions-item>
        <el-descriptions-item label="答辩评语" span="2">
          {{ studentDetailDialog.data.defenseComments || '暂无评语' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <h4>操作记录</h4>
        <el-timeline>
          <el-timeline-item v-if="studentDetailDialog.data?.calculatedAt" :timestamp="formatDate(studentDetailDialog.data.calculatedAt)">
            最终成绩已计算完成
          </el-timeline-item>
          <el-timeline-item :timestamp="formatDate(studentDetailDialog.data?.selectionDate)">
            学生完成选题
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 文件查看对话框 -->
    <el-dialog
      v-model="filesDialog.visible"
      title="学生文件"
      width="900px"
    >
      <el-table :data="filesDialog.files" v-loading="filesDialog.loading">
        <el-table-column prop="originalName" label="文件名" min-width="200" />
        <el-table-column prop="fileCategoryName" label="文件类型" width="120" />
        <el-table-column prop="fileSize" label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="150" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDownloadFile(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,  } from 'vue'
import { ElMessage,  } from 'element-plus'
import { Search, Refresh, Edit, Download, Document, Position } from '@element-plus/icons-vue'
import { getStudentFiles } from '@/api/file'
import { scoreThesis,scoreDefense } from '@/api/grades'
import { downloadFile,getMystudentFilesCat,getMyStudentFilesAll } from '@/api/file'
import { getStudentInfo } from '@/api/user'
import { getMyStudentsTopicsInfo,getMyTeachersTopicsInfo } from '@/api/topics'
// 响应式数据
const loading = ref(false)
const studentList = ref([])
const total = ref(0)
const multipleSelection = ref([])
const tableRef = ref()

// 分页配置
const pagination = reactive({
  current: 1,
  size: 20
})

// 筛选表单
const filterForm = reactive({
  studentName: '',
  className: '',
  major: ''
})

// 论文评分对话框
const thesisGradeDialog = reactive({
  visible: false,
  loading: false,
  studentInfo: '',
  form: {
    studentId: '',
    thesisScore: null,
    remarks: ''
  }
})

// 答辩评分对话框
const defenseGradeDialog = reactive({
  visible: false,
  loading: false,
  studentInfo: '',
  form: {
    studentId: '',
    score: null,
    comments: ''
  }
})

// 学生详情对话框
const studentDetailDialog = reactive({
  visible: false,
  data: null
})

// 文件查看对话框
const filesDialog = reactive({
  visible: false,
  loading: false,
  files: []
})

// 表单验证规则
const thesisGradeRules = {
  thesisScore: [
    { required: true, message: '请输入论文成绩', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '成绩范围为0-100分', trigger: 'blur' }
  ]
}

const defenseGradeRules = {
  score: [
    { required: true, message: '请输入答辩成绩', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '成绩范围为0-100分', trigger: 'blur' }
  ]
}

// 表单引用
const thesisFormRef = ref()
const defenseFormRef = ref()

// 获取学生列表
const fetchStudentList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...filterForm
    }
    const response = await getMyStudentsTopicsInfo()
    // console.log('学生列表：',response)
    studentList.value = response
    total.value = response.length
    //
    // const tests = await getMyStudentsTopicsInfo()
    // console.log('我的学生选题：',tests)

    // const tests2 = await getMyStudentFilesAll()
    // console.log('老师查看所有指导学生的文件汇总',tests2)

    // const tests3 = await getMyTeachersTopicsInfo('S005')
    // console.log('我的学生选题：',tests3)

    // const tests4 = await getMystudentFilesCat('S005')
    // console.log('我的学生选题：',tests4)

    //

      
    // 获取每个学生的文件数量
    await fetchFileCountsForStudents()
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 获取学生文件数量
const fetchFileCountsForStudents = async () => {
  for (const student of studentList.value) {
    try {
      const response = await getStudentFiles(student.studentId)
      // console.log('获取文件数量111:', response.length)
      student.fileCount = response.length
    } catch (error) {
      student.fileCount = 0
    }
  }
}

// 搜索

// 完善的搜索函数
const handleSearch = async () => {
  try {
    loading.value = true
    pagination.current = 1
    
    // 获取所有学生数据
    const allStudents = await getMyStudentsTopicsInfo()
    
    // 根据筛选条件过滤数据
    let filteredStudents = allStudents.filter(student => {
      let matches = true
      
      // 按学生姓名搜索（支持模糊匹配）
      if (filterForm.studentName && filterForm.studentName.trim()) {
        const searchName = filterForm.studentName.trim().toLowerCase()
        const studentName = (student.studentName || '').toLowerCase()
        matches = matches && studentName.includes(searchName)
      }
      
      // 按班级搜索（支持模糊匹配）
      if (filterForm.className && filterForm.className.trim()) {
        const searchClass = filterForm.className.trim().toLowerCase()
        const className = (student.className || '').toLowerCase()
        matches = matches && className.includes(searchClass)
      }
      
      // 按专业搜索（支持模糊匹配）
      if (filterForm.major && filterForm.major.trim()) {
        const searchMajor = filterForm.major.trim().toLowerCase()
        const major = (student.major || '').toLowerCase()
        matches = matches && major.includes(searchMajor)
      }
      
      return matches
    })
    
    // 更新学生列表和总数
    studentList.value = filteredStudents
    total.value = filteredStudents.length
    
    // 获取过滤后学生的文件数量
    await fetchFileCountsForStudents()
    
    // 搜索结果提示
    if (filteredStudents.length === 0) {
      ElMessage.warning('未找到符合条件的学生')
    } else {
      ElMessage.success(`找到 ${filteredStudents.length} 名学生`)
    }
    
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    studentName: '',
    className: '',
    major: ''
  })
  pagination.current = 1
  fetchStudentList()
}

// 多选处理
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  fetchStudentList()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchStudentList()
}

// 论文评分
const handleGradeThesis = (row) => {
  thesisGradeDialog.studentInfo = `${row.studentName} (${row.studentId})`
  thesisGradeDialog.form.studentId = row.studentId
  thesisGradeDialog.form.thesisScore = row.thesisScore
  thesisGradeDialog.form.remarks = row.thesisRemarks || ''
  thesisGradeDialog.visible = true
}

// 提交论文评分
const handleSubmitThesisGrade = async () => {
  try {
    await thesisFormRef.value.validate()
    thesisGradeDialog.loading = true
    
    const response = await scoreThesis(thesisGradeDialog.form)
    ElMessage.success('论文评分成功')
    thesisGradeDialog.visible = false
    fetchStudentList()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '评分失败')
    }
  } finally {
    thesisGradeDialog.loading = false
  }
}

// 答辩评分
const handleGradeDefense = (row) => {
  defenseGradeDialog.studentInfo = `${row.studentName} (${row.studentId})`
  defenseGradeDialog.form.studentId = row.studentId
  defenseGradeDialog.form.score = row.defenseScore
  defenseGradeDialog.form.comments = row.defenseComments || ''
  defenseGradeDialog.visible = true
}

// 提交答辩评分
const handleSubmitDefenseGrade = async () => {
  try {
    await defenseFormRef.value.validate()
    defenseGradeDialog.loading = true
    
    const response = await scoreDefense(defenseGradeDialog.form)
    ElMessage.success('答辩评分成功')
    defenseGradeDialog.visible = false
    fetchStudentList()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '评分失败')
    }
  } finally {
    defenseGradeDialog.loading = false
  }
}

// 批量评分
const handleBatchGrade = () => {
  ElMessage.info('批量评分功能开发中...')
}

// 导出成绩
const handleExportGrades = async () => {
  ElMessage.info('前往成绩管理进行导出...')
  // try {
  //   const response = await axios.post('/api/grade/export', {
  //     format: 'xlsx'
  //   }, {
  //     responseType: 'blob'
  //   })
    
  //   // 创建下载链接
  //   const url = window.URL.createObjectURL(new Blob([response.data]))
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.setAttribute('download', `成绩单_${new Date().getTime()}.xlsx`)
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  //   window.URL.revokeObjectURL(url)
    
  //   ElMessage.success('导出成功')
  // } catch (error) {
  //   ElMessage.error('导出失败')
  // }
}

// 查看学生详情
const handleViewDetail = async (row) => {
  try {
    const response = await getMyTeachersTopicsInfo(row.studentId)
    studentDetailDialog.data = response
    studentDetailDialog.visible = true
    console.log('学生详情：',studentDetailDialog.data?.selectionDate)
  } catch (error) {
    ElMessage.error('获取学生详情失败')
  }
}

// 查看学生信息
const handleViewStudent = (row) => {
  handleViewDetail(row)
}

// 查看文件
const handleViewFiles = async (row) => {
  try {
    filesDialog.loading = true
    filesDialog.visible = true
    
    const response = await getStudentFiles(row.studentId)
    filesDialog.files = response
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    filesDialog.loading = false
  }
}

// 下载文件
const handleDownloadFile = async (file) => {
  try {
    const response = await downloadFile(file.fileId)
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.originalName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 获取成绩类型
const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    return '-'
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(1)} ${units[index]}`
}

// 初始化
onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.students-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.page-description {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
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

.topic-title {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
}

.no-score {
  color: #909399;
  font-size: 12px;
}

.file-badge {
  cursor: pointer;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.el-table .el-button--text) {
  padding: 5px;
}

:deep(.el-badge__content) {
  font-size: 10px;
}

.file-badge-custom :deep(.el-badge__content) {
  top: 5px !important;           /* 向下调整位置 */
  right: 5px !important;         /* 向左调整位置 */
  transform: translate(50%, -40%) !important;  /* 重新定位中心点 */
  font-size: 10px !important;
  height: 13px !important;       /* 高度 */
  min-width: 13px !important;   /* 宽度与高度一致 */
  line-height: 13px !important;
  padding: 0 !important;        /* 避免padding影响形状 */
  border-radius: 50% !important; /* 强制圆形 */
}
</style>