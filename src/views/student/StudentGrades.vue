<template>
  <div class="grades-container">
    <div class="page-header">
      <h2>我的成绩</h2>
      <p class="page-desc">查看毕业设计各阶段成绩和导师反馈</p>
    </div>

    <!-- 成绩概览卡片 -->
    <div class="grade-overview">
      <div class="overview-card final-grade" :class="{ 'has-grade': finalGrade }">
        <div class="card-header">
          <el-icon class="card-icon"><Trophy /></el-icon>
          <span class="card-title">最终成绩</span>
        </div>
        <div class="card-content">
          <div class="grade-display">
            <span class="grade-value">
              {{ finalGrade ? finalGrade.finalScore : '--' }}
            </span>
            <span class="grade-unit">分</span>
          </div>
          <div class="grade-level" v-if="finalGrade">
            {{ getGradeLevel(finalGrade.finalScore) }}
          </div>
          <div class="grade-time" v-if="finalGrade">
            计算时间：{{ formatDate(finalGrade.calculatedAt) }}
          </div>
        </div>
      </div>

      <div class="overview-card thesis-grade" :class="{ 'has-grade': thesisGrade }">
        <div class="card-header">
          <el-icon class="card-icon"><Document /></el-icon>
          <span class="card-title">论文成绩</span>
        </div>
        <div class="card-content">
          <div class="grade-display">
            <span class="grade-value">
              {{ thesisGrade ? thesisGrade.thesisScore : '--' }}
            </span>
            <span class="grade-unit">分</span>
          </div>
          <div class="grade-level" v-if="thesisGrade">
            {{ getGradeLevel(thesisGrade.thesisScore) }}
          </div>
        </div>
      </div>

      <div class="overview-card defense-grade" :class="{ 'has-grade': defenseGrade }">
        <div class="card-header">
          <el-icon class="card-icon"><ChatSquare /></el-icon>
          <span class="card-title">答辩成绩</span>
        </div>
        <div class="card-content">
          <div class="grade-display">
            <span class="grade-value">
              {{ defenseGrade ? defenseGrade.score : '--' }}
            </span>
            <span class="grade-unit">分</span>
          </div>
          <div class="grade-level" v-if="defenseGrade">
            {{ getGradeLevel(defenseGrade.score) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 详细成绩信息 -->
    <div class="grade-details">
      <!-- 论文成绩详情 -->
      <el-card class="detail-card" v-if="thesisGrade">
        <template #header>
          <div class="card-header-content">
            <el-icon><Document /></el-icon>
            <span>论文成绩详情</span>
          </div>
        </template>
        <div class="detail-content">
          <div class="score-section">
            <div class="score-info">
              <span class="score-label">成绩：</span>
              <span class="score-value">{{ thesisGrade.thesisScore }}分</span>
              <el-tag :type="getScoreTagType(thesisGrade.thesisScore)" class="grade-tag">
                {{ getGradeLevel(thesisGrade.thesisScore) }}
              </el-tag>
            </div>
            <div class="score-info" v-if="thesisGrade.scoredAt">
              <span class="score-label">评分时间：</span>
              <span class="score-time">{{ formatDate(thesisGrade.scoredAt) }}</span>
            </div>
          </div>
          <div class="remarks-section" v-if="thesisGrade.remarks">
            <div class="section-title">导师评语：</div>
            <div class="remarks-content">
              {{ thesisGrade.remarks }}
            </div>
          </div>
          <div class="empty-remarks" v-else>
            <el-empty :image-size="60" description="暂无导师评语" />
          </div>
        </div>
      </el-card>

      <!-- 答辩成绩详情 -->
      <el-card class="detail-card" v-if="defenseGrade">
        <template #header>
          <div class="card-header-content">
            <el-icon><ChatSquare /></el-icon>
            <span>答辩成绩详情</span>
          </div>
        </template>
        <div class="detail-content">
          <div class="score-section">
            <div class="score-info">
              <span class="score-label">成绩：</span>
              <span class="score-value">{{ defenseGrade.score }}分</span>
              <el-tag :type="getScoreTagType(defenseGrade.score)" class="grade-tag">
                {{ getGradeLevel(defenseGrade.score) }}
              </el-tag>
            </div>
            <div class="score-info" v-if="defenseGrade.scoredAt">
              <span class="score-label">评分时间：</span>
              <span class="score-time">{{ formatDate(defenseGrade.scoredAt) }}</span>
            </div>
          </div>
          <div class="remarks-section" v-if="defenseGrade.comments">
            <div class="section-title">答辩评语：</div>
            <div class="remarks-content">
              {{ defenseGrade.comments }}
            </div>
          </div>
          <div class="empty-remarks" v-else>
            <el-empty :image-size="60" description="暂无答辩评语" />
          </div>
        </div>
      </el-card>

      <!-- 成绩进度 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header-content">
            <el-icon><SuccessFilled /></el-icon>
            <span>评分进度</span>
          </div>
        </template>
        <div class="progress-content">
          <el-steps :active="currentStep" align-center>
            <el-step 
              title="论文评分" 
              :icon="thesisGrade ? SuccessFilled : null"
              :status="thesisGrade ? 'success' : 'wait'"
            >
              <template #description>
                <div v-if="thesisGrade">
                  已完成 - {{ thesisGrade.thesisScore }}分
                </div>
                <div v-else>等待导师评分</div>
              </template>
            </el-step>
            <el-step 
              title="答辩评分" 
              :icon="defenseGrade ? SuccessFilled : null"
              :status="defenseGrade ? 'success' : 'wait'"
            >
              <template #description>
                <div v-if="defenseGrade">
                  已完成 - {{ defenseGrade.score }}分
                </div>
                <div v-else>等待答辩完成</div>
              </template>
            </el-step>
            <el-step 
              title="最终成绩" 
              :icon="finalGrade ? SuccessFilled : null"
              :status="finalGrade ? 'success' : 'wait'"
            >
              <template #description>
                <div v-if="finalGrade">
                  已生成 - {{ finalGrade.finalScore }}分
                </div>
                <div v-else>等待成绩计算</div>
              </template>
            </el-step>
          </el-steps>
        </div>
      </el-card>

      <!-- 成绩统计图表 -->
      <el-card class="detail-card" v-if="hasAnyGrade">
        <template #header>
          <div class="card-header-content">
            <el-icon><TrendCharts /></el-icon>
            <span>成绩分析</span>
          </div>
        </template>
        <div class="chart-content">
          <div ref="gradeChart" class="grade-chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!hasAnyGrade && !loading">
      <el-empty
        :image-size="120"
        description="暂无成绩信息"
      >
        <template #description>
          <p>您的成绩还未公布</p>
          <p>请耐心等待导师评分</p>
        </template>
      </el-empty>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getThesisGrade,
  getDefenseGrade,
  getFinalGrade,
 } from '@/api/grades'
import * as echarts from 'echarts'
import {
  Trophy,
  Document,
  ChatSquare,
  SuccessFilled,
  TrendCharts
} from '@element-plus/icons-vue'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const thesisGrade = ref(null)
const defenseGrade = ref(null)
const finalGrade = ref(null)
const gradeChart = ref(null)
const chartInstance = ref(null)

// 计算属性
const hasAnyGrade = computed(() => {
  return thesisGrade.value || defenseGrade.value || finalGrade.value
})

const currentStep = computed(() => {
  if (finalGrade.value) return 3
  if (defenseGrade.value) return 2
  if (thesisGrade.value) return 1
  return 0
})

// 方法
const loadGrades = async () => {
  loading.value = true
  try {
    const studentId = userStore.user.userId
    if (!studentId) {
      ElMessage.error('获取用户信息失败')
      return
    }

    // 并发请求所有成绩信息
    const [thesisRes, defenseRes, finalRes] = await Promise.allSettled([
      getThesisGrade(studentId),
      getDefenseGrade(studentId),
      getFinalGrade(studentId)
    ])
    console.log('====================================');
    console.log(thesisRes, defenseRes, finalRes);
    console.log('====================================');

    // 处理论文成绩
    if (thesisRes.status === 'fulfilled' && thesisRes.value.thesisScore) {
      thesisGrade.value = thesisRes.value
    }

    // 处理答辩成绩
    if (defenseRes.status === 'fulfilled' && defenseRes.value.score) {
      defenseGrade.value = defenseRes.value
    }

    // 处理最终成绩
    if (finalRes.status === 'fulfilled' && finalRes.value.finalScore) {
      finalGrade.value = finalRes.value
    }

    // 如果有成绩数据，渲染图表
    if (hasAnyGrade.value) {
      await nextTick()
      renderChart()
    }

  } catch (error) {
    console.error('加载成绩失败:', error)
    ElMessage.error('加载成绩信息失败')
  } finally {
    loading.value = false
  }
}

const getGradeLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
}

const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const renderChart = () => {
  if (!gradeChart.value) return

  const chartData = []
  const categories = []

  if (thesisGrade.value) {
    chartData.push(thesisGrade.value.thesisScore)
    categories.push('论文成绩')
  }

  if (defenseGrade.value) {
    chartData.push(defenseGrade.value.score)
    categories.push('答辩成绩')
  }

  if (finalGrade.value) {
    chartData.push(finalGrade.value.finalScore)
    categories.push('最终成绩')
  }

  if (chartData.length === 0) return

  // 销毁已存在的图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  chartInstance.value = echarts.init(gradeChart.value)

  const option = {
    title: {
      text: '成绩分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `${param.name}: ${param.value}分`
      }
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#e6e6e6'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}分'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '成绩',
        type: 'bar',
        data: chartData.map(score => ({
          value: score,
          itemStyle: {
            color: score >= 90 ? '#67C23A' : 
                   score >= 80 ? '#409EFF' : 
                   score >= 70 ? '#E6A23C' : 
                   score >= 60 ? '#909399' : '#F56C6C'
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}分',
          color: '#666'
        }
      }
    ]
  }

  chartInstance.value.setOption(option)
}

// 窗口调整时重新调整图表大小
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 组件挂载
onMounted(() => {
  loadGrades()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.grades-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.grade-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.overview-card.has-grade {
  border-color: #409eff;
}

.overview-card.final-grade.has-grade {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 20px;
  margin-right: 8px;
}

.final-grade .card-icon {
  color: #f7ba2a;
}

.thesis-grade .card-icon {
  color: #409eff;
}

.defense-grade .card-icon {
  color: #67c23a;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.grade-display {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.grade-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin-right: 4px;
}

.grade-unit {
  font-size: 14px;
  color: #909399;
}

.grade-level {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 4px;
}

.grade-time {
  font-size: 12px;
  color: #c0c4cc;
}

.grade-details {
  display: grid;
  gap: 20px;
}

.detail-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header-content {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.card-header-content .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.detail-content {
  padding: 4px 0;
}

.score-section {
  margin-bottom: 20px;
}

.score-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.score-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.score-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.score-time {
  color: #909399;
}

.grade-tag {
  margin-left: 8px;
}

.remarks-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.section-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  font-size: 14px;
}

.remarks-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-remarks {
  text-align: center;
  padding: 20px;
}

.progress-content {
  padding: 20px 0;
}

.chart-content {
  padding: 20px 0;
}

.grade-chart {
  width: 100%;
  height: 300px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .el-empty {
  padding: 40px 0;
}

.empty-state p {
  margin: 8px 0;
  color: #909399;
}

.loading-state {
  padding: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grades-container {
    padding: 16px;
  }
  
  .grade-overview {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    padding: 20px;
  }
  
  .grade-value {
    font-size: 28px;
  }
}
</style>