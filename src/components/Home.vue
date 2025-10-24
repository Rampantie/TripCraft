<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <Navbar @avatar-click="handleAvatarClick" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <div class="welcome-section">
          <h2 class="welcome-title">欢迎使用 TripCraft</h2>
          <p class="welcome-subtitle">您的智能旅行规划助手</p>
        </div>
        
        <div class="input-section">
          <div class="input-container">
            <div class="input-wrapper">
              <button 
                class="voice-btn"
                @click="toggleVoiceInput"
                :class="{ 'recording': isRecording, 'disabled': !isVoiceSupported }"
                :disabled="!isVoiceSupported"
                title="语音输入"
              >
                <svg v-if="!isRecording" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C13.1 1 14 1.9 14 3V11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11V3C10 1.9 10.9 1 12 1Z" fill="currentColor"/>
                  <path d="M19 10V11C19 15.4 15.4 19 11 19H13V21H11C6.6 21 3 17.4 3 13V10H5V13C5 16.3 7.7 19 11 19C14.3 19 17 16.3 17 13V10H19Z" fill="currentColor"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                </svg>
              </button>
              <textarea 
                v-model="userInput"
                placeholder="请描述您的旅行需求，例如：我想去日本旅行7天，预算1万元..."
                class="main-input"
                rows="4"
                @keydown.enter.prevent="handleSubmit"
              ></textarea>
            </div>
            <button 
              class="submit-btn"
              @click="handleSubmit"
              :disabled="!userInput.trim()"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div v-if="isRecording" class="voice-status">
            <div class="voice-animation">
              <div class="voice-wave"></div>
              <div class="voice-wave"></div>
              <div class="voice-wave"></div>
            </div>
            <span class="voice-text">正在听取您的语音...</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';

export default {
  name: 'Home',
  components: {
    Navbar
  },
  data() {
    return {
      userInput: '',
      isRecording: false,
      isVoiceSupported: false,
      recognition: null
    }
  },
  mounted() {
    this.initVoiceRecognition();
  },
  methods: {
    initVoiceRecognition() {
      // 检查浏览器是否支持语音识别
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        this.isVoiceSupported = true;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'zh-CN';
        
        this.recognition.onstart = () => {
          this.isRecording = true;
        };
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.userInput = transcript;
          this.isRecording = false;
        };
        
        this.recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error);
          this.isRecording = false;
        };
        
        this.recognition.onend = () => {
          this.isRecording = false;
        };
      }
    },
    toggleVoiceInput() {
      if (!this.isVoiceSupported) {
        alert('您的浏览器不支持语音识别功能');
        return;
      }
      
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    },
    handleSubmit() {
      if (this.userInput.trim()) {
        console.log('用户输入:', this.userInput);
        // 跳转到旅行规划页面，并传递用户输入
        this.$router.push({
          path: '/planning',
          query: { request: this.userInput }
        });
      }
    },
    handleAvatarClick() {
      console.log('用户头像被点击');
      // 这里可以添加用户头像点击的处理逻辑
      // 例如显示用户菜单或跳转到用户设置页面
    }
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  color: #333;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 40px 24px;
}

.container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.welcome-section {
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* 输入区域 */
.input-section {
  width: 100%;
}

.input-container {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.input-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.voice-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  flex-shrink: 0;
}

.voice-btn:hover:not(.disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.voice-btn.recording {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  animation: pulse 1.5s infinite;
}

.voice-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.8);
  }
  100% {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
}

.main-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background: transparent;
  resize: none;
  font-family: inherit;
}

.main-input::placeholder {
  color: #999;
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.voice-animation {
  display: flex;
  align-items: center;
  gap: 4px;
}

.voice-wave {
  width: 4px;
  height: 20px;
  background: #667eea;
  border-radius: 2px;
  animation: wave 1.2s infinite ease-in-out;
}

.voice-wave:nth-child(2) {
  animation-delay: 0.2s;
}

.voice-wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

.voice-text {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.submit-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }
  
  .welcome-subtitle {
    font-size: 18px;
  }
  
  .input-container {
    padding: 20px;
  }
  
  .input-wrapper {
    gap: 8px;
  }
  
  .voice-btn {
    width: 40px;
    height: 40px;
  }
  
  .main-content {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 28px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
  }
  
  .input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .voice-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
}
</style>
