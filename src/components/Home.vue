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
            <span class="voice-text">正在录制语音...</span>
          </div>
          
          <!-- 识别状态显示 -->
          <div v-if="isProcessing" class="processing-status">
            <div class="processing-animation">
              <div class="processing-dot"></div>
              <div class="processing-dot"></div>
              <div class="processing-dot"></div>
            </div>
            <span class="processing-text">正在识别语音...</span>
          </div>
          
          <!-- 错误信息显示 -->
          <div v-if="errorMessage" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import xunfeiSpeech from '../utils/xunfeiSpeech.js';

export default {
  name: 'Home',
  components: {
    Navbar
  },
  data() {
    return {
      userInput: '',
      isRecording: false,
      isProcessing: false, // 是否正在处理语音识别
      errorMessage: '', // 错误信息
      audioChunks: [], // 存储录音数据
      isVoiceSupported: true // 语音功能支持状态
    }
  },
  mounted() {
    // 延迟初始化语音识别，避免阻塞渲染
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkVoiceSupport();
        this.initXunfeiSpeech();
      }, 100);
    });
  },
  methods: {
    checkVoiceSupport() {
      // 检查浏览器是否支持录音功能
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.isVoiceSupported = false;
        console.warn('浏览器不支持录音功能');
      } else {
        this.isVoiceSupported = true;
      }
    },
    initXunfeiSpeech() {
      // 初始化科大讯飞语音识别回调
      xunfeiSpeech.setCallbacks({
        onResult: (text) => {
          console.log('识别结果:', text);
          this.userInput = text;
          this.isProcessing = false;
        },
        onError: (error) => {
          console.error('❌ [科大讯飞API] 语音识别错误:', error);
          this.errorMessage = error.message || '语音识别失败';
          this.isProcessing = false;
          
          // 如果是API路由错误，提示用户使用浏览器内置API
          if (error.message && error.message.includes('10404')) {
            console.log('⚠️ [API切换] 科大讯飞API不可用，切换到浏览器原生API');
            this.errorMessage = '科大讯飞API暂时不可用，正在尝试使用浏览器内置语音识别...';
            setTimeout(() => {
              this.useBrowserSpeechAPI();
            }, 1000);
          }
        }
      });
    },
    async toggleVoiceInput() {
      // 检查浏览器支持
      if (!this.isVoiceSupported) {
        this.errorMessage = '您的浏览器不支持录音功能，请使用Chrome、Edge等现代浏览器';
        return;
      }

      if (this.isRecording) {
        // 停止录音
        this.stopRecording();
      } else {
        // 开始录音
        await this.startRecording();
      }
    },
    
    async startRecording() {
      try {
        // 检查浏览器支持
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('浏览器不支持录音功能');
        }

        // 获取麦克风权限
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            sampleSize: 16
          } 
        });

        // 创建MediaRecorder
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        this.audioChunks = [];
        this.isRecording = true;
        this.errorMessage = '';

        // 收集音频数据
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        // 录音结束后处理
        this.mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          this.isRecording = false;
          
          if (this.audioChunks.length > 0) {
            this.isProcessing = true;
            await this.processAudio();
          }
        };

        // 开始录音
        this.mediaRecorder.start();
        console.log('开始录音');

      } catch (error) {
        console.error('开始录音失败:', error);
        this.errorMessage = error.message || '无法启动录音功能';
        this.isRecording = false;
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        console.log('停止录音');
      }
    },
    
    async processAudio() {
      try {
        // 合并音频数据
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        console.log('音频大小:', audioBlob.size, 'bytes');
        
        // 发送到科大讯飞API进行识别
        await xunfeiSpeech.recognizeAudio(audioBlob);
        
      } catch (error) {
        console.error('处理音频失败:', error);
        this.errorMessage = error.message || '音频处理失败';
        this.isProcessing = false;
      }
    },
    
    useBrowserSpeechAPI() {
      console.log('🌐 [浏览器原生API] 使用浏览器原生语音识别API作为备用方案');
      // 使用浏览器内置的Web Speech API作为备用方案
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        this.errorMessage = '浏览器不支持语音识别功能';
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log('🎤 [浏览器原生API] 开始语音识别');
        this.isRecording = true;
        this.errorMessage = '';
      };

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log('✅ [浏览器原生API] 识别结果:', result);
        this.userInput = result;
        this.isRecording = false;
      };

      recognition.onerror = (event) => {
        console.error('❌ [浏览器原生API] 语音识别错误:', event.error);
        this.errorMessage = '语音识别失败: ' + event.error;
        this.isRecording = false;
      };

      recognition.onend = () => {
        console.log('🔚 [浏览器原生API] 语音识别结束');
        this.isRecording = false;
      };

      recognition.start();
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

/* 处理状态显示 */
.processing-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.processing-animation {
  display: flex;
  align-items: center;
  gap: 4px;
}

.processing-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: processing 1.4s infinite ease-in-out;
}

.processing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.processing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes processing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.processing-text {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

/* 错误信息样式 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  border-left: 4px solid #ef4444;
  color: #ef4444;
  font-size: 14px;
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
