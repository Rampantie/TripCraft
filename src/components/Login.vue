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
                <label for="username" class="form-label">用户名</label>
                <input 
                  id="username"
                  v-model="loginForm.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名"
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
                <a href="#" class="forgot-password">忘记密码？</a>
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

export default {
  name: 'Login',
  components: {
    Navbar
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      isLoading: false
    }
  },
  computed: {
    isFormValid() {
      return this.loginForm.username.trim() && this.loginForm.password.trim();
    }
  },
  methods: {
    async handleLogin() {
      if (!this.isFormValid) return;
      
      this.isLoading = true;
      
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('登录信息:', this.loginForm);
        
        // 这里可以添加实际的登录逻辑
        // 例如调用API验证用户凭据
        
        // 登录成功后跳转到主页
        this.$router.push('/');
        
      } catch (error) {
        console.error('登录失败:', error);
        // 这里可以添加错误处理逻辑
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
