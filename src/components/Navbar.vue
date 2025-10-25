<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand" @click="goToHome">
        <h1>{{ brandName }}</h1>
      </div>
        <div class="nav-user">
          <div v-if="authStore.isAuthenticated" class="user-info">
            <span class="user-name">{{ authStore.displayName }}</span>
            <span class="user-status">已登录</span>
          </div>
          <div v-else class="login-prompt">
            <span class="login-text">点击登录</span>
          </div>
          
          <!-- 用户头像容器 -->
          <div 
            class="user-avatar-container"
            @mouseenter="showDropdown"
            @mouseleave="hideDropdown"
            :class="{ 'authenticated': authStore.isAuthenticated }"
          >
            <div class="user-avatar" @click="handleAvatarClick">
              <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" :alt="authStore.displayName" class="avatar-image" />
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6366F1"/>
                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#6366F1"/>
              </svg>
            </div>
            
            <!-- 用户信息气泡 -->
            <transition name="dropdown">
              <div 
                v-if="authStore.isAuthenticated && showUserDropdown" 
                class="user-dropdown"
                @mouseenter="showDropdown"
                @mouseleave="hideDropdown"
              >
                <div class="dropdown-header">
                  <div class="dropdown-avatar">
                    <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" :alt="authStore.displayName" class="dropdown-avatar-image" />
                    <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6366F1"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#6366F1"/>
                    </svg>
                  </div>
                  <div class="dropdown-user-info">
                    <h3 class="dropdown-username">{{ authStore.displayName }}</h3>
                    <p class="dropdown-email">{{ authStore.userEmail }}</p>
                  </div>
                </div>
                
                <div class="dropdown-stats">
                  <div class="stat-row">
                    <div class="stat-item">
                      <span class="stat-number">{{ userStats.travelPlans }}</span>
                      <span class="stat-label">旅行计划</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ userStats.completedTrips }}</span>
                      <span class="stat-label">已完成</span>
                    </div>
                  </div>
                  <div class="stat-row">
                    <div class="stat-item">
                      <span class="stat-number">¥{{ userStats.totalSpending.toLocaleString() }}</span>
                      <span class="stat-label">总花费</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ userStats.favoriteType }}</span>
                      <span class="stat-label">偏好类型</span>
                    </div>
                  </div>
                </div>
                
                <div class="dropdown-actions">
                  <button class="action-btn profile-btn" @click="goToProfile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    个人主页
                  </button>
                  <button class="action-btn logout-btn" @click="handleLogout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    退出登录
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/auth.js';

export default {
  name: 'Navbar',
  props: {
    brandName: {
      type: String,
      default: 'TripCraft'
    }
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      showUserDropdown: false,
      hideTimeout: null,
      userStats: {
        travelPlans: 0,
        completedTrips: 0,
        totalSpending: 0,
        favoriteType: '暂无偏好'
      }
    }
  },
  mounted() {
    // 延迟初始化，避免阻塞渲染
    this.$nextTick(() => {
      this.authStore.initAuth();
      this.authStore.setupAuthListener();
      this.loadUserStats();
      
      // 监听用户档案变化
      this.$watch(() => this.authStore.userProfile, (newProfile) => {
        if (newProfile) {
          this.loadUserStats();
        }
      }, { deep: true });
    });
  },
  beforeUnmount() {
    // 清理定时器
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  },
  methods: {
    showDropdown() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.showUserDropdown = true;
    },
    
    hideDropdown() {
      this.hideTimeout = setTimeout(() => {
        this.showUserDropdown = false;
      }, 150);
    },
    
    handleAvatarClick() {
      if (this.authStore.isAuthenticated) {
        // 已登录，跳转到用户主页
        this.$router.push('/profile');
      } else {
        // 未登录，跳转到登录页面
        this.$router.push('/login');
      }
    },
    
    goToProfile() {
      this.$router.push('/profile');
      this.showUserDropdown = false;
    },
    
    async handleLogout() {
      try {
        await this.authStore.logout();
        this.showUserDropdown = false;
        this.$router.push('/login');
      } catch (error) {
        console.error('登出失败:', error);
      }
    },

    async loadUserStats() {
      try {
        // 确保用户已登录
        if (!this.authStore.isAuthenticated) {
          return;
        }

        // 确保用户档案已加载
        if (!this.authStore.userProfile) {
          await this.authStore.loadUserProfile();
        }

        // 从用户档案中获取统计数据
        if (this.authStore.userProfile) {
          const profile = this.authStore.userProfile;
          
          // 更新统计数据
          this.userStats = {
            travelPlans: profile.travel_plans_count || 0,
            completedTrips: profile.completed_trips_count || 0,
            totalSpending: profile.total_spending || 0,
            favoriteType: this.getFavoriteTypeText(profile.preferences?.attractionType)
          };

          console.log('导航栏统计数据已更新:', this.userStats);
        }
      } catch (error) {
        console.error('加载用户统计数据失败:', error);
      }
    },

    getFavoriteTypeText(attractionType) {
      const typeMap = {
        'cultural': '人文景点',
        'natural': '自然景点',
        'mixed': '混合类型'
      };
      return typeMap[attractionType] || '暂无偏好';
    },

    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.nav-brand h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-link {
  text-decoration: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar.authenticated {
  border: 2px solid #10b981;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.user-status {
  font-size: 12px;
  color: #10b981;
}

.login-prompt {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.login-text {
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-text:hover {
  color: #5a67d8;
}

/* 用户头像容器 */
.user-avatar-container {
  position: relative;
  display: inline-block;
}

/* 用户信息气泡 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 1000;
}

/* 气泡头部 */
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dropdown-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.dropdown-user-info {
  flex: 1;
}

.dropdown-username {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
}

.dropdown-email {
  font-size: 14px;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

/* 统计信息 */
.dropdown-stats {
  padding: 20px;
  background: #f8f9fa;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 操作按钮 */
.dropdown-actions {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
  flex: 1;
  justify-content: center;
}

.profile-btn {
  background: #f3f4f6;
  color: #374151;
}

.profile-btn:hover {
  background: #e5e7eb;
}

.logout-btn {
  background: #fee2e2;
  color: #dc2626;
}

.logout-btn:hover {
  background: #fecaca;
}

/* Vue transition 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-dropdown {
    width: 280px;
    right: -20px;
  }
  
  .dropdown-header {
    padding: 16px;
  }
  
  .dropdown-stats {
    padding: 16px;
  }
  
  .dropdown-actions {
    padding: 12px 16px;
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}


/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
}
</style>
