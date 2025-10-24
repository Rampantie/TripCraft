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
  </div>
</template>

<script>
import Navbar from './Navbar.vue';

export default {
  name: 'TripPlanning',
  components: {
    Navbar
  },
  data() {
    return {
      userRequest: '',
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
    // 获取从主页传递的用户输入
    if (this.$route.query.request) {
      this.userRequest = this.$route.query.request;
    } else {
      this.userRequest = '我想去日本旅行7天，预算1万元，主要想体验日本的文化和美食';
    }
  },
  methods: {
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
      console.log('导出旅行计划');
      // 这里可以添加导出计划的逻辑
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
