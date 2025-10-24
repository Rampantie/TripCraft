<template>
  <div class="register-page">
    <!-- 顶部导航栏 -->
    <Navbar />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <div class="register-container">
          <div class="register-card">
            <div class="register-header">
              <h2 class="register-title">创建账户</h2>
              <p class="register-subtitle">使用邮箱注册，用户名将自动生成</p>
            </div>
            
            <form @submit.prevent="handleRegister" class="register-form">
              <div class="form-group">
                <label for="email" class="form-label">邮箱</label>
                <input 
                  id="email"
                  v-model="registerForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="password" class="form-label">密码</label>
                <input 
                  id="password"
                  v-model="registerForm.password"
                  type="password"
                  class="form-input"
                  placeholder="请输入密码（至少8位）"
                  required
                  minlength="8"
                />
              </div>
              
              <div class="form-group">
                <label for="confirmPassword" class="form-label">确认密码</label>
                <input 
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="请再次输入密码"
                  required
                />
                <div v-if="passwordMismatch" class="error-message">
                  密码不匹配
                </div>
              </div>
              
              <div class="form-options">
                <label class="checkbox-container">
                  <input 
                    v-model="registerForm.agreeTerms"
                    type="checkbox"
                    class="checkbox-input"
                    required
                  />
                  <span class="checkbox-label">
                    我同意 
                    <a href="#" class="terms-link">服务条款</a> 
                    和 
                    <a href="#" class="terms-link">隐私政策</a>
                  </span>
                </label>
              </div>
              
              <button 
                type="submit"
                class="register-btn"
                :disabled="!isFormValid"
                :class="{ 'loading': isLoading }"
              >
                <span v-if="!isLoading">创建账户</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </form>

            <!-- 错误消息 -->
            <div v-if="errorMessage" class="message error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ errorMessage }}</span>
              <button @click="clearMessages" class="close-btn">×</button>
            </div>

            <!-- 成功消息 -->
            <div v-if="showSuccess && successMessage" class="message success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ successMessage }}</span>
              <div class="success-details">
                <p>正在跳转到登录页面...</p>
              </div>
            </div>
            
            <div class="register-footer">
              <p class="login-text">
                已有账户？ 
                <router-link to="/login" class="login-link">立即登录</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import { auth, userProfile } from '../utils/supabase.js';

export default {
  name: 'Register',
  components: {
    Navbar
  },
  data() {
    return {
      registerForm: {
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      showSuccess: false
    }
  },
  computed: {
    passwordMismatch() {
      return this.registerForm.password && 
             this.registerForm.confirmPassword && 
             this.registerForm.password !== this.registerForm.confirmPassword;
    },
    isFormValid() {
      return this.registerForm.email.trim() && 
             this.registerForm.password.trim() && 
             this.registerForm.confirmPassword.trim() &&
             !this.passwordMismatch &&
             this.registerForm.agreeTerms;
    }
  },
  methods: {
    async handleRegister() {
      if (!this.isFormValid) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.showSuccess = false;
      
      try {
        // 使用 Supabase 进行用户注册
        const registerResult = await auth.signUp({
          email: this.registerForm.email,
          password: this.registerForm.password
        });

        if (registerResult.success) {
          // 注册成功，显示成功消息
          this.successMessage = registerResult.message;
          this.showSuccess = true;
          
          // 3秒后跳转到登录页面
          setTimeout(() => {
            this.$router.push('/login');
          }, 3000);
        } else {
          this.errorMessage = registerResult.message;
        }
        
      } catch (error) {
        console.error('注册失败:', error);
        this.errorMessage = '注册失败，请重试';
      } finally {
        this.isLoading = false;
      }
    },

    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
      this.showSuccess = false;
    }
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.main-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 40px 24px;
}

.container {
  max-width: 450px;
  width: 100%;
}

.register-container {
  display: flex;
  justify-content: center;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 16px;
  color: #666;
  font-weight: 400;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.error-message {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
}

.form-options {
  margin: 8px 0;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #5a67d8;
}

.register-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-btn.loading {
  pointer-events: none;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
}

.login-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #5a67d8;
}

/* 消息样式 */
.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
}

.message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.success-details {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.success-details p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .register-card {
    padding: 32px 24px;
  }
  
  .register-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px 20px;
  }
  
  .register-title {
    font-size: 22px;
  }
}
</style>
