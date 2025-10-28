<template>
  <div class="trip-planning-page">
    <!-- 顶部导航栏 -->
    <Navbar />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 用户需求展示 -->
        <div class="user-request-card">
          <h2 class="card-title">您的旅行需求</h2>
          <div class="request-content">
            <p class="request-text">{{ userRequest }}</p>
            <div class="request-details">
              <div class="detail-item">
                <span class="detail-label">目的地：</span>
                <span class="detail-value">{{ tripDetails.destination }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">出发时间：</span>
                <span class="detail-value">{{ tripDetails.startDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">旅行天数：</span>
                <span class="detail-value">{{ tripDetails.duration }}天</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">预算范围：</span>
                <span class="detail-value">¥{{ tripDetails.budget.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 旅行安排和地图 -->
        <div class="planning-content">
          <!-- 左侧：旅行安排 -->
          <div class="itinerary-section">
            <h3 class="section-title">行程安排</h3>
            <div class="itinerary-list">
              <div 
                v-for="(day, index) in itinerary" 
                :key="index" 
                class="day-item"
                :class="{ 'active': selectedDay === index }"
                @click="selectDay(index)"
              >
                <div class="day-header">
                  <span class="day-number">第{{ index + 1 }}天</span>
                  <span class="day-date">{{ day.date }}</span>
                </div>
                <div class="day-activities">
                  <div 
                    v-for="(activity, actIndex) in day.activities" 
                    :key="actIndex"
                    class="activity-item"
                  >
                    <div class="activity-time">{{ activity.time }}</div>
                    <div class="activity-content">
                      <h4 class="activity-title">{{ activity.title }}</h4>
                      <p class="activity-description">{{ activity.description }}</p>
                      <div class="activity-details">
                        <span class="activity-duration">{{ activity.duration }}</span>
                        <span class="activity-cost">¥{{ activity.cost }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：地图和费用 -->
          <div class="map-section">
            <!-- 地图容器 -->
            <div class="map-container">
              <div class="map-header">
                <h3 class="section-title">行程地图</h3>
                <div class="map-controls">
                  <button class="map-btn" @click="toggleMapView">
                    {{ mapView === 'route' ? '景点模式' : '路线模式' }}
                  </button>
        <button 
          v-if="planId && isReadOnly && planStatus !== 'completed'"
          class="btn-primary"
          @click="openCompleteModal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          完成旅行
        </button>
                </div>
              </div>
              <div class="map-content">
                <!-- 模拟地图 -->
                <div class="mock-map">
                  <div class="map-points">
                    <div 
                      v-for="(point, index) in mapPoints" 
                      :key="index"
                      class="map-point"
                      :style="{ 
                        left: point.x + '%', 
                        top: point.y + '%',
                        backgroundColor: point.color 
                      }"
                      :title="point.name"
                    >
                      <span class="point-number">{{ index + 1 }}</span>
                    </div>
                    <svg class="route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M10,20 Q30,10 50,30 T90,25" 
                        stroke="#667eea" 
                        stroke-width="2" 
                        fill="none"
                        stroke-dasharray="5,5"
                      />
                    </svg>
                  </div>
                  <div class="map-legend">
                    <div class="legend-item">
                      <div class="legend-color" style="background: #10b981;"></div>
                      <span>住宿</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background: #3b82f6;"></div>
                      <span>景点</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background: #f59e0b;"></div>
                      <span>餐厅</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 费用统计 -->
            <div class="cost-breakdown">
              <h3 class="section-title">费用明细</h3>
              <div class="cost-list">
                <div class="cost-item">
                  <span class="cost-label">住宿费用</span>
                  <span class="cost-amount">¥{{ costBreakdown.accommodation.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">交通费用</span>
                  <span class="cost-amount">¥{{ costBreakdown.transportation.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">餐饮费用</span>
                  <span class="cost-amount">¥{{ costBreakdown.food.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">门票费用</span>
                  <span class="cost-amount">¥{{ costBreakdown.tickets.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">其他费用</span>
                  <span class="cost-amount">¥{{ costBreakdown.others.toLocaleString() }}</span>
                </div>
                <div class="cost-total">
                  <span class="total-label">总费用</span>
                  <span class="total-amount">¥{{ totalCost.toLocaleString() }}</span>
                </div>
                <div class="cost-total">
                  <span class="total-label">实际费用</span>
                  <span class="total-amount">¥{{ actualSpending.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-secondary" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            重新规划
          </button>
          <button class="btn-primary" @click="savePlan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            保存计划
          </button>
          <button class="btn-primary" @click="exportPlan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出计划
          </button>
        </div>
      </div>
    </main>

    <!-- 消息提示弹窗 -->
    <Modal
      :show="showMessageModal"
      :title="messageType === 'success' ? '成功' : messageType === 'danger' ? '错误' : '提示'"
      :message="messageText"
      :confirm-type="messageType"
      confirm-text="确定"
      :show-cancel="false"
      :show-close="false"
      @confirm="handleMessageClose"
    />

    <!-- 完成旅行弹窗：输入实际花费 -->
    <Modal
      :show="showCompleteModal"
      title="完成旅行"
      confirm-text="保存"
      cancel-text="取消"
      confirm-type="success"
      @confirm="confirmComplete"
      @cancel="() => showCompleteModal = false"
      @close="() => showCompleteModal = false"
    >
      <div class="complete-form">
        <label class="complete-label">请输入实际总花费（元）</label>
        <input 
          v-model="completeAmount"
          type="number"
          min="0"
          class="complete-input"
          placeholder="例如：9800"
        />
        <p class="complete-tip">保存后该计划将标记为“已完成”。</p>
      </div>
    </Modal>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import Modal from './Modal.vue';
import supabase from '../utils/supabase.js';

export default {
  name: 'TripPlanning',
  components: {
    Navbar,
    Modal
  },
  data() {
    return {
      isReadOnly: false,
      planId: null,
      userRequest: '',
      showMessageModal: false,
      messageText: '',
      messageType: 'info',
      planStatus: 'planning',
      actualSpending: 0,
      showCompleteModal: false,
      completeAmount: '',
      selectedDay: 0,
      mapView: 'route',
      tripDetails: {
        destination: '日本东京、京都、大阪',
        startDate: '2024-04-01',
        duration: 7,
        budget: 10000
      },
      itinerary: [
        {
          date: '2024-04-01',
          activities: [
            {
              time: '09:00',
              title: '抵达东京',
              description: '成田机场 → 东京市区',
              duration: '2小时',
              cost: 500
            },
            {
              time: '12:00',
              title: '浅草寺',
              description: '体验传统日本文化',
              duration: '2小时',
              cost: 0
            },
            {
              time: '15:00',
              title: '东京塔',
              description: '俯瞰东京全景',
              duration: '1.5小时',
              cost: 200
            },
            {
              time: '18:00',
              title: '银座购物',
              description: '体验东京购物文化',
              duration: '2小时',
              cost: 800
            }
          ]
        },
        {
          date: '2024-04-02',
          activities: [
            {
              time: '09:00',
              title: '新宿御苑',
              description: '赏樱花，体验日本园林',
              duration: '2小时',
              cost: 0
            },
            {
              time: '12:00',
              title: '涩谷',
              description: '体验东京时尚文化',
              duration: '3小时',
              cost: 600
            },
            {
              time: '16:00',
              title: '原宿',
              description: '体验日本青年文化',
              duration: '2小时',
              cost: 400
            }
          ]
        },
        {
          date: '2024-04-03',
          activities: [
            {
              time: '08:00',
              title: '前往京都',
              description: '新干线东京 → 京都',
              duration: '3小时',
              cost: 800
            },
            {
              time: '12:00',
              title: '清水寺',
              description: '世界文化遗产',
              duration: '2小时',
              cost: 300
            },
            {
              time: '15:00',
              title: '祗园',
              description: '体验传统京都文化',
              duration: '3小时',
              cost: 500
            }
          ]
        }
      ],
      mapPoints: [
        { name: '成田机场', x: 15, y: 20, color: '#10b981' },
        { name: '浅草寺', x: 25, y: 35, color: '#3b82f6' },
        { name: '东京塔', x: 30, y: 40, color: '#3b82f6' },
        { name: '银座', x: 35, y: 45, color: '#f59e0b' },
        { name: '新宿御苑', x: 20, y: 30, color: '#3b82f6' },
        { name: '涩谷', x: 25, y: 25, color: '#3b82f6' },
        { name: '京都站', x: 60, y: 50, color: '#10b981' },
        { name: '清水寺', x: 65, y: 45, color: '#3b82f6' },
        { name: '祗园', x: 70, y: 40, color: '#3b82f6' }
      ],
      costBreakdown: {
        accommodation: 3500,
        transportation: 2000,
        food: 2500,
        tickets: 800,
        others: 1200
      }
    }
  },
  computed: {
    totalCost() {
      return Object.values(this.costBreakdown).reduce((total, cost) => total + cost, 0);
    }
  },
  mounted() {
    // 路由参数：计划ID与只读标记
    this.planId = this.$route?.params?.id || null;
    this.isReadOnly = this.$route?.query?.readonly === '1';

    if (this.planId) {
      // 查看已保存计划（只读）
      this.loadPlanById(this.planId);
    } else {
      // 新建流程：从 sessionStorage 加载
      this.loadTripData();
    }
  },
  methods: {
    async loadPlanById(id) {
      try {
        console.log('🔎 [旅行计划页] 加载已保存计划 ID:', id);
        const { data, error } = await supabase
          .from('travel_plans')
          .select('title, destination, start_date, end_date, duration, budget, status, actual_spending, itinerary, cost_breakdown')
          .eq('id', id)
          .single();

        if (error) throw error;

        // 将数据库数据映射到界面
        this.userRequest = data.title || '';
        this.tripDetails = {
          destination: data.destination || '',
          startDate: data.start_date || '',
          duration: data.duration || 1,
          budget: Number(data.budget) || 0
        };
        this.itinerary = Array.isArray(data.itinerary) ? data.itinerary : [];
        if (data.cost_breakdown && typeof data.cost_breakdown === 'object') {
          this.costBreakdown = {
            accommodation: Number(data.cost_breakdown.accommodation) || 0,
            transportation: Number(data.cost_breakdown.transportation) || 0,
            food: Number(data.cost_breakdown.food) || 0,
            tickets: Number(data.cost_breakdown.tickets) || 0,
            others: Number(data.cost_breakdown.others) || 0
          };
        }
        this.planStatus = data.status || 'planning';
        this.actualSpending = Number(data.actual_spending) || 0;

        // 基于行程更新地图点
        this.updateMapPoints();
        console.log('✅ [旅行计划页] 已加载计划');
      } catch (e) {
        console.error('❌ [旅行计划页] 加载计划失败:', e);
        alert('加载计划失败，请返回重试');
        this.$router.push('/profile');
      }
    },
    async ensureLoggedIn() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data && data.user ? data.user : null;
      } catch (err) {
        console.error('获取登录状态失败:', err);
        return null;
      }
    },

    formatDate(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    computeEndDate(startDateStr, durationDays) {
      try {
        const start = new Date(startDateStr);
        if (Number.isFinite(durationDays) && durationDays > 0) {
          // 例如 7 天行程，结束日期 = 开始 + (7 - 1) 天
          start.setDate(start.getDate() + (durationDays - 1));
        }
        return this.formatDate(start);
      } catch (e) {
        console.warn('结束日期计算失败，使用开始日期作为结束日期:', e);
        return startDateStr;
      }
    },

    loadTripData() {
      console.log('📋 [旅行计划页] 开始加载旅行数据');
      
      // 从sessionStorage获取用户输入
      const userRequest = sessionStorage.getItem('userRequest');
      if (userRequest) {
        this.userRequest = userRequest;
        console.log('📝 [旅行计划页] 用户需求:', userRequest);
      } else {
        this.userRequest = '我想去日本旅行7天，预算1万元，主要想体验日本的文化和美食';
        console.log('⚠️ [旅行计划页] 未找到用户需求，使用默认值');
      }
      
      // 从sessionStorage获取API生成的旅行计划
      const tripPlanData = sessionStorage.getItem('tripPlan');
      if (tripPlanData) {
        try {
          const tripPlan = JSON.parse(tripPlanData);
          console.log('✅ [旅行计划页] 加载API生成的旅行计划:', tripPlan);
          
          // 更新组件数据
          this.tripDetails = tripPlan.tripDetails || this.tripDetails;
          this.itinerary = tripPlan.itinerary || this.itinerary;
          this.costBreakdown = tripPlan.costBreakdown || this.costBreakdown;
          
          // 更新地图点（基于行程生成）
          this.updateMapPoints();
          
          console.log('🎯 [旅行计划页] 旅行计划加载完成');
          
        } catch (error) {
          console.error('❌ [旅行计划页] 解析旅行计划失败:', error);
          console.log('⚠️ [旅行计划页] 使用默认旅行计划');
        }
      } else {
        console.log('⚠️ [旅行计划页] 未找到旅行计划数据，使用默认计划');
      }
    },
    
    updateMapPoints() {
      // 基于行程生成地图点
      const points = [];
      let pointIndex = 0;
      
      this.itinerary.forEach((day, dayIndex) => {
        day.activities.forEach((activity, activityIndex) => {
          if (activity.title && !points.find(p => p.name === activity.title)) {
            points.push({
              name: activity.title,
              x: 20 + (pointIndex % 5) * 15,
              y: 20 + Math.floor(pointIndex / 5) * 15,
              color: this.getPointColor(activityIndex),
              day: dayIndex,
              activity: activityIndex
            });
            pointIndex++;
          }
        });
      });
      
      this.mapPoints = points;
      console.log('🗺️ [旅行计划页] 地图点已更新:', points);
    },
    
    getPointColor(activityIndex) {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
      return colors[activityIndex % colors.length];
    },
    
    selectDay(dayIndex) {
      this.selectedDay = dayIndex;
    },
    toggleMapView() {
      this.mapView = this.mapView === 'route' ? 'attractions' : 'route';
    },
    goBack() {
      this.$router.push('/');
    },
    savePlan() {
      console.log('保存旅行计划');
      // 这里可以添加保存计划的逻辑
    },
    exportPlan() {
      try {
        // 1) 组装文本内容
        const lines = [];
        lines.push(`旅行计划`);
        lines.push(`——————`);
        if (this.planId) lines.push(`计划ID: ${this.planId}`);
        lines.push(`状态: ${this.planStatus === 'completed' ? '已完成' : '规划中'}`);
        if (this.planStatus === 'completed') {
          lines.push(`实际总花费: ¥${Number(this.actualSpending || 0).toLocaleString()}`);
        }
        lines.push('');
        lines.push(`目的地: ${this.tripDetails.destination || ''}`);
        lines.push(`出发时间: ${this.tripDetails.startDate || ''}`);
        lines.push(`旅行天数: ${this.tripDetails.duration || ''} 天`);
        lines.push(`预算范围: ¥${Number(this.tripDetails.budget || 0).toLocaleString()}`);
        lines.push('');
        lines.push(`费用明细`);
        lines.push(`- 住宿: ¥${Number(this.costBreakdown.accommodation || 0).toLocaleString()}`);
        lines.push(`- 交通: ¥${Number(this.costBreakdown.transportation || 0).toLocaleString()}`);
        lines.push(`- 餐饮: ¥${Number(this.costBreakdown.food || 0).toLocaleString()}`);
        lines.push(`- 门票: ¥${Number(this.costBreakdown.tickets || 0).toLocaleString()}`);
        lines.push(`- 其他: ¥${Number(this.costBreakdown.others || 0).toLocaleString()}`);
        const total = Object.values(this.costBreakdown).reduce((s, v) => s + (Number(v) || 0), 0);
        lines.push(`总费用: ¥${Number(total).toLocaleString()}`);
        lines.push('');
        lines.push('行程安排');
        this.itinerary.forEach((day, idx) => {
          lines.push(`第${idx + 1}天 ${day.date || ''}`);
          (day.activities || []).forEach((act) => {
            lines.push(`  - 时间: ${act.time || ''}`);
            lines.push(`    标题: ${act.title || ''}`);
            lines.push(`    描述: ${act.description || ''}`);
            if (act.duration) lines.push(`    时长: ${act.duration}`);
            if (act.cost !== undefined) lines.push(`    费用: ¥${Number(act.cost || 0).toLocaleString()}`);
          });
          lines.push('');
        });

        const content = lines.join('\n');

        // 2) 生成并下载 txt 文件
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeDest = (this.tripDetails.destination || '旅行计划').replace(/[\\/:*?"<>|]/g, '_');
        const datePart = (this.tripDetails.startDate || '').replace(/[^0-9-]/g, '') || 'date';
        a.href = url;
        a.download = `${safeDest}_${datePart}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage('已导出为文本文件', 'success');
      } catch (e) {
        console.error('导出计划失败:', e);
        this.showMessage('导出失败，请稍后重试', 'danger');
      }
    },

    async savePlan() {
      if (this.isReadOnly) {
        this.showMessage('该计划已保存，当前为只读模式，不能再次保存。', 'info');
        return;
      }
      try {
        // 1) 确认登录
        const user = await this.ensureLoggedIn();
        if (!user) {
          console.log('未登录，跳转到登录页');
          this.$router.push({ path: '/login', query: { redirect: '/planning' } });
          return;
        }

        // 2) 组织要保存的数据
        const title = this.userRequest && this.userRequest.trim()
          ? this.userRequest.trim().slice(0, 200)
          : `${this.tripDetails.destination} ${this.tripDetails.duration}天行程`;

        const startDate = this.tripDetails.startDate;
        const duration = Number(this.tripDetails.duration) || 1;
        const endDate = this.computeEndDate(startDate, duration);
        const budget = Number(this.tripDetails.budget) || null;

        const payload = {
          user_id: user.id,
          title,
          destination: this.tripDetails.destination || '未指定',
          start_date: startDate,
          end_date: endDate,
          duration,
          budget,
          status: 'planning',
          itinerary: this.itinerary || [],
          cost_breakdown: {
            accommodation: Number(this.costBreakdown.accommodation) || 0,
            transportation: Number(this.costBreakdown.transportation) || 0,
            food: Number(this.costBreakdown.food) || 0,
            tickets: Number(this.costBreakdown.tickets) || 0,
            others: Number(this.costBreakdown.others) || 0
          }
        };

        console.log('📝 即将保存旅行计划:', payload);

        // 3) 保存到 Supabase
        const { data, error } = await supabase
          .from('travel_plans')
          .insert([payload])
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        console.log('✅ 旅行计划保存成功:', data);
        this.showMessage('旅行计划已保存到您的账户', 'success');
      } catch (err) {
        console.error('❌ 保存旅行计划失败:', err);
        this.showMessage(`保存失败: ${err.message || '未知错误'}`, 'danger');
      }
    },
    openCompleteModal() {
      if (!this.planId) return;
      this.completeAmount = this.actualSpending ? String(this.actualSpending) : '';
      this.showCompleteModal = true;
    },
    async confirmComplete() {
      const amountNum = Number(this.completeAmount);
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        this.showMessage('请输入有效的实际总花费（非负数）', 'danger');
        return;
      }
      try {
        const { error } = await supabase
          .from('travel_plans')
          .update({ status: 'completed', actual_spending: amountNum })
          .eq('id', this.planId);
        if (error) throw error;
        this.planStatus = 'completed';
        this.actualSpending = amountNum;
        this.showCompleteModal = false;
        this.showMessage('已标记为完成旅行，并记录实际花费', 'success');
      } catch (e) {
        console.error('标记完成失败:', e);
        this.showMessage('标记完成失败，请稍后重试', 'danger');
      }
    },
    showMessage(text, type = 'info') {
      this.messageText = text;
      this.messageType = type;
      this.showMessageModal = true;
    },
    handleMessageClose() {
      this.showMessageModal = false;
    }
  }
};
</script>

<style scoped>
.trip-planning-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.main-content {
  padding: 40px 24px;
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 用户需求卡片 */
.user-request-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.request-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.request-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

/* 规划内容区域 */
.planning-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* 行程安排 */
.itinerary-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.itinerary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-item {
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.day-item:hover {
  border-color: #667eea;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e1e5e9;
}

.day-number {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.day-activities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-time {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  min-width: 50px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.activity-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 地图区域 */
.map-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.map-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-controls {
  display: flex;
  gap: 8px;
}

.map-btn {
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-btn:hover {
  background: #667eea;
  color: white;
}

.map-content {
  height: 400px;
  position: relative;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.mock-map {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
}

.map-points {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-point {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.map-point:hover {
  transform: scale(1.2);
}

.point-number {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.route-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* 费用明细 */
.cost-breakdown {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cost-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e1e5e9;
}

.cost-label {
  font-size: 14px;
  color: #666;
}

.cost-amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 8px;
  border-top: 2px solid #667eea;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.total-label {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .planning-content {
    grid-template-columns: 1fr;
  }
  
  .request-details {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .request-details {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
}
</style>
