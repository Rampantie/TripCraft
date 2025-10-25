<template>
  <div v-if="show" class="avatar-selector-overlay" @click="handleOverlayClick">
    <div class="avatar-selector-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">选择头像</h3>
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="avatar-grid">
        <div 
          v-for="(avatar, index) in avatarOptions" 
          :key="index"
          class="avatar-option"
          :class="{ 'selected': selectedAvatar === avatar.url }"
          @click="selectAvatar(avatar.url)"
        >
          <img 
            :src="avatar.url" 
            :alt="avatar.name"
            class="avatar-image"
            @error="handleImageError"
          />
          <div class="avatar-overlay">
            <svg v-if="selectedAvatar === avatar.url" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="cancel-btn" @click="handleClose">取消</button>
        <button 
          class="confirm-btn" 
          @click="handleConfirm"
          :disabled="!selectedAvatar"
        >
          确认选择
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AvatarSelector',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'confirm'],
  data() {
    return {
      selectedAvatar: '',
      avatarOptions: [
        {
          name: '头像1',
          url: 'https://picx.zhimg.com/v2-1b4f87cf9650ff53f6ab23c87aea1969_r.jpg'
        },
        {
          name: '头像2',
          url: 'https://pica.zhimg.com/v2-7ea4e45a68c4ff9a19e1c6152c52fbde_1440w.jpg'
        },
        {
          name: '头像3',
          url: 'https://pica.zhimg.com/v2-2c22c7b761469151589be2e666882b88_r.jpg'
        },
        {
          name: '头像4',
          url: 'https://pic4.zhimg.com/v2-395e9fb9ff64b3a73469c3339585f1ff_r.jpg'
        },
        {
          name: '头像5',
          url: 'https://pic3.zhimg.com/v2-40924753195bf15d0a4094af8ba61100_r.jpg'
        },
        {
          name: '头像6',
          url: 'https://pic1.zhimg.com/v2-f03088f9d31cc9fae3ad081ad96b0e14_1440w.jpg'
        },
        {
          name: '头像7',
          url: 'https://pic3.zhimg.com/v2-7a3a3ac23c4b1fbb2202a6bfabc59ef4_1440w.jpg'
        },
        {
          name: '头像8',
          url: 'https://pic1.zhimg.com/v2-17dbe57f567d502a229a741a69024462_1440w.jpg'
        }
      ]
    }
  },
  methods: {
    selectAvatar(url) {
      this.selectedAvatar = url;
    },
    
    handleConfirm() {
      if (this.selectedAvatar) {
        this.$emit('confirm', this.selectedAvatar);
        this.handleClose();
      }
    },
    
    handleClose() {
      this.selectedAvatar = '';
      this.$emit('close');
    },
    
    handleOverlayClick() {
      this.handleClose();
    },
    
    handleImageError(event) {
      console.error('头像加载失败:', event.target.src);
      // 可以设置默认头像或显示错误提示
    }
  }
};
</script>

<style scoped>
.avatar-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.avatar-selector-modal {
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #718096;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #4a5568;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.avatar-option.selected {
  border-color: #667eea;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.2s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-option.selected .avatar-overlay {
  opacity: 1;
}

.avatar-overlay svg {
  color: white;
  width: 24px;
  height: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
  transform: translateY(-1px);
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .avatar-selector-modal {
    padding: 20px;
    margin: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .confirm-btn {
    width: 100%;
  }
}
</style>
