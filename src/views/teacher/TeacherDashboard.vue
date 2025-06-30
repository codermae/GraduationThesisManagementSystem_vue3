<template>
  <div class="teacher-dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon topics-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <h3>{{ statistics.totalTopics || 0 }}</h3>
              <p>发布选题</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon students-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <h3>{{ statistics.totalStudents || 0 }}</h3>
              <p>指导学生</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon graded-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-info">
              <h3>{{ statistics.gradedStudents || 0 }}</h3>
              <p>已评分</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon pending-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <h3>{{ statistics.ungradedStudents || 0 }}</h3>
              <p>待评分</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>成绩分布</span>
          </template>
          <div ref="gradeChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>文件提交统计</span>
          </template>
          <div ref="fileChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>最近选题学生</span>
          </template>
          <el-table :data="recentSelections" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" />
            <el-table-column prop="topicTitle" label="选题标题" />
            <el-table-column prop="selectionDate" label="选题时间" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewStudent(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyStudentsTopics } from '@/api/topics'
// import { getStudentFilesStatistics } from '@/api/file'
import * as echarts from 'echarts'
import { Document, User, Check, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const statistics = ref({})
const recentSelections = ref([])
const gradeChart = ref(null)
const fileChart = ref(null)

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // const response = await api.get('/grade/statistics', {
    //   params: { teacherId: userStore.user.userId }
    // })
    // statistics.value = response.data.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近选题学生
const fetchRecentSelections = async () => {
  try {
    const response = await getMyStudentsTopics(userStore.user.userId)
    console.log(response)
    recentSelections.value = response.slice(0, 5) // 只显示最近5个
  } catch (error) {
    console.error('获取最近选题学生失败:', error)
  }
}

// 初始化成绩分布图表
const initGradeChart = () => {
  const chart = echarts.init(gradeChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '成绩分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.value.excellentCount || 0, name: '优秀(90-100)' },
          { value: statistics.value.goodCount || 0, name: '良好(80-89)' },
          { value: statistics.value.passCount || 0, name: '及格(60-79)' },
          { value: statistics.value.failCount || 0, name: '不及格(0-59)' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化文件统计图表(查询名下学生的文件)
const initFileChart = async () => {
  try {
    // const response = await getStudentFilesStatistics(userStore.user.userId)
    // console.log('文件统计:', response)
    // const fileStats = response.data.data
    
    // const chart = echarts.init(fileChart.value)
    // const option = {
    //   tooltip: {
    //     trigger: 'axis',
    //     axisPointer: {
    //       type: 'shadow'
    //     }
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: ['开题报告', '中期检查', '论文', '其他']
    //   },
    //   yAxis: {
    //     type: 'value'
    //   },
    //   series: [
    //     {
    //       name: '文件数量',
    //       type: 'bar',
    //       data: [
    //         fileStats.proposalCount || 0,
    //         fileStats.reportCount || 0,
    //         fileStats.thesisCount || 0,
    //         fileStats.otherCount || 0
    //       ],
    //       itemStyle: {
    //         color: '#409EFF'
    //       }
    //     }
    //   ]
    // }
    // chart.setOption(option)
  } catch (error) {
    console.error('获取文件统计失败:', error)
  }
}

// 查看学生详情
const viewStudent = (student) => {
  router.push(`/teacher/files/${student.studentId}`)
}

onMounted(async () => {
  await fetchStatistics()
  await fetchRecentSelections()
  
  // 初始化图表
  setTimeout(() => {
    initGradeChart()
    initFileChart()
  }, 100)
})
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  align-items: center;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.topics-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.students-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.graded-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stats-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}
</style>