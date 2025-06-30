<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        size="large"
      >
        <el-form-item prop="userId">
          <el-input
            v-model="registerForm.userId"
            placeholder="请输入用户ID"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入姓名"
            prefix-icon="Avatar"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="role">
          <el-select
            v-model="registerForm.role"
            placeholder="请选择角色"
            style="width: 100%"
            @change="handleRoleChange"
          >
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        
        <!-- 学生特有字段 -->
        <template v-if="registerForm.role === 'student'">
          <el-form-item prop="className">
            <el-input
              v-model="registerForm.className"
              placeholder="请输入班级"
              prefix-icon="School"
            />
          </el-form-item>
          
          <el-form-item prop="major">
            <el-input
              v-model="registerForm.major"
              placeholder="请输入专业"
              prefix-icon="Reading"
            />
          </el-form-item>
        </template>
        
        <!-- 教师特有字段 -->
        <template v-if="registerForm.role === 'teacher'">
          <el-form-item prop="department">
            <el-input
              v-model="registerForm.department"
              placeholder="请输入院系"
              prefix-icon="OfficeBuilding"
            />
          </el-form-item>
        </template>
        
        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="links">
          <router-link to="/login" class="login-link">
            已有账号？立即登录
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  userId: '',
  name: '',
  password: '',
  confirmPassword: '',
  role: '',
  className: '',
  major: '',
  department: ''
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入院系', trigger: 'blur' }
  ]
}

const handleRoleChange = () => {
  // 清空角色相关字段
  registerForm.className = ''
  registerForm.major = ''
  registerForm.department = ''
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const userData = { ...registerForm }
    delete userData.confirmPassword
    
    await userStore.register(userData)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
    
  } catch (error) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 450px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.register-form {
  width: 100%;
}

.register-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 600;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.login-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>