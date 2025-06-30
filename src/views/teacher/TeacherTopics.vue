<template>
  <div class="teacher-topics">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        发布新选题
      </el-button>
      <el-button @click="refreshTopics">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 选题列表 -->
    <el-card>
      <el-table :data="topics" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="选题标题" min-width="200" />
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag :type="getDifficultyTagType(scope.row.difficulty)">
              {{ scope.row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="direction" label="方向" width="120" />
        <el-table-column label="选择状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.isSelected" type="success">已选择</el-tag>
            <el-tag v-else type="info">未选择</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="selectedStudentName" label="选择学生" width="120" />
        <el-table-column prop="selectionDate" label="选择时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewTopic(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="editTopic(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteTopicc(scope.row)"
              :disabled="scope.row.isSelected"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑选题对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑选题' : '发布新选题'" 
      v-model="showCreateDialog"
      width="600px"
    >
      <el-form :model="topicForm" :rules="topicRules" ref="topicFormRef" label-width="80px">
        <el-form-item label="选题标题" prop="title">
          <el-input v-model="topicForm.title" placeholder="请输入选题标题" maxlength="200" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="topicForm.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="简单" />
            <el-option label="中等" value="中等" />
            <el-option label="困难" value="困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="研究方向" prop="direction">
          <el-input v-model="topicForm.direction" placeholder="请输入研究方向" maxlength="100" />
        </el-form-item>
        <el-form-item label="详细内容" prop="content">
          <el-input 
            type="textarea" 
            v-model="topicForm.content" 
            :rows="6"
            placeholder="请输入选题的详细内容、要求等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTopic" :loading="submitting">
          {{ isEditing ? '更新' : '发布' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 选题详情对话框 -->
    <el-dialog title="选题详情" v-model="showDetailDialog" width="600px">
      <div v-if="selectedTopic">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="选题标题">{{ selectedTopic.title }}</el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-tag :type="getDifficultyTagType(selectedTopic.difficulty)">
              {{ selectedTopic.difficulty }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="研究方向">{{ selectedTopic.direction }}</el-descriptions-item>
          <el-descriptions-item label="选择状态">
            <el-tag v-if="selectedTopic.isSelected" type="success">已选择</el-tag>
            <el-tag v-else type="info">未选择</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="选择学生" v-if="selectedTopic.isSelected">
            {{ selectedTopic.selectedStudentName }}
          </el-descriptions-item>
          <el-descriptions-item label="选择时间" v-if="selectedTopic.isSelected">
            {{ selectedTopic.selectionDate }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px;">
          <h4>详细内容：</h4>
          <div style="background: #f5f7fa; padding: 15px; border-radius: 4px;">
            {{ selectedTopic.content }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getMyTopics,
  deleteTopic,
  createTopic,
  updateTopic } from '@/api/topics'
import { Plus, Refresh } from '@element-plus/icons-vue'

const userStore = useUserStore()

const topics = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const selectedTopic = ref(null)
const topicFormRef = ref(null)

const topicForm = ref({
  title: '',
  difficulty: '',
  direction: '',
  content: ''
})

const topicRules = {
  title: [
    { required: true, message: '请输入选题标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  direction: [
    { max: 100, message: '研究方向长度不能超过100个字符', trigger: 'blur' }
  ]
}

// 获取选题列表
const fetchTopics = async () => {
  loading.value = true
  try {
    const response = await getMyTopics(userStore.user.userId)
    topics.value = response
  } catch (error) {
    ElMessage.error('获取选题列表失败')
  } finally {
    loading.value = false
  }
}

// 获取难度标签类型
const getDifficultyTagType = (difficulty) => {
  switch (difficulty) {
    case '简单': return 'success'
    case '中等': return 'warning'
    case '困难': return 'danger'
    default: return 'info'
  }
}

// 查看选题详情
const viewTopic = (topic) => {
  selectedTopic.value = topic
  showDetailDialog.value = true
}

// 编辑选题
const editTopic = (topic) => {
  isEditing.value = true
  topicForm.value = {
    topicId: topic.topicId,
    title: topic.title,
    difficulty: topic.difficulty,
    direction: topic.direction,
    content: topic.content
  }
  showCreateDialog.value = true
}

// 删除选题
const deleteTopicc = async (topic) => {
  if (topic.isSelected) {
    ElMessage.warning('已被选择的选题不能删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个选题吗？', '确认删除', {
      type: 'warning'
    })
    
    await deleteTopic(topic.topicId)
    ElMessage.success('删除成功')
    fetchTopics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交选题
const submitTopic = async () => {
  if (!topicFormRef.value) return
  
  try {
    await topicFormRef.value.validate()
    submitting.value = true
    
    if (isEditing.value) {
      await updateTopic(topicForm.value)
      ElMessage.success('更新成功')
    } else {
      await createTopic(topicForm.value)
      ElMessage.success('发布成功')
    }
    
    showCreateDialog.value = false
    resetForm()
    fetchTopics()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  isEditing.value = false
  topicForm.value = {
    title: '',
    difficulty: '',
    direction: '',
    content: ''
  }
  if (topicFormRef.value) {
    topicFormRef.value.resetFields()
  }
}

// 刷新选题列表
const refreshTopics = () => {
  fetchTopics()
}

onMounted(() => {
  fetchTopics()
})
</script>

<style scoped>
.teacher-topics {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}
</style>