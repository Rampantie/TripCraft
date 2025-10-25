<template>
  <div class="login-page">
    <!-- 顶部导航栏 -->
    <Navbar />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <div class="login-container">
          <div class="login-card">
            <div class="login-header">
              <h2 class="login-title">欢迎回来</h2>
              <p class="login-subtitle">请登录您的账户</p>
            </div>
            
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="email" class="form-label">邮箱</label>
                <input 
                  id="email"
                  v-model="loginForm.email"
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
                  v-model="loginForm.password"
                  type="password"
                  class="form-input"
                  placeholder="请输入密码"
                  required
                />
              </div>
              
              <div class="form-options">
                <label class="checkbox-container">
                  <input 
                    v-model="loginForm.rememberMe"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-label">记住我</span>
                </label>
                <router-link to="/forgot-password" class="forgot-password">忘记密码？</router-link>
              </div>
              
              <button 
                type="submit"
                class="login-btn"
                :disabled="!isFormValid"
                :class="{ 'loading': isLoading }"
              >
                <span v-if="!isLoading">登录</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </form>

            <!-- 错误消息 -->
            <div v-if="errorMessage" class="message error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- 成功消息 -->
            <div v-if="successMessage" class="message success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ successMessage }}</span>
            </div>
            
            <div class="login-footer">
              <p class="signup-text">
                还没有账户？ 
                <router-link to="/register" class="signup-link">立即注册</router-link>
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
import { useAuthStore } from '../stores/auth.js';
import { auth, userProfile } from '../utils/supabase.js';

export default {
  name: 'Login',
  components: {
    Navbar
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        rememberMe: false
      },
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return this.loginForm.email.trim() && this.loginForm.password.trim();
    }
  },
  methods: {
    async handleLogin() {
      if (!this.isFormValid) return;

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // 使用 Supabase 进行用户登录
        const loginResult = await auth.signIn(
          this.loginForm.email,
          this.loginForm.password
        );

        if (loginResult.success) {
          const user = loginResult.data.user;

          // 登录成功，检查用户档案是否存在
          try {
            const profileResult = await userProfile.getProfile(user.id);

            if (!profileResult.success) {
              // 如果用户档案不存在，创建一个
              // 从邮箱中提取用户名（@符号前的部分）
              const username = user.email.split('@')[0];
              await userProfile.createProfile({
                user_id: user.id,
                username: username,
                email: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }

            // 更新认证状态
            await this.authStore.login(user);

            this.successMessage = '登录成功！';
            setTimeout(() => {
              this.$router.push('/');
            }, 1000);
          } catch (profileError) {
            console.error('处理用户档案失败:', profileError);
            // 即使档案处理失败，也更新登录状态
            await this.authStore.login(user);
            this.successMessage = '登录成功！';
            setTimeout(() => {
              this.$router.push('/');
            }, 1000);
          }
        } else {
          this.errorMessage = loginResult.message;
        }
      } catch (error) {
        console.error('登录失败:', error);
        this.errorMessage = '登录失败，请重试';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
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
  max-width: 400px;
  width: 100%;
}

.login-container {
  display: flex;
  justify-content: center;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
}

.forgot-password {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #5a67d8;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn.loading {
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

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
}

.signup-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.signup-link:hover {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .login-card {
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
}
</style>
