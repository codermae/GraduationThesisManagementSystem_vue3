<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <h3>论文管理系统</h3>
        <span class="role-tag">教师端</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :router="true"
        unique-opened
      >
        <el-menu-item index="/teacher/dashboard">
          <el-icon><House /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/topics">
          <el-icon><Document /></el-icon>
          <span>题目管理</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/grades">
          <el-icon><Edit /></el-icon>
          <span>成绩管理</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/files">
          <el-icon><Folder /></el-icon>
          <span>文件管理</span>
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
        <el-form-item label="教师ID">
          <el-input v-model="profileForm.teacherId" disabled />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        
        <el-form-item label="院系" prop="department">
          <el-input v-model="profileForm.department" />
        </el-form-item>

      </el-form>
      
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProfile">保存</el-button>
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
  User,
  Edit,
  Folder,
  ArrowDown
} from '@element-plus/icons-vue'
import { changePassword,updateTeacherInfo } from '@/api/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const profileFormRef = ref()
const passwordFormRef = ref()

const activeMenu = computed(() => {
  const path = route.path
  
  // 处理动态路由，确保正确匹配菜单项
  if (path.startsWith('/teacher/files')) {
    return '/teacher/files'
  }
  
  // 可以继续添加其他需要处理的动态路由
  if (path.startsWith('/teacher/students/')) {
    return '/teacher/students'
  }
  
  if (path.startsWith('/teacher/topics/')) {
    return '/teacher/topics'
  }
  
  if (path.startsWith('/teacher/grades/')) {
    return '/teacher/grades'
  }
  
  return path
})
const avatarUrl = ref('')

// 面包屑导航
const breadcrumbs = computed(() => {
  const path = route.path
  const breadcrumbMap = {
    '/teacher/dashboard': [{ title: '工作台', path: '/teacher/dashboard' }],
    '/teacher/topics': [{ title: '题目管理', path: '/teacher/topics' }],
    '/teacher/students': [{ title: '学生管理', path: '/teacher/students' }],
    '/teacher/grades': [{ title: '成绩管理', path: '/teacher/grades' }],
    '/teacher/files': [{ title: '文件管理', path: '/teacher/files' }],
  }
  // 处理动态路由的面包屑
  if (path.startsWith('/teacher/files/')) {
    const studentId = route.params.studentId
    return [
      { title: '文件管理', path: '/teacher/files' },
      { title: `学生文件 (${studentId})`, path: path }
    ]
  }
  
  return breadcrumbMap[route.path] || []
})

// 个人资料表单
const profileForm = reactive({
  teacherId: '',
  name: '',
  department: '',
  password: ''
})

const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入院系', trigger: 'blur' }
  ],
  password: [
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 初始化个人资料
const initProfile = () => {
  const user = userStore.user
  if (user) {
    profileForm.teacherId = user.userId
    profileForm.name = user.name
    profileForm.department = user.department || ''
  }
}
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
const updateProfile = async () => {
  try {
    await profileFormRef.value.validate()
    
    const updateData = {
      teacherId: profileForm.teacherId,
      name: profileForm.name,
      department: profileForm.department
    }
    
    if (profileForm.password) {
      updateData.password = profileForm.password
    }
    
    await updateTeacherInfo(updateData)
    
    // 更新本地用户信息
    userStore.updateUserInfo({
      name: profileForm.name,
      department: profileForm.department
    })
    
    ElMessage.success('个人资料更新成功')
    profileDialogVisible.value = false
    profileForm.password = ''
    
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
  background-color: #304156;
  color: white;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.logo h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 18px;
}

.role-tag {
  font-size: 12px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid #434a50;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #434a50;
  color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
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