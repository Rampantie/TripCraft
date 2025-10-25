<template>
  <div class="user-profile-page">
    <!-- 顶部导航栏 -->
    <Navbar @avatar-click="handleAvatarClick" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 用户信息卡片 -->
        <div class="user-info-card">
          <div class="user-avatar-section">
            <div class="user-avatar-large">
              <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" :alt="authStore.displayName" class="avatar-image-large" />
              <svg v-else width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6366F1"/>
                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#6366F1"/>
              </svg>
            </div>
            <button class="change-avatar-btn" @click="showAvatarSelector">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16.5 3.5C16.8978 3.10218 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L12 14L8 10L16.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              更换头像
            </button>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ userInfo.name }}</h2>
            <p class="user-email">{{ userInfo.email }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ travelPlans }}</span>
                <span class="stat-label">旅行计划</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ completedTrips }}</span>
                <span class="stat-label">已完成</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">¥{{ (totalSpending || 0).toLocaleString() }}</span>
                <span class="stat-label">总花费</span>
              </div>
            </div>
          </div>
          
          <!-- 登出按钮 -->
          <div class="logout-section">
            <button class="logout-btn" @click="handleLogout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              退出登录
            </button>
          </div>
        </div>

        <!-- 旅行偏好设置 -->
        <div class="preferences-card">
          <h3 class="card-title">旅行偏好设置</h3>
          <div v-if="isLoading" class="loading-message">
            正在加载偏好设置...
          </div>
          <div v-else class="preferences-grid">
            <div class="preference-item">
              <label class="preference-label">景点类型偏好</label>
              <div class="preference-options">
                <label class="option-item">
                  <input 
                    v-model="preferences.attractionType" 
                    type="radio" 
                    value="cultural" 
                    class="option-input"
                  />
                  <span class="option-text">人文景点</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.attractionType" 
                    type="radio" 
                    value="natural" 
                    class="option-input"
                  />
                  <span class="option-text">自然景点</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.attractionType" 
                    type="radio" 
                    value="mixed" 
                    class="option-input"
                  />
                  <span class="option-text">混合类型</span>
                </label>
              </div>
            </div>

            <div class="preference-item">
              <label class="preference-label">旅行节奏</label>
              <div class="preference-options">
                <label class="option-item">
                  <input 
                    v-model="preferences.travelPace" 
                    type="radio" 
                    value="relaxed" 
                    class="option-input"
                  />
                  <span class="option-text">轻松休闲</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.travelPace" 
                    type="radio" 
                    value="moderate" 
                    class="option-input"
                  />
                  <span class="option-text">适中节奏</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.travelPace" 
                    type="radio" 
                    value="intensive" 
                    class="option-input"
                  />
                  <span class="option-text">紧凑忙碌</span>
                </label>
              </div>
            </div>

            <div class="preference-item">
              <label class="preference-label">住宿偏好</label>
              <div class="preference-options">
                <label class="option-item">
                  <input 
                    v-model="preferences.accommodation" 
                    type="radio" 
                    value="budget" 
                    class="option-input"
                  />
                  <span class="option-text">经济型</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.accommodation" 
                    type="radio" 
                    value="comfortable" 
                    class="option-input"
                  />
                  <span class="option-text">舒适型</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.accommodation" 
                    type="radio" 
                    value="luxury" 
                    class="option-input"
                  />
                  <span class="option-text">豪华型</span>
                </label>
              </div>
            </div>

            <div class="preference-item">
              <label class="preference-label">交通偏好</label>
              <div class="preference-options">
                <label class="option-item">
                  <input 
                    v-model="preferences.transportation" 
                    type="radio" 
                    value="public" 
                    class="option-input"
                  />
                  <span class="option-text">公共交通</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.transportation" 
                    type="radio" 
                    value="private" 
                    class="option-input"
                  />
                  <span class="option-text">私人交通</span>
                </label>
                <label class="option-item">
                  <input 
                    v-model="preferences.transportation" 
                    type="radio" 
                    value="mixed" 
                    class="option-input"
                  />
                  <span class="option-text">混合方式</span>
                </label>
              </div>
            </div>
          </div>
          <button class="save-preferences-btn" @click="savePreferences" :disabled="isSavingPreferences">
            {{ isSavingPreferences ? '保存中...' : '保存偏好设置' }}
          </button>
          <div v-if="saveMessage" class="save-message" :class="{ 'success': saveMessage.includes('成功'), 'error': saveMessage.includes('失败') }">
            {{ saveMessage }}
          </div>
        </div>

        <!-- 旅行计划列表 -->
        <div class="travel-plans-card">
          <div class="card-header">
            <h3 class="card-title">我的旅行计划</h3>
            <button class="add-plan-btn" @click="addNewPlan">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              新建计划
            </button>
          </div>
          <div class="plans-list">
            <div 
              v-for="plan in travelPlans" 
              :key="plan.id" 
              class="plan-item"
              :class="{ 'completed': plan.status === 'completed' }"
            >
              <div class="plan-info">
                <h4 class="plan-title">{{ plan.title }}</h4>
                <p class="plan-destination">{{ plan.destination }}</p>
                <div class="plan-details">
                  <span class="plan-date">{{ plan.startDate }} - {{ plan.endDate }}</span>
                  <span class="plan-duration">{{ plan.duration }}天</span>
                  <span class="plan-budget">¥{{ (plan.budget || 0).toLocaleString() }}</span>
                </div>
              </div>
              <div class="plan-actions">
                <span class="plan-status" :class="plan.status">
                  {{ getStatusText(plan.status) }}
                </span>
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="editPlan(plan.id)">编辑</button>
                  <button class="action-btn delete-btn" @click="deletePlan(plan.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 花费统计 -->
        <div class="spending-card">
          <h3 class="card-title">花费统计</h3>
          <div class="spending-stats">
            <div class="spending-item">
              <div class="spending-label">总花费</div>
              <div class="spending-amount">¥{{ (totalSpending || 0).toLocaleString() }}</div>
            </div>
            <div class="spending-item">
              <div class="spending-label">平均每次</div>
              <div class="spending-amount">¥{{ (averageSpending || 0).toLocaleString() }}</div>
            </div>
            <div class="spending-item">
              <div class="spending-label">本月花费</div>
              <div class="spending-amount">¥{{ (monthlySpending || 0).toLocaleString() }}</div>
            </div>
          </div>
          <div class="spending-chart">
            <div class="chart-placeholder">
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50L25 35L40 20L55 30L70 15L85 25L90 10" stroke="#667eea" stroke-width="2" fill="none"/>
                <circle cx="10" cy="50" r="3" fill="#667eea"/>
                <circle cx="25" cy="35" r="3" fill="#667eea"/>
                <circle cx="40" cy="20" r="3" fill="#667eea"/>
                <circle cx="55" cy="30" r="3" fill="#667eea"/>
                <circle cx="70" cy="15" r="3" fill="#667eea"/>
                <circle cx="85" cy="25" r="3" fill="#667eea"/>
                <circle cx="90" cy="10" r="3" fill="#667eea"/>
              </svg>
              <p>花费趋势图</p>
            </div>
          </div>
        </div>
        
        
      </div>
    </main>
    
    <!-- 头像选择器 -->
    <AvatarSelector 
      :show="showAvatarSelectorModal" 
      @close="hideAvatarSelector"
      @confirm="handleAvatarConfirm"
    />
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import AvatarSelector from './AvatarSelector.vue';
import { useAuthStore } from '../stores/auth.js';
import supabase from '../utils/supabase.js';

export default {
  name: 'UserProfile',
  components: {
    Navbar,
    AvatarSelector
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore, supabase };
  },
  data() {
    return {
      preferences: {
        attractionType: 'mixed',
        travelPace: 'moderate',
        accommodation: 'comfortable',
        transportation: 'mixed'
      },
      // 旅行计划数据现在从数据库获取
      isLoading: true,
      isSavingPreferences: false,
      saveMessage: '',
      showAvatarSelectorModal: false
    }
  },
  computed: {
    userInfo() {
      return {
        name: this.authStore.displayName,
        email: this.authStore.userEmail
      };
    },
    travelPlans() {
      // 直接从用户档案获取旅行计划数
      return this.authStore.userProfile?.travel_plans_count || 0;
    },
    completedTrips() {
      // 直接从用户档案获取已完成旅行数
      return this.authStore.userProfile?.completed_trips_count || 0;
    },
    totalSpending() {
      // 直接从用户档案获取总花费
      return this.authStore.userProfile?.total_spending || 0;
    },
    averageSpending() {
      return this.completedTrips > 0 ? Math.round(this.totalSpending / this.completedTrips) : 0;
    },
    monthlySpending() {
      // 模拟本月花费
      return 5000;
    }
  },
  async mounted() {
    // 确保用户已登录
    if (!this.authStore.isAuthenticated) {
      this.$router.push('/login');
      return;
    }

    // 加载用户数据
    await this.loadUserData();
    this.isLoading = false;
  },
  methods: {
    async loadUserData() {
      try {
        // 确保用户档案已加载
        if (!this.authStore.userProfile) {
          await this.authStore.loadUserProfile();
        }

        // 加载用户偏好设置
        if (this.authStore.userProfile?.preferences) {
          console.log('加载用户偏好设置:', this.authStore.userProfile.preferences);
          this.preferences = { 
            ...this.preferences, 
            ...this.authStore.userProfile.preferences 
          };
        } else {
          console.log('用户暂无偏好设置，使用默认值');
        }

        // 数据现在直接从 authStore.userProfile 获取
        
        // 这里可以添加加载旅行计划的逻辑
        // await this.loadTravelPlans();
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },
    
    handleAvatarClick() {
      console.log('用户头像被点击');
    },
    
    async savePreferences() {
      this.isSavingPreferences = true;
      this.saveMessage = '';
      
      try {
        console.log('保存偏好设置:', this.preferences);
        
        const result = await this.authStore.updateUserProfile({
          preferences: this.preferences
        });
        
        if (result.success) {
          this.saveMessage = '偏好设置保存成功！';
          console.log('偏好设置保存成功');
          
          // 数据现在直接从 authStore.userProfile 获取，自动同步
          
          // 3秒后清除成功消息
          setTimeout(() => {
            this.saveMessage = '';
          }, 3000);
        } else {
          this.saveMessage = '保存失败，请重试';
          console.error('保存偏好设置失败:', result.error);
        }
      } catch (error) {
        this.saveMessage = '保存失败，请重试';
        console.error('保存偏好设置失败:', error);
      } finally {
        this.isSavingPreferences = false;
      }
    },
    
    async handleLogout() {
      try {
        await this.authStore.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('登出失败:', error);
      }
    },
    addNewPlan() {
      console.log('添加新计划');
      // 这里可以添加新建计划的逻辑
    },
    editPlan(planId) {
      console.log('编辑计划:', planId);
      // 这里可以添加编辑计划的逻辑
    },
    deletePlan(planId) {
      console.log('删除计划:', planId);
      // 这里可以添加删除计划的逻辑
    },
    getStatusText(status) {
      const statusMap = {
        'planning': '规划中',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    },

    updateNavbarStats() {
      // 通过事件总线通知导航栏更新统计数据
      this.$emit('update-navbar-stats', {
        travelPlans: this.travelPlans.length,
        completedTrips: this.completedTrips,
        totalSpending: this.totalSpending,
        favoriteType: this.getFavoriteTypeText(this.preferences.attractionType)
      });
    },

    getFavoriteTypeText(attractionType) {
      const typeMap = {
        'cultural': '人文景点',
        'natural': '自然景点',
        'mixed': '混合类型'
      };
      return typeMap[attractionType] || '暂无偏好';
    },

    showAvatarSelector() {
      this.showAvatarSelectorModal = true;
    },

    hideAvatarSelector() {
      this.showAvatarSelectorModal = false;
    },

    async handleAvatarConfirm(avatarUrl) {
      try {
        console.log('选择头像:', avatarUrl);
        
        // 更新用户档案中的头像
        const result = await this.authStore.updateUserProfile({
          avatar_url: avatarUrl
        });

        if (result.success) {
          console.log('头像更新成功');
          this.showMessage('头像更新成功！', true);
        } else {
          console.error('头像更新失败:', result.error);
          this.showMessage('头像更新失败，请重试', false);
        }
      } catch (error) {
        console.error('头像更新失败:', error);
        this.showMessage('头像更新失败，请重试', false);
      }
    },

    showMessage(text, success) {
      this.saveMessage = text;
      this.isSuccess = success;
      
      if (success) {
        setTimeout(() => {
          this.saveMessage = '';
        }, 3000);
      }
    }
  }
};
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.main-content {
  padding: 40px 24px;
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* 用户信息卡片 */
.user-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  gap: 24px;
  align-items: center;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image-large {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 更换头像按钮 */
.change-avatar-btn {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.change-avatar-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 登出按钮样式 */
.logout-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.user-email {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 偏好设置卡片 */
.preferences-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preferences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preference-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.preference-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.option-input {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.option-text {
  font-size: 14px;
  color: #666;
}

.save-preferences-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-preferences-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.save-preferences-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 保存消息样式 */
.save-message {
  margin-top: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
}

.save-message.success {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.save-message.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* 加载状态样式 */
.loading-message {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
  font-style: italic;
}

/* 旅行计划卡片 */
.travel-plans-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.add-plan-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.2s ease;
}

.plan-item.completed {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.plan-info {
  flex: 1;
}

.plan-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.plan-destination {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.plan-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.plan-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.plan-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.plan-status.planning {
  background: #fef3c7;
  color: #d97706;
}

.plan-status.completed {
  background: #d1fae5;
  color: #059669;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #e0e7ff;
  color: #3730a3;
}

.edit-btn:hover {
  background: #c7d2fe;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
}

/* 花费统计卡片 */
.spending-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spending-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.spending-item {
  text-align: center;
}

.spending-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.spending-amount {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.spending-chart {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .spending-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .plan-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .plan-actions {
    align-items: flex-start;
  }
}
</style>
