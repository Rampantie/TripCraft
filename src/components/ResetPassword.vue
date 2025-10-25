<template>
  <div class="reset-password-page">
    <div class="container">
      <div class="reset-password-card">
        <div class="card-header">
          <h1 class="page-title">重置密码</h1>
          <p class="page-subtitle">请输入您的新密码</p>
        </div>

        <form @submit.prevent="handleSubmit" class="reset-password-form">
          <div class="form-group">
            <label for="password" class="form-label">新密码</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-input"
              placeholder="请输入新密码"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认新密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              class="form-input"
              placeholder="请再次输入新密码"
              required
              minlength="6"
            />
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isLoading || !isFormValid"
          >
            {{ isLoading ? '重置中...' : '重置密码' }}
          </button>
        </form>

        <div class="form-footer">
          <p class="back-to-login">
            重置成功？
            <router-link to="/login" class="login-link">返回登录</router-link>
          </p>
        </div>

        <!-- 消息提示 -->
        <div v-if="message" class="message" :class="{ 'success': isSuccess, 'error': !isSuccess }">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../utils/supabase.js';

export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      confirmPassword: '',
      isLoading: false,
      message: '',
      isSuccess: false
    }
  },
  computed: {
    isFormValid() {
      return this.password.length >= 6 && 
             this.confirmPassword.length >= 6 && 
             this.password === this.confirmPassword;
    }
  },
  async mounted() {
    // 检查是否有有效的重置会话
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      this.showMessage('重置链接无效或已过期，请重新申请密码重置', false);
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isFormValid) {
        this.showMessage('密码长度至少6位且两次输入必须一致', false);
        return;
      }

      this.isLoading = true;
      this.message = '';

      try {
        const { error } = await supabase.auth.updateUser({
          password: this.password
        });

        if (error) {
          throw error;
        }

        this.showMessage('密码重置成功！请使用新密码登录', true);
        
        // 3秒后跳转到登录页面
        setTimeout(() => {
          this.$router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('重置密码失败:', error);
        this.showMessage('重置失败，请重试', false);
      } finally {
        this.isLoading = false;
      }
    },

    showMessage(text, success) {
      this.message = text;
      this.isSuccess = success;
      
      if (success) {
        setTimeout(() => {
          this.message = '';
        }, 5000);
      }
    }
  }
};
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 400px;
}

.reset-password-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.reset-password-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-footer {
  text-align: center;
}

.back-to-login {
  color: #718096;
  font-size: 14px;
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

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
</style>
