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
            <div class="username-wrapper">
              <h2 
                class="user-name username-clickable"
                role="button"
                tabindex="0"
                @click="openChangeNameModal"
                @keydown.enter="openChangeNameModal"
              >
                {{ userInfo.name }}
              </h2>
              <span class="username-tooltip">点击修改昵称</span>
            </div>
            <p class="user-email">{{ userInfo.email }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ travelPlansCount }}</span>
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
          </div>
          <div class="plans-list">
            <div 
              v-for="plan in travelPlansList" 
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
                  <button class="action-btn edit-btn" @click="viewPlan(plan.id)">查看</button>
                  <button 
                    v-if="plan.status === 'completed'" 
                    class="action-btn edit-btn" 
                    @click="revertToPlanning(plan.id)"
                  >设为规划中</button>
                  <button class="action-btn delete-btn" @click="confirmDeletePlan(plan.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 花费统计 -->
        <div class="spending-card">
          <h3 class="card-title">花费统计</h3>
          <div class="spending-grid">
            <div class="spending-left">
              <div class="spending-chart">
                <div v-if="completedSpendingList.length === 0" class="chart-placeholder">
                  <p>暂无已完成计划，完成后将展示各计划实际花费占比</p>
                </div>
                <div v-else ref="spendingPieEchart" class="echart-pie"></div>
              </div>
            </div>
            <div class="spending-right">
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-label">总花费</div>
                  <div class="kpi-value">¥{{ (totalSpending || 0).toLocaleString() }}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">平均每次</div>
                  <div class="kpi-value">¥{{ (averageSpending || 0).toLocaleString() }}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">完成率</div>
                  <div class="kpi-value">{{ completionRate }}%</div>
                </div>
              </div>
              <div class="mini-chart-card">
                <div class="mini-title">近6个月实际花费</div>
                <div ref="spendingMiniBarEchart" class="echart-mini"></div>
              </div>
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

    <!-- 删除确认弹窗 -->
    <Modal
      :show="showDeleteModal"
      title="删除确认"
      message="确认要删除该旅行计划吗？此操作不可恢复"
      confirm-text="删除"
      cancel-text="取消"
      confirm-type="danger"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
      @close="handleDeleteCancel"
    />

    <!-- 修改昵称弹窗 -->
    <Modal
      :show="showChangeNameModal"
      title="修改昵称"
      message="请输入新的昵称（2-20个字符）"
      confirm-text="保存"
      cancel-text="取消"
      input-type="text"
      input-placeholder="输入新的昵称"
      :input-value="changeNameValue"
      @update:inputValue="val => changeNameValue = val"
      @confirm="confirmChangeName"
      @cancel="closeChangeNameModal"
      @close="closeChangeNameModal"
    />
    
    <!-- 修改昵称弹窗 -->
    <Modal
      :show="showChangeNameModal"
      title="修改昵称"
      message="请输入新的昵称（2-20个字符）"
      confirm-text="保存"
      cancel-text="取消"
      input-type="text"
      input-placeholder="输入新的昵称"
      :input-value="changeNameValue"
      @update:inputValue="val => changeNameValue = val"
      @confirm="confirmChangeName"
      @cancel="closeChangeNameModal"
      @close="closeChangeNameModal"
    />
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import AvatarSelector from './AvatarSelector.vue';
import Modal from './Modal.vue';
import { useAuthStore } from '../stores/auth.js';
import supabase from '../utils/supabase.js';
import * as echarts from 'echarts';

export default {
  name: 'UserProfile',
  components: {
    Navbar,
    AvatarSelector,
    Modal
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
      showAvatarSelectorModal: false,
      travelPlansList: [],
      travelPlansCountInternal: 0,
      showDeleteModal: false,
      deletePlanId: null,
      echartInstance: null,
      miniBarInstance: null,
      showChangeNameModal: false,
      changeNameValue: ''
    }
  },
  computed: {
    userInfo() {
      return {
        name: (this.authStore.userProfile && this.authStore.userProfile.username) || this.authStore.displayName,
        email: this.authStore.userEmail
      };
    },
    travelPlansCount() {
      const fromProfile = this.authStore.userProfile?.travel_plans_count || 0;
      return this.travelPlansCountInternal || fromProfile || (this.travelPlansList ? this.travelPlansList.length : 0);
    },
    completedTrips() {
      // 基于实际列表统计（更准确）
      if (Array.isArray(this.travelPlansList) && this.travelPlansList.length > 0) {
        return this.travelPlansList.filter(p => p.status === 'completed').length;
      }
      return this.authStore.userProfile?.completed_trips_count || 0;
    },
    totalSpending() {
      // 直接从用户档案获取总花费
      return this.authStore.userProfile?.total_spending || 0;
    },
    averageSpending() {
      return this.completedTrips > 0 ? Math.round(this.totalSpending / this.completedTrips) : 0;
    },
    highestSpending() {
      const completed = (this.travelPlansList || []).filter(p => p.status === 'completed');
      if (completed.length === 0) return 0;
      return completed.reduce((m, p) => Math.max(m, Number(p.actualSpending || 0)), 0);
    },
    completionRate() {
      const total = this.travelPlansCount || 0;
      const done = this.completedTrips || 0;
      if (total === 0) return 0;
      return Math.round((done / total) * 100);
    },
    completedSpendingList() {
      const completed = (this.travelPlansList || []).filter(p => p.status === 'completed');
      const colorPalette = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];
      const values = completed.map(p => ({ id: p.id, title: p.title || p.destination || '计划', value: Number(p.actualSpending || 0) }));
      const total = values.reduce((s, x) => s + x.value, 0) || 0;
      return values.map((x, i) => ({
        ...x,
        color: colorPalette[i % colorPalette.length],
        percent: total > 0 ? Math.round((x.value / total) * 100) : 0
      }));
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
    await this.loadTravelPlans();
    this.isLoading = false;
    this.$nextTick(() => this.initEcharts());
  },
  watch: {
    completedSpendingList: {
      handler() {
        // 当完成计划数据变化时，确保容器已渲染并更新图表
        this.$nextTick(() => {
          if (!this.echartInstance && this.$refs.spendingPieEchart) {
            this.initEcharts();
          } else {
            this.updateEcharts();
          }
        });
      },
      deep: true
    }
  },
  beforeUnmount() {
    if (this.echartInstance) {
      this.echartInstance.dispose();
      this.echartInstance = null;
    }
    if (this.miniBarInstance) {
      this.miniBarInstance.dispose();
      this.miniBarInstance = null;
    }
    window.removeEventListener('resize', this.handleResize);
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
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },

    async loadTravelPlans() {
      try {
        if (!this.authStore.user?.id) return;
        const { data, error } = await supabase
          .from('travel_plans')
          .select('id, title, destination, start_date, end_date, duration, budget, status, actual_spending')
          .eq('user_id', this.authStore.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        this.travelPlansList = (data || []).map(p => ({
          id: p.id,
          title: p.title,
          destination: p.destination,
          startDate: p.start_date,
          endDate: p.end_date,
          duration: p.duration,
          budget: p.budget,
          status: p.status || 'planning',
          actualSpending: Number(p.actual_spending || 0)
        }));

        this.travelPlansCountInternal = this.travelPlansList.length;
        this.$nextTick(() => {
          this.updateEcharts();
          this.updateMiniBar();
        });
      } catch (e) {
        console.error('加载旅行计划失败:', e);
      }
    },
    async initEcharts() {
      try {
        const el = this.$refs.spendingPieEchart;
        if (!el) return;
        if (this.echartInstance) {
          this.echartInstance.dispose();
        }
        this.echartInstance = echarts.init(el);
        this.updateEcharts();
        window.addEventListener('resize', this.handleResize);
      } catch (e) {
        console.error('ECharts 初始化失败:', e);
      }
    },
    handleResize() {
      if (this.echartInstance) {
        this.echartInstance.resize();
      }
      if (this.miniBarInstance) {
        this.miniBarInstance.resize();
      }
    },
    updateEcharts() {
      // 若实例不存在但容器已存在，尝试初始化
      if (!this.echartInstance && this.$refs.spendingPieEchart) {
        try {
          this.echartInstance = echarts.init(this.$refs.spendingPieEchart);
        } catch (e) {
          return;
        }
      }
      if (!this.echartInstance) return;
      const data = this.completedSpendingList.filter(i => i.value > 0).map(i => ({
        value: i.value,
        name: i.title,
        itemStyle: { color: i.color },
        raw: i
      }));
      const total = data.reduce((s, d) => s + d.value, 0);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const r = params.data.raw;
            const dest = r.title;
            const spend = r.value;
            return `${dest}<br/>实际花费：¥${spend.toLocaleString()} (${params.percent}%)`;
          }
        },
        legend: { show: false },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: true,
            label: { show: true, formatter: '{b}' },
            data
          }
        ],
        graphic: total > 0 ? [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: `合计\n¥${total.toLocaleString()}`,
              textAlign: 'center',
              fill: '#333',
              fontWeight: 'bold',
              fontSize: 14
            }
          }
        ] : []
      };
      this.echartInstance.setOption(option);
      this.echartInstance.resize();
    },
    buildMonthlySeries() {
      // 近6个月（含当月），按计划结束月份聚合实际花费
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.push({ key, y: 0 });
      }
      const idxMap = months.reduce((m, it, i) => { m[it.key] = i; return m; }, {});
      (this.travelPlansList || []).forEach(p => {
        if (p.status !== 'completed') return;
        const end = p.endDate || p.startDate; // 若无结束日期则退化到开始日期
        if (!end) return;
        const d = new Date(end);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in idxMap) {
          months[idxMap[key]].y += Number(p.actualSpending || 0);
        }
      });
      return {
        labels: months.map(m => m.key),
        values: months.map(m => Math.round(m.y))
      };
    },
    initMiniBar() {
      const el = this.$refs.spendingMiniBarEchart;
      if (!el) return;
      if (this.miniBarInstance) {
        this.miniBarInstance.dispose();
      }
      this.miniBarInstance = echarts.init(el);
    },
    updateMiniBar() {
      if (!this.$refs.spendingMiniBarEchart) return;
      if (!this.miniBarInstance) this.initMiniBar();
      if (!this.miniBarInstance) return;
      const { labels, values } = this.buildMonthlySeries();
      const option = {
        grid: { left: 8, right: 8, top: 24, bottom: 24 },
        xAxis: {
          type: 'category',
          data: labels,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: '#ddd' } },
          axisLabel: { color: '#666', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#666', fontSize: 10,
            formatter: (v) => v >= 10000 ? `¥${Math.round(v/1000)/10}万` : `¥${v}` },
          splitLine: { lineStyle: { color: '#eee' } }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (p) => {
            const item = p && p[0];
            if (!item) return '';
            return `${item.axisValue}<br/>实际花费：¥${Number(item.value || 0).toLocaleString()}`;
          }
        },
        series: [{
          type: 'bar',
          data: values,
          itemStyle: { color: '#667eea', borderRadius: [4,4,0,0] },
          barWidth: '50%'
        }]
      };
      this.miniBarInstance.setOption(option);
      this.miniBarInstance.resize();
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
    viewPlan(planId) {
      this.$router.push({ name: 'TripPlanningDetail', params: { id: planId }, query: { readonly: '1' } });
    },
    confirmDeletePlan(planId) {
      this.deletePlanId = planId;
      this.showDeleteModal = true;
    },
    async deletePlan(planId) {
      try {
        const { error } = await supabase
          .from('travel_plans')
          .delete()
          .eq('id', planId)
          .eq('user_id', this.authStore.user.id);
        if (error) throw error;
        // 前端列表移除
        this.travelPlansList = this.travelPlansList.filter(p => p.id !== planId);
        this.travelPlansCountInternal = this.travelPlansList.length;
        this.showDeleteModal = false;
        this.showMessage('计划删除成功！', true);
      } catch (e) {
        console.error('删除计划失败:', e);
        this.showMessage('删除计划失败，请稍后再试', false);
      }
    },
    async revertToPlanning(planId) {
      try {
        const { data, error } = await supabase
          .from('travel_plans')
          .update({ status: 'planning', actual_spending: 0 })
          .eq('id', planId)
          .eq('user_id', this.authStore.user.id)
          .select('id, status, actual_spending')
          .single();
        if (error) throw error;
        // 更新本地列表
        const idx = this.travelPlansList.findIndex(p => p.id === planId);
        if (idx !== -1) {
          this.travelPlansList[idx].status = 'planning';
          this.travelPlansList[idx].actualSpending = 0;
        }
        this.travelPlansCountInternal = this.travelPlansList.length;
        this.showMessage('已设为规划中，实际花费已清零', true);
      } catch (e) {
        console.error('设为规划中失败:', e);
        this.showMessage('设为规划中失败，请稍后重试', false);
      }
    },
    handleDeleteConfirm() {
      if (this.deletePlanId) {
        this.deletePlan(this.deletePlanId);
      }
    },
    handleDeleteCancel() {
      this.showDeleteModal = false;
      this.deletePlanId = null;
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
    },
    openChangeNameModal() {
      this.changeNameValue = this.userInfo.name || '';
      this.showChangeNameModal = true;
    },
    closeChangeNameModal() {
      this.showChangeNameModal = false;
    },
    async confirmChangeName() {
      const newName = (this.changeNameValue || '').trim();
      if (newName.length < 2 || newName.length > 20) {
        this.showMessage('昵称长度需为 2-20 个字符', false);
        return;
      }
      try {
        const result = await this.authStore.updateUserProfile({ username: newName });
        if (result && result.success) {
          await this.authStore.loadUserProfile();
          this.showMessage('昵称更新成功！', true);
          this.showChangeNameModal = false;
        } else {
          this.showMessage('昵称更新失败，请稍后重试', false);
        }
      } catch (e) {
        console.error('更新昵称失败:', e);
        this.showMessage('更新昵称失败，请稍后重试', false);
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

.username-wrapper {
  position: relative;
  display: inline-block;
}

.username-clickable {
  cursor: pointer;
}

.username-tooltip {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 6px;
  background: rgba(17, 24, 39, 0.95);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  transform: translateY(4px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease;
}

.username-wrapper:hover .username-tooltip,
.username-wrapper:focus-within .username-tooltip {
  opacity: 1;
  transform: translateY(0);
}

.username-clickable {
  cursor: pointer;
  position: relative;
}
.username-clickable:hover {
  text-decoration: underline dotted;
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
  grid-column: 1 / -1;
}

.spending-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.spending-left {
  width: 100%;
}

.spending-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.kpi-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #eef2f7;
}

.kpi-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.mini-chart-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 14px 8px;
  border: 1px solid #eef2f7;
}

.mini-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.echart-mini {
  width: 100%;
  height: 120px;
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

.echart-pie {
  width: 100%;
  height: 260px;
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
  .spending-grid {
    grid-template-columns: 1fr;
  }
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
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
