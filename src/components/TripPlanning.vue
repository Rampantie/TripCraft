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
                      <div 
                        v-if="activity.latitude && activity.longitude" 
                        class="activity-route-controls"
                      >
                        <button
                          class="route-btn route-btn-origin"
                          :class="{ 'active': isSelectedAsOrigin(day, actIndex) }"
                          @click.stop="setAsOrigin(day, actIndex)"
                          :title="isSelectedAsOrigin(day, actIndex) ? '已设为起点' : '设为起点'"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                          </svg>
                          起点
                        </button>
                        <button
                          class="route-btn route-btn-destination"
                          :class="{ 'active': isSelectedAsDestination(day, actIndex) }"
                          @click.stop="setAsDestination(day, actIndex)"
                          :title="isSelectedAsDestination(day, actIndex) ? '已设为终点' : '设为终点'"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="10" r="3" fill="currentColor"/>
                          </svg>
                          终点
                        </button>
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
                <h3 class="section-title">城市地图</h3>
                <div class="map-controls">
                  <button
                    v-if="selectedOrigin && selectedDestination"
                    class="btn-primary"
                    :disabled="isNavigating"
                    @click="showNavigationRoute"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ isNavigating ? '规划路线中...' : '规划路线' }}
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
              <div v-if="selectedOrigin || selectedDestination" class="route-selection-info">
                <div v-if="selectedOrigin" class="route-selection-item">
                  <span class="route-label route-label-origin">起点：</span>
                  <span class="route-value">{{ getActivityDisplay(selectedOrigin) }}</span>
                  <button class="route-clear-btn" @click="clearOrigin" title="清除起点">×</button>
                </div>
                <div v-if="selectedDestination" class="route-selection-item">
                  <span class="route-label route-label-destination">终点：</span>
                  <span class="route-value">{{ getActivityDisplay(selectedDestination) }}</span>
                  <button class="route-clear-btn" @click="clearDestination" title="清除终点">×</button>
                </div>
              </div>
              <div class="map-content">
                <div ref="baiduMap" class="baidu-map"></div>
              </div>
            </div>

            <!-- 费用统计 -->
            <div class="cost-breakdown">
              <h3 class="section-title">费用估计</h3>
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
        <label class="complete-label">实际出发日期</label>
        <input
          v-model="completeDate"
          type="date"
          class="complete-input"
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
      completeDate: '',
      selectedDay: 0,
      mapView: 'route',
      baiduMap: null,
      baiduMarkers: [],
      selectedOrigin: null, // { dayIndex, activityIndex, activity }
      selectedDestination: null, // { dayIndex, activityIndex, activity }
      isNavigating: false,
      navigationRoute: null,
      trackAnimation: null,
      animationMarker: null,
      routeStartMarker: null, // 路线起点标记
      routeEndMarker: null, // 路线终点标记
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
    // 等待百度地图脚本加载完成
    this.$nextTick(() => {
      this.initBaiduMap();
    });
  },
  methods: {
    async loadPlanById(id) {
      try {
        console.log('🔎 [旅行计划页] 加载已保存计划 ID:', id);
        const { data, error } = await supabase
          .from('travel_plans')
          .select('title, destination, start_date, end_date, duration, budget, status, actual_spending, itinerary, cost_breakdown, latitude, longitude')
          .eq('id', id)
          .single();

        if (error) throw error;

        // 将数据库数据映射到界面
        this.userRequest = data.title || '';
        this.tripDetails = {
          destination: data.destination || '',
          startDate: data.start_date || '',
          duration: data.duration || 1,
          budget: Number(data.budget) || 0,
          latitude: (data.latitude !== undefined && data.latitude !== null) ? Number(data.latitude) : undefined,
          longitude: (data.longitude !== undefined && data.longitude !== null) ? Number(data.longitude) : undefined
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
        // 刷新百度地图标记
        this.$nextTick(() => {
          this.refreshBaiduMarkers();
        });
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
          // 刷新百度地图标记
          this.$nextTick(() => {
            this.refreshBaiduMarkers();
          });
          
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
      this.$nextTick(() => this.refreshBaiduMarkers());
    },
    
    getPointColor(activityIndex) {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
      return colors[activityIndex % colors.length];
    },
    initBaiduMap() {
      try {
        // 等待百度地图 API 加载完成
        if (typeof window.BMapGL === 'undefined' && typeof window.BMap === 'undefined') {
          console.warn('百度地图 API 未加载，等待加载...');
          setTimeout(() => this.initBaiduMap(), 500);
          return;
        }
        
        // 如果没有 BMapGL，使用 BMap（普通版本）
        if (typeof window.BMapGL === 'undefined' && window.BMap) {
          window.BMapGL = window.BMap;
          console.log('ℹ️ 使用 BMap 作为 BMapGL');
        }

        const el = this.$refs.baiduMap;
        if (!el) {
          console.warn('地图容器元素不存在');
          return;
        }

        // 如果已有地图实例，先销毁
        if (this.baiduMap) {
          try {
            this.baiduMap = null;
          } catch (e) {
            console.warn('销毁旧地图实例失败:', e);
          }
        }

        console.log('🗺️ 开始初始化百度地图...');
        
        // 默认中心设为北京
        const defaultCenter = new window.BMapGL.Point(116.4074, 39.9042);
        this.baiduMap = new window.BMapGL.Map(el, {
          enableMapClick: true
        });
        
        // 初始化地图，设置中心点和缩放级别
        this.baiduMap.centerAndZoom(defaultCenter, 5);
        
        // 启用滚轮缩放
        this.baiduMap.enableScrollWheelZoom(true);
        
        // 添加地图控件
        const navCtrl = new window.BMapGL.NavigationControl();
        this.baiduMap.addControl(navCtrl);
        
        const scaleCtrl = new window.BMapGL.ScaleControl();
        this.baiduMap.addControl(scaleCtrl);

        console.log('✅ 百度地图初始化成功');
        
        // 刷新标记
        this.refreshBaiduMarkers();
      } catch (e) {
        console.error('❌ 百度地图初始化失败:', e);
        this.showMessage(`百度地图初始化失败: ${e.message}`, 'danger');
      }
    },
    async refreshBaiduMarkers() {
      if (!this.baiduMap || typeof window.BMapGL === 'undefined') {
        console.warn('地图实例或 BMapGL 未就绪，跳过标记刷新');
        return;
      }

      // 清理旧标记
      this.baiduMarkers.forEach(marker => {
        this.baiduMap.removeOverlay(marker);
      });
      this.baiduMarkers = [];

      // 优先使用 tripDetails 中的经纬度
      const lat = Number(this.tripDetails.latitude);
      const lng = Number(this.tripDetails.longitude);
      
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        // 百度地图使用 BD09 坐标系，如果传入的是 WGS84 坐标，需要转换
        // 但通常 AI 返回的坐标可能需要转换，这里先直接使用
        // 注意：百度地图的坐标顺序是 [经度, 纬度]
        const point = new window.BMapGL.Point(lng, lat);
        
        // 创建标记
        const marker = new window.BMapGL.Marker(point);
        this.baiduMap.addOverlay(marker);
        
        // 创建信息窗口
        const infoWindow = new window.BMapGL.InfoWindow(
          `<div style="padding: 10px;">
            <strong>${this.tripDetails.destination || '目的地'}</strong><br/>
            旅行目的地
          </div>`,
          { width: 200, height: 80 }
        );
        
        // 点击标记显示信息窗口
        marker.addEventListener('click', () => {
          this.baiduMap.openInfoWindow(infoWindow, point);
        });
        
        this.baiduMarkers.push(marker);
        
        // 调整地图视野以包含标记点
        this.baiduMap.centerAndZoom(point, 10);
      } else {
        // 若无经纬度，尝试使用百度地图的地理编码服务
        const destination = this.tripDetails.destination || '';
        if (destination) {
          await this.geocodeBaidu(destination);
        }
      }
    },
    // 起点和终点选择相关方法
    setAsOrigin(day, activityIndex) {
      const dayIndex = this.itinerary.indexOf(day);
      const activity = day.activities[activityIndex];
      
      if (!activity.latitude || !activity.longitude) {
        this.showMessage('该活动没有经纬度信息', 'warning');
        return;
      }
      
      this.selectedOrigin = {
        dayIndex,
        activityIndex,
        activity: { ...activity }
      };
      
      // 如果选中的是当前终点，清除终点
      if (this.selectedDestination && 
          this.selectedDestination.dayIndex === dayIndex && 
          this.selectedDestination.activityIndex === activityIndex) {
        this.selectedDestination = null;
      }
      
      // 清除之前的路线
      this.clearNavigationRoute();
      
      this.showMessage(`已将"${activity.title}"设为起点`, 'success');
    },
    setAsDestination(day, activityIndex) {
      const dayIndex = this.itinerary.indexOf(day);
      const activity = day.activities[activityIndex];
      
      if (!activity.latitude || !activity.longitude) {
        this.showMessage('该活动没有经纬度信息', 'warning');
        return;
      }
      
      this.selectedDestination = {
        dayIndex,
        activityIndex,
        activity: { ...activity }
      };
      
      // 如果选中的是当前起点，清除起点
      if (this.selectedOrigin && 
          this.selectedOrigin.dayIndex === dayIndex && 
          this.selectedOrigin.activityIndex === activityIndex) {
        this.selectedOrigin = null;
      }
      
      // 清除之前的路线
      this.clearNavigationRoute();
      
      this.showMessage(`已将"${activity.title}"设为终点`, 'success');
    },
    clearOrigin() {
      this.selectedOrigin = null;
      this.clearNavigationRoute();
      this.showMessage('已清除起点', 'info');
    },
    clearDestination() {
      this.selectedDestination = null;
      this.clearNavigationRoute();
      this.showMessage('已清除终点', 'info');
    },
    isSelectedAsOrigin(day, activityIndex) {
      if (!this.selectedOrigin) return false;
      const dayIndex = this.itinerary.indexOf(day);
      return this.selectedOrigin.dayIndex === dayIndex && 
             this.selectedOrigin.activityIndex === activityIndex;
    },
    isSelectedAsDestination(day, activityIndex) {
      if (!this.selectedDestination) return false;
      const dayIndex = this.itinerary.indexOf(day);
      return this.selectedDestination.dayIndex === dayIndex && 
             this.selectedDestination.activityIndex === activityIndex;
    },
    getActivityDisplay(selection) {
      if (!selection || !selection.activity) return '';
      return `${selection.activity.time} ${selection.activity.title}`;
    },
    async showNavigationRoute() {
      if (!this.selectedOrigin || !this.selectedDestination) {
        this.showMessage('请先选择起点和终点', 'warning');
        return;
      }

      if (!this.baiduMap || typeof window.BMapGL === 'undefined') {
        this.showMessage('地图未初始化，请稍后再试', 'danger');
        return;
      }

      this.isNavigating = true;

      try {
        // 先清除之前的路线
        this.clearNavigationRoute();

        // 使用选中活动的经纬度
        const originPoint = new window.BMapGL.Point(
          this.selectedOrigin.activity.longitude,
          this.selectedOrigin.activity.latitude
        );
        const destinationPoint = new window.BMapGL.Point(
          this.selectedDestination.activity.longitude,
          this.selectedDestination.activity.latitude
        );

        console.log('✅ 使用活动坐标:', {
          origin: { 
            lat: this.selectedOrigin.activity.latitude, 
            lng: this.selectedOrigin.activity.longitude,
            title: this.selectedOrigin.activity.title
          },
          destination: { 
            lat: this.selectedDestination.activity.latitude, 
            lng: this.selectedDestination.activity.longitude,
            title: this.selectedDestination.activity.title
          }
        });
        
        // 验证坐标是否在中国境内（粗略判断）
        const isInChina = (lng, lat) => {
          // 中国大致范围：经度 73-135，纬度 18-54
          return lng >= 73 && lng <= 135 && lat >= 18 && lat <= 54;
        };
        
        const originInChina = isInChina(this.selectedOrigin.activity.longitude, this.selectedOrigin.activity.latitude);
        const destInChina = isInChina(this.selectedDestination.activity.longitude, this.selectedDestination.activity.latitude);
        
        if (!originInChina || !destInChina) {
          console.warn('⚠️ 警告：起点或终点可能不在中国境内');
          console.log('起点在中国境内:', originInChina, '终点在中国境内:', destInChina);
          this.showMessage('提示：百度地图路线规划主要支持中国境内。如果起点或终点在国外，可能无法规划详细路线。', 'warning');
        }

        // 创建起点和终点标记
        const startIcon = new window.BMapGL.Icon(
          'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#10b981" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>'),
          new window.BMapGL.Size(32, 32)
        );
        const endIcon = new window.BMapGL.Icon(
          'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>'),
          new window.BMapGL.Size(32, 32)
        );
        
        const startMarker = new window.BMapGL.Marker(originPoint, { icon: startIcon });
        const endMarker = new window.BMapGL.Marker(destinationPoint, { icon: endIcon });

        this.baiduMap.addOverlay(startMarker);
        this.baiduMap.addOverlay(endMarker);
        // 保存标记引用以便清除
        this.routeStartMarker = startMarker;
        this.routeEndMarker = endMarker;

        // 创建起点和终点的信息窗口
        const startInfoWindow = new window.BMapGL.InfoWindow(
          `<div style="padding: 10px;"><strong>起点</strong><br/>${this.selectedOrigin.activity.title}</div>`,
          { width: 200, height: 80 }
        );
        const endInfoWindow = new window.BMapGL.InfoWindow(
          `<div style="padding: 10px;"><strong>终点</strong><br/>${this.selectedDestination.activity.title}</div>`,
          { width: 200, height: 80 }
        );

        startMarker.addEventListener('click', () => {
          this.baiduMap.openInfoWindow(startInfoWindow, originPoint);
        });
        endMarker.addEventListener('click', () => {
          this.baiduMap.openInfoWindow(endInfoWindow, destinationPoint);
        });

        // 路线规划：使用驾车路线规划
        // 注意：百度地图路线规划主要支持中国境内，国外地址可能无法规划路线
        const driving = new window.BMapGL.DrivingRoute(this.baiduMap, {
          renderOptions: {
            map: this.baiduMap,
            autoViewport: true,
            showMarkers: false // 我们已经手动添加了标记
          },
          onSearchComplete: (results) => {
            const status = driving.getStatus();
            console.log('路线规划状态:', status);
            console.log('路线规划结果:', results);
            
            // 百度地图状态码：0或BMAP_STATUS_SUCCESS表示成功
            // 状态码说明：
            // 0 - 检索成功
            // 1 - 检索失败：服务器内部错误
            // 2 - 检索失败：起点或终点坐标非法
            // 3 - 检索失败：起点或终点不在中国境内
            // 4 - 检索失败：起点或终点附近没有找到道路
            // 5 - 检索失败：检索无结果
            // 6 - 检索失败：检索超时
            const statusMessages = {
              0: '路线规划成功',
              1: '服务器内部错误',
              2: '起点或终点坐标非法',
              3: '起点或终点不在中国境内（百度地图路线规划主要支持中国境内）',
              4: '起点或终点附近没有找到道路',
              5: '检索无结果，可能起点终点距离过远或无法到达',
              6: '检索超时'
            };
            
            const statusText = statusMessages[status] || `未知错误（状态码：${status}）`;
            console.log('状态说明:', statusText);
            
            // 检查状态：0 表示成功
            if (status === 0) {
              try {
                const plan = results.getPlan(0);
                if (!plan) {
                  throw new Error('无法获取路线规划结果');
                }
                
                const route = plan.getRoute(0);
                if (!route) {
                  throw new Error('无法获取路线');
                }
                
                // 获取路线路径点
                const path = [];
                
                // 尝试方法1：直接使用 route.getPoints() 获取所有路径点
                try {
                  if (route.getPoints && typeof route.getPoints === 'function') {
                    const routePoints = route.getPoints();
                    if (routePoints && routePoints.length > 0) {
                      for (let i = 0; i < routePoints.length; i++) {
                        path.push(routePoints[i]);
                      }
                      console.log('✅ 使用方法1 (getPoints) 获取路径点:', path.length);
                    }
                  }
                } catch (e) {
                  console.warn('方法1失败:', e);
                }
                
                // 尝试方法2：遍历步骤获取路径点
                if (path.length === 0 && route.getNumSteps) {
                  try {
                    const numSteps = route.getNumSteps();
                    for (let i = 0; i < numSteps; i++) {
                      const step = route.getStep(i);
                      if (step) {
                        let stepPoints = null;
                        
                        if (step.getPoints && typeof step.getPoints === 'function') {
                          stepPoints = step.getPoints();
                        } 
                        else if (step.points && Array.isArray(step.points)) {
                          stepPoints = step.points;
                        }
                        else if (step.path && Array.isArray(step.path)) {
                          stepPoints = step.path;
                        }
                        
                        if (stepPoints && stepPoints.length > 0) {
                          for (let j = 0; j < stepPoints.length; j++) {
                            path.push(stepPoints[j]);
                          }
                        }
                      }
                    }
                    if (path.length > 0) {
                      console.log('✅ 使用方法2 (遍历步骤) 获取路径点:', path.length);
                    }
                  } catch (e) {
                    console.error('方法2失败:', e);
                  }
                }
                
                // 如果还是没有路径点，使用起点和终点作为直线路径
                if (path.length === 0) {
                  console.warn('⚠️ 无法获取详细路径点，使用起点和终点绘制直线');
                  path.push(originPoint);
                  path.push(destinationPoint);
                }

                // 绘制路线
                const polyline = new window.BMapGL.Polyline(path, {
                  strokeColor: '#3388ff',
                  strokeWeight: 6,
                  strokeOpacity: 0.8
                });
                this.baiduMap.addOverlay(polyline);
                this.navigationRoute = polyline;

                // 调整地图视野以包含整条路线
                const points = [originPoint, destinationPoint];
                const viewport = this.baiduMap.getViewport(points, {
                  margins: [50, 50, 50, 50]
                });
                this.baiduMap.centerAndZoom(viewport.center, viewport.zoom);

                // 创建轨迹动画（如果有足够的路径点）
                if (path.length > 2) {
                  this.createTrackAnimation(path);
                }

                this.showMessage('路线规划成功', 'success');
              } catch (error) {
                console.error('处理路线规划结果失败:', error);
                this.showMessage('路线规划成功，但无法显示详细路线', 'warning');
              }
            } else {
              console.error('路线规划失败，状态码:', status);
              const errorMsg = status === 5 
                ? '路线规划失败：检索无结果。百度地图路线规划主要支持中国境内，如果起点或终点在国外，可能无法规划路线。您可以尝试使用直线连接查看大致位置。'
                : `路线规划失败：${statusMessages[status] || `状态码 ${status}`}`;
              this.showMessage(errorMsg, 'danger');
              
              // 即使路线规划失败，也显示起点和终点之间的直线连接
              if (status === 5 || status === 3) {
                console.log('尝试绘制起点和终点之间的直线连接');
                const straightPath = [originPoint, destinationPoint];
                const polyline = new window.BMapGL.Polyline(straightPath, {
                  strokeColor: '#ff9800',
                  strokeWeight: 4,
                  strokeOpacity: 0.6,
                  strokeStyle: 'dashed' // 虚线表示这不是实际路线
                });
                this.baiduMap.addOverlay(polyline);
                this.navigationRoute = polyline;
                this.showMessage('已显示起点和终点之间的直线连接（虚线），仅供参考', 'warning');
              }
            }
            this.isNavigating = false;
          }
        });

        // 搜索路线
        driving.search(originPoint, destinationPoint);

      } catch (error) {
        console.error('❌ 显示导航路线失败:', error);
        this.showMessage(error.message || '显示导航路线失败', 'danger');
        this.isNavigating = false;
      }
    },
    createTrackAnimation(path) {
      if (!path || path.length === 0) return;

      try {
        // 清除之前的动画和标记
        if (this.trackAnimation) {
          this.trackAnimation.cancel();
          this.trackAnimation = null;
        }
        if (this.animationMarker) {
          this.baiduMap.removeOverlay(this.animationMarker);
          this.animationMarker = null;
        }

        // 创建动画小车标记
        const carIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#3b82f6" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';
        const carIcon = new window.BMapGL.Icon(
          'data:image/svg+xml;base64,' + btoa(carIconSvg),
          new window.BMapGL.Size(32, 32),
          {
            anchor: new window.BMapGL.Size(16, 16)
          }
        );
        
        const carMarker = new window.BMapGL.Marker(path[0], { 
          icon: carIcon,
          enableDragging: false
        });
        this.baiduMap.addOverlay(carMarker);
        this.animationMarker = carMarker;

        // 创建轨迹动画
        this.trackAnimation = new window.BMapGL.TrackAnimation(this.baiduMap, carMarker, {
          duration: 10000, // 动画持续时间（毫秒）
          delay: 300, // 动画延迟
          overallView: false, // 动画过程中是否显示整体路线
          tilt: 30, // 地图倾斜角度
          zoom: 15 // 地图缩放级别
        });

        // 开始动画
        this.trackAnimation.start();
        console.log('✅ 轨迹动画已启动');

      } catch (error) {
        console.error('❌ 创建轨迹动画失败:', error);
      }
    },
    clearNavigationRoute() {
      // 清除路线
      if (this.navigationRoute) {
        this.baiduMap.removeOverlay(this.navigationRoute);
        this.navigationRoute = null;
      }

      // 停止并清除动画
      if (this.trackAnimation) {
        this.trackAnimation.cancel();
        this.trackAnimation = null;
      }

      // 清除动画标记
      if (this.animationMarker) {
        this.baiduMap.removeOverlay(this.animationMarker);
        this.animationMarker = null;
      }

      // 清除起点和终点标记
      if (this.routeStartMarker) {
        this.baiduMap.removeOverlay(this.routeStartMarker);
        this.routeStartMarker = null;
      }
      if (this.routeEndMarker) {
        this.baiduMap.removeOverlay(this.routeEndMarker);
        this.routeEndMarker = null;
      }
    },
    async geocodeBaidu(address) {
      try {
        if (typeof window.BMapGL === 'undefined') {
          console.warn('BMapGL 未定义，无法进行地理编码');
          return;
        }
        
        const geocoder = new window.BMapGL.Geocoder();
        geocoder.getPoint(
          address,
          (point) => {
            if (point) {
              // 创建标记
              const marker = new window.BMapGL.Marker(point);
              this.baiduMap.addOverlay(marker);
              
              // 创建信息窗口
              const infoWindow = new window.BMapGL.InfoWindow(
                `<div style="padding: 10px;">
                  <strong>${address}</strong><br/>
                  旅行目的地
                </div>`,
                { width: 200, height: 80 }
              );
              
              // 点击标记显示信息窗口
              marker.addEventListener('click', () => {
                this.baiduMap.openInfoWindow(infoWindow, point);
              });
              
              this.baiduMarkers.push(marker);
              
              // 调整地图视野以包含标记点
              this.baiduMap.centerAndZoom(point, 10);
            } else {
              console.warn('地理编码失败，未找到地址:', address);
              // 如果地理编码失败，使用默认中心
              const defaultCenter = new window.BMapGL.Point(116.4074, 39.9042);
              this.baiduMap.centerAndZoom(defaultCenter, 5);
            }
          },
          '全国'
        );
      } catch (e) {
        console.warn('百度地理编码失败:', address, e);
        // 使用默认中心
        if (this.baiduMap && typeof window.BMapGL !== 'undefined') {
          const defaultCenter = new window.BMapGL.Point(116.4074, 39.9042);
          this.baiduMap.centerAndZoom(defaultCenter, 5);
        }
      }
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
          },
          // 若模型已返回经纬度，则直接保存
          latitude: (this.tripDetails && Number.isFinite(Number(this.tripDetails.latitude))) ? Number(this.tripDetails.latitude) : null,
          longitude: (this.tripDetails && Number.isFinite(Number(this.tripDetails.longitude))) ? Number(this.tripDetails.longitude) : null
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
      this.completeDate = this.tripDetails.startDate || '';
      this.showCompleteModal = true;
    },
    async confirmComplete() {
      const amountNum = Number(this.completeAmount);
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        this.showMessage('请输入有效的实际总花费（非负数）', 'danger');
        return;
      }
      const dateStr = (this.completeDate || '').trim();
      if (!dateStr || isNaN(new Date(dateStr))) {
        this.showMessage('请输入有效的实际出发日期', 'danger');
        return;
      }
      const newStart = dateStr;
      const newEnd = this.computeEndDate(newStart, Number(this.tripDetails.duration) || 1);
      // 依据新出发日重写 itinerary 每天的 date 字段
      let updatedItinerary = this.itinerary;
      if (Array.isArray(this.itinerary)) {
        const start = new Date(newStart);
        updatedItinerary = this.itinerary.map((day, idx) => {
          const d = new Date(start);
          d.setDate(start.getDate() + idx);
          return { ...day, date: d.toISOString().split('T')[0] };
        });
      }
      try {
        const { error } = await supabase
          .from('travel_plans')
          .update({ status: 'completed', actual_spending: amountNum, start_date: newStart, end_date: newEnd, itinerary: updatedItinerary })
          .eq('id', this.planId);
        if (error) throw error;
        this.planStatus = 'completed';
        this.actualSpending = amountNum;
        // 同步本地日期与行程
        this.tripDetails.startDate = newStart;
        this.itinerary = updatedItinerary;
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

.activity-route-controls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.route-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.route-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.route-btn.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.route-btn-origin.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.route-btn-destination.active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.route-btn svg {
  flex-shrink: 0;
}

.route-selection-info {
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-selection-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.route-label {
  font-weight: 600;
  color: #333;
}

.route-label-origin {
  color: #10b981;
}

.route-label-destination {
  color: #ef4444;
}

.route-value {
  flex: 1;
  color: #666;
}

.route-clear-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #e1e5e9;
  color: #999;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.route-clear-btn:hover {
  background: #d1d5d9;
  color: #666;
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

.baidu-map {
  width: 100%;
  height: 100%;
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
