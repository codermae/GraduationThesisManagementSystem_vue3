<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <h3>论文管理系统</h3>
        <span class="role-tag">学生端</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :router="true"
        unique-opened
      >
        <el-menu-item index="/student/dashboard">
          <el-icon><House /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
        
        <el-menu-item index="/student/topics">
          <el-icon><Document /></el-icon>
          <span>选题管理</span>
        </el-menu-item>
        
        <el-menu-item index="/student/files">
          <el-icon><Folder /></el-icon>
          <span>文件上传</span>
        </el-menu-item>
        
        <el-menu-item index="/student/grades">
          <el-icon><Edit /></el-icon>
          <span>成绩查看</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主体内容 -->
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="avatarUrl">
                {{ userStore.user?.name?.[0] }}
              </el-avatar>
              <span class="username">{{ userStore.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- 个人资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人资料"
      width="600px"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="80px"
      >
        <el-form-item label="学号">
          <el-input v-model="profileForm.studentId" disabled />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        
        <el-form-item label="班级" prop="className">
          <el-input v-model="profileForm.className" />
        </el-form-item>
        
        <el-form-item label="专业" prop="major">
          <el-input v-model="profileForm.major" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProfilee">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePwd">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  Document,
  Edit,
  Folder,
  ArrowDown
} from '@element-plus/icons-vue'
import { changePassword,updateStudentInfo } from '@/api/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const profileFormRef = ref()
const passwordFormRef = ref()

const activeMenu = computed(() => route.path)
const avatarUrl = ref('')

// 面包屑导航
const breadcrumbs = computed(() => {
  const breadcrumbMap = {
    '/student/dashboard': [{ title: '个人中心', path: '/student/dashboard' }],
    '/student/topics': [{ title: '选题管理', path: '/student/topics' }],
    '/student/files': [{ title: '文件上传', path: '/student/files' }],
    '/student/grades': [{ title: '成绩查看', path: '/student/grades' }],
  }
  
  return breadcrumbMap[route.path] || []
})

// 个人资料表单
const profileForm = reactive({
  studentId: '',
  name: '',
  className: '',
  major: ''
})

const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ]
}

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 初始化个人资料
const initProfile = () => {
  const user = userStore.user
  if (user) {
    profileForm.studentId = user.userId
    profileForm.name = user.name
    profileForm.className = user.className || ''
    profileForm.major = user.major || ''
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      initProfile()
      profileDialogVisible.value = true
      break
    case 'password':
      resetPasswordForm()
      passwordDialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 更新个人资料
const updateProfilee = async () => {
  try {
    await profileFormRef.value.validate()
    
    const updateData = {
      studentId: profileForm.studentId,
      name: profileForm.name,
      className: profileForm.className,
      major: profileForm.major
    }
    
    await updateStudentInfo(updateData)
    
    // 更新本地用户信息
    userStore.updateUserInfo({
      name: profileForm.name,
      className: profileForm.className,
      major: profileForm.major
    })
    
    ElMessage.success('个人资料更新成功')
    profileDialogVisible.value = false
    
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 修改密码
const changePwd = async () => {
  try {
    await passwordFormRef.value.validate()
    
    const passwordData = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }
    
    await changePassword(passwordData)
    
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
    resetPasswordForm()
    
    // 提示用户重新登录
    setTimeout(() => {
      ElMessageBox.confirm('密码已修改，需要重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '稍后',
        type: 'info'
      }).then(() => {
        handleLogout()
      }).catch(() => {
        // 用户选择稍后登录
      })
    }, 1000)
    
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出登录失败')
    }
  }
}

// 监听用户状态变化
watch(() => userStore.user, (newUser) => {
  if (!newUser) {
    router.push('/login')
  }
}, { immediate: true })

// 监听密码对话框关闭
watch(passwordDialogVisible, (visible) => {
  if (!visible) {
    resetPasswordForm()
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  color: white;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #002140;
}

.logo h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 18px;
}

.role-tag {
  font-size: 12px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.65);
  border-bottom: 1px solid #002140;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #1890ff;
  color: white;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #1890ff;
  color: white;
}

.header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-weight: 500;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>