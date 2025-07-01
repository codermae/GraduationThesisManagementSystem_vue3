<template>
  <div class="grades-container">
    <div class="page-header">
      <h2>成绩管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="batchCalculateFinalGrades">
          批量计算最终成绩
        </el-button>
        <el-button @click="exportGrades">
          导出成绩
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ statistics.totalStudents }}</div>
          <div class="stat-label">总学生数</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ statistics.gradedStudents }}</div>
          <div class="stat-label">已评分</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ statistics.ungradedStudents }}</div>
          <div class="stat-label">未评分</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ statistics.averageScore?.toFixed(1) || 0 }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </el-card>
    </div>

    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="学生姓名">
          <el-input v-model="queryForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="queryForm.className" placeholder="请输入班级" clearable />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="queryForm.major" placeholder="请输入专业" clearable />
        </el-form-item>
        <el-form-item label="分数范围">
          <el-input-number v-model="queryForm.minScore" :min="0" :max="100" placeholder="最低分" />
          <span style="margin: 0 8px;">-</span>
          <el-input-number v-model="queryForm.maxScore" :min="0" :max="100" placeholder="最高分" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadGrades">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 成绩列表 -->
    <el-card class="table-card">
      <el-table 
        :data="gradeList" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="topicTitle" label="论文题目" min-width="200" show-overflow-tooltip />
        <el-table-column prop="thesisScore" label="论文成绩" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.thesisScore !== null" :type="getScoreType(row.thesisScore)">
              {{ row.thesisScore }}
            </el-tag>
            <span v-else class="text-gray-400">未评分</span>
          </template>
        </el-table-column>
        <el-table-column prop="defenseScore" label="答辩成绩" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.defenseScore !== null" :type="getScoreType(row.defenseScore)">
              {{ row.defenseScore }}
            </el-tag>
            <span v-else class="text-gray-400">未评分</span>
          </template>
        </el-table-column>
        <el-table-column prop="finalScore" label="最终成绩" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.finalScore !== null" :type="getScoreType(row.finalScore)" effect="dark">
              {{ row.finalScore }}
            </el-tag>
            <span v-else class="text-gray-400">未计算</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="scoreThesiss(row)">论文评分</el-button>
            <el-button size="small" @click="scoreDefensee(row)">答辩评分</el-button>
            <el-button size="small" type="success" @click="calculateFinalGradee(row.studentId)">
              计算最终成绩
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="loadGrades"
          @current-change="loadGrades"
        />
      </div>
    </el-card>

    <!-- 论文评分对话框 -->
    <el-dialog v-model="thesisScoreDialog" title="论文评分" width="500px">
      <el-form :model="thesisScoreForm" :rules="thesisScoreRules" ref="thesisScoreFormRef">
        <el-form-item label="学生" label-width="80px">
          <span>{{ currentStudent?.studentName }} ({{ currentStudent?.studentId }})</span>
        </el-form-item>
        <el-form-item label="论文成绩" prop="thesisScore" label-width="80px">
          <el-input-number 
            v-model="thesisScoreForm.thesisScore" 
            :min="0" 
            :max="100" 
            :precision="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="评语" prop="remarks" label-width="80px">
          <el-input 
            v-model="thesisScoreForm.remarks" 
            type="textarea" 
            :rows="4"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="thesisScoreDialog = false">取消</el-button>
        <el-button type="primary" @click="submitThesisScore">确定</el-button>
      </template>
    </el-dialog>

    <!-- 答辩评分对话框 -->
    <el-dialog v-model="defenseScoreDialog" title="答辩评分" width="500px">
      <el-form :model="defenseScoreForm" :rules="defenseScoreRules" ref="defenseScoreFormRef">
        <el-form-item label="学生" label-width="80px">
          <span>{{ currentStudent?.studentName }} ({{ currentStudent?.studentId }})</span>
        </el-form-item>
        <el-form-item label="答辩成绩" prop="score" label-width="80px">
          <el-input-number 
            v-model="defenseScoreForm.score" 
            :min="0" 
            :max="100" 
            :precision="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="评语" prop="comments" label-width="80px">
          <el-input 
            v-model="defenseScoreForm.comments" 
            type="textarea" 
            :rows="4"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="defenseScoreDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDefenseScore">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  scoreThesis,
  scoreDefense,
  exportGrade,
  getGradeList,
  getGradeStatistics,
  calculateFinalGrade,
   } from '@/api/grades'

const userStore = useUserStore()

// 数据
const loading = ref(false)
const gradeList = ref([])
const selectedGrades = ref([])
const statistics = ref({})

// 查询表单
const queryForm = reactive({
  studentName: '',
  className: '',
  major: '',
  minScore: null,
  maxScore: null
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

// 论文评分
const thesisScoreDialog = ref(false)
const currentStudent = ref(null)
const thesisScoreForm = reactive({
  studentId: '',
  thesisScore: null,
  remarks: ''
})

const thesisScoreRules = {
  thesisScore: [
    { required: true, message: '请输入论文成绩', trigger: 'blur' }
  ]
}

// 答辩评分
const defenseScoreDialog = ref(false)
const defenseScoreForm = reactive({
  studentId: '',
  score: null,
  comments: ''
})

const defenseScoreRules = {
  score: [
    { required: true, message: '请输入答辩成绩', trigger: 'blur' }
  ]
}

const thesisScoreFormRef = ref()
const defenseScoreFormRef = ref()

// 方法
const loadGrades = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      teacherId: userStore.user.userId,
      ...queryForm
    }
    
    const response = await getGradeList(params)
    // console.log('==========成绩列表==========')
    // console.log(response)
    // console.log('============================')
    gradeList.value = response.records
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('加载成绩列表失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await getGradeStatistics(userStore.user.userId)
    // console.log('==========统计信息==========')
    // console.log(response)
    // console.log('============================')
    statistics.value = response
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

const resetQuery = () => {
  Object.assign(queryForm, {
    studentName: '',
    className: '',
    major: '',
    minScore: null,
    maxScore: null
  })
  pagination.pageNum = 1
  loadGrades()
}

const handleSelectionChange = (selection) => {
  selectedGrades.value = selection
}

const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

// 论文评分
const scoreThesiss = (row) => {
  currentStudent.value = row
  thesisScoreForm.studentId = row.studentId
  thesisScoreForm.thesisScore = row.thesisScore
  thesisScoreForm.remarks = row.thesisRemarks || ''
  thesisScoreDialog.value = true
}

const submitThesisScore = async () => {
  if (!thesisScoreFormRef.value) return
  
  try {
    await thesisScoreFormRef.value.validate()
    
    const response = await scoreThesis(thesisScoreForm)
    // console.log('==========论文评分==========')
    // console.log(response)
    // console.log('============================')
    ElMessage.success('论文评分成功')
    thesisScoreDialog.value = false
    loadGrades()
    loadStatistics()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('论文评分失败')
    }
  }
}

// 答辩评分
const scoreDefensee = (row) => {
  currentStudent.value = row
  defenseScoreForm.studentId = row.studentId
  defenseScoreForm.score = row.defenseScore
  defenseScoreForm.comments = row.defenseComments || ''
  defenseScoreDialog.value = true
}

const submitDefenseScore = async () => {
  if (!defenseScoreFormRef.value) return
  
  try {
    await defenseScoreFormRef.value.validate()
    
    const response = await scoreDefense(defenseScoreForm)
    // console.log('==========答辩评分==========')
    // console.log(response)
    // console.log('============================')
      ElMessage.success('答辩评分成功')
      defenseScoreDialog.value = false
      loadGrades()
      loadStatistics()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('答辩评分失败')
    }
  }
}

// 计算最终成绩
const calculateFinalGradee = async (studentId) => {
  try {
    const response = await calculateFinalGrade(studentId)
    ElMessage.success('最终成绩计算成功')
    loadGrades()
    loadStatistics()
  } catch (error) {
    ElMessage.error('计算最终成绩失败')
  }
}

// 批量计算最终成绩
const batchCalculateFinalGrades = async () => {
  try {
    await ElMessageBox.confirm('确定要批量计算所有学生的最终成绩吗？', '确认', {
      type: 'warning'
    })
    
    // const response = await batchCalculateFinalGrade()
    ElMessage.success('批量计算最终成绩成功')
    loadGrades()
    loadStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量计算最终成绩失败')
    }
  }
}

// 导出成绩
const exportGrades = async () => {
  try {
    // 获取所有选中的学生的 studentId
    const selectedStudentIds = selectedGrades.value.map(grade => grade.studentId);

    // 构建请求参数
    const params = {
      studentIds: selectedStudentIds,
      format: 'xlsx'
    };

    // 打印参数
    // console.log('Export grades params:', params);

    // 确保 responseType 为 'blob'
    const response = await exportGrade(params, { responseType: 'blob' });

    // 打印 response.data 的内容
    // console.log('Response data:', response.data);

    // 创建 Blob
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // 打印 Blob 信息
    // console.log('Blob info:', blob); 

    // 验证 Blob 数据（可选）
    const reader = new FileReader();
    reader.onloadend = () => {
      // console.log('Blob content:', reader.result);
    };
    reader.readAsDataURL(blob);

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `成绩导出_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    ElMessage.success('成绩导出成功');
  } catch (error) {
    ElMessage.error('导出成绩失败');
    console.error('Export grades failed:', error);
  }
};

onMounted(() => {
  loadGrades()
  loadStatistics()
})
</script>

<style scoped>
.grades-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.query-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-400 {
  color: #9ca3af;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>