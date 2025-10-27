/**
 * 阿里云百炼大模型API工具
 * 用于生成旅行计划
 * 
 * 注意：由于CORS限制，当前使用模拟数据
 * 如需使用真实API，需要：
 * 1. 配置后端代理服务器
 * 2. 或者使用阿里云提供的SDK
 * 3. 或者通过云函数调用
 */

class BailianAPI {
  constructor() {
    this.apiKey = process.env.VUE_APP_BAILIAN_API_KEY || 'sk-4dd76a7ef7464c3c98f18339a7b31bf2';
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1';
    this.model = 'qwen-plus'; // 使用通义千问模型
  }

  /**
   * 生成旅行计划
   * @param {string} userRequest 用户需求描述
   * @returns {Promise<Object>} 旅行计划数据
   */
  async generateTripPlan(userRequest) {
    try {
      console.log('🤖 [阿里云百炼API] 开始生成旅行计划');
      console.log('📝 [阿里云百炼API] 用户需求:', userRequest);

      // 调用后端代理服务器
      const response = await fetch('http://localhost:3001/api/generate-trip-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userRequest })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`后端API调用失败: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '旅行计划生成失败');
      }

      console.log('✅ [阿里云百炼API] 旅行计划生成成功:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ [阿里云百炼API] 生成旅行计划失败:', error);
      
      // 如果后端服务器不可用，使用模拟数据作为备用
      if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
        console.log('⚠️ [阿里云百炼API] 后端服务器不可用，使用模拟数据');
        return this.generateMockTripPlan(userRequest);
      }
      
      throw error;
    }
  }

  /**
   * 真实API调用方法（需要解决CORS问题后使用）
   * @param {string} userRequest 用户需求描述
   * @returns {Promise<Object>} 旅行计划数据
   */
  async generateTripPlanRealAPI(userRequest) {
    try {
      console.log('🤖 [阿里云百炼API] 开始调用真实API生成旅行计划');
      console.log('📝 [阿里云百炼API] 用户需求:', userRequest);

      const prompt = this.buildPrompt(userRequest);
      
      const response = await fetch(`${this.baseURL}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 0.8
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 [阿里云百炼API] 收到响应:', data);

      if (data.code !== 'Success') {
        throw new Error(`API错误: ${data.message || '未知错误'}`);
      }

      // 解析生成的旅行计划
      const tripPlan = this.parseTripPlan(data.output.text);
      console.log('✅ [阿里云百炼API] 旅行计划生成成功:', tripPlan);

      return tripPlan;

    } catch (error) {
      console.error('❌ [阿里云百炼API] 生成旅行计划失败:', error);
      throw error;
    }
  }

  /**
   * 生成模拟旅行计划（用于演示）
   * @param {string} userRequest 用户需求
   * @returns {Object} 模拟旅行计划
   */
  generateMockTripPlan(userRequest) {
    // 解析用户需求
    const destination = this.extractDestination(userRequest);
    const duration = this.extractDuration(userRequest);
    const budget = this.extractBudget(userRequest);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 一周后出发
    
    const tripPlan = {
      tripDetails: {
        destination: destination,
        startDate: startDate.toISOString().split('T')[0],
        duration: duration,
        budget: budget
      },
      itinerary: [],
      costBreakdown: {
        accommodation: Math.floor(budget * 0.4),
        transportation: Math.floor(budget * 0.3),
        food: Math.floor(budget * 0.2),
        tickets: Math.floor(budget * 0.08),
        others: Math.floor(budget * 0.02)
      }
    };

    // 生成每日行程
    for (let i = 0; i < duration; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      
      const dayPlan = {
        date: dayDate.toISOString().split('T')[0],
        activities: this.generateDayActivities(destination, i, duration)
      };
      
      tripPlan.itinerary.push(dayPlan);
    }

    return tripPlan;
  }

  /**
   * 提取目的地
   */
  extractDestination(userRequest) {
    const destinations = {
      '日本': '日本东京、京都、大阪',
      '韩国': '韩国首尔、釜山、济州岛',
      '泰国': '泰国曼谷、清迈、普吉岛',
      '新加坡': '新加坡',
      '马来西亚': '马来西亚吉隆坡、槟城、马六甲',
      '欧洲': '法国巴黎、意大利罗马、西班牙巴塞罗那',
      '美国': '美国纽约、洛杉矶、旧金山',
      '澳洲': '澳大利亚悉尼、墨尔本、黄金海岸'
    };

    for (const [key, value] of Object.entries(destinations)) {
      if (userRequest.includes(key)) {
        return value;
      }
    }
    
    return '日本东京、京都、大阪'; // 默认
  }

  /**
   * 提取旅行天数
   */
  extractDuration(userRequest) {
    const durationMatch = userRequest.match(/(\d+)天/);
    return durationMatch ? parseInt(durationMatch[1]) : 7;
  }

  /**
   * 提取预算
   */
  extractBudget(userRequest) {
    const budgetMatch = userRequest.match(/(\d+)[万千]?元/);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      return userRequest.includes('万') ? amount * 10000 : amount;
    }
    return 10000; // 默认1万元
  }

  /**
   * 生成每日活动
   */
  generateDayActivities(destination, dayIndex, totalDays) {
    const activities = [];
    
    if (dayIndex === 0) {
      // 第一天：抵达
      activities.push(
        { time: '09:00', title: '抵达目的地', description: '开始您的旅程', duration: '2小时', cost: 0 },
        { time: '12:00', title: '酒店入住', description: '办理入住手续，休息调整', duration: '1小时', cost: 0 },
        { time: '14:00', title: '城市探索', description: '熟悉周边环境，了解当地文化', duration: '3小时', cost: 200 },
        { time: '18:00', title: '当地美食', description: '品尝特色美食，体验当地文化', duration: '2小时', cost: 300 }
      );
    } else if (dayIndex === totalDays - 1) {
      // 最后一天：离开
      activities.push(
        { time: '09:00', title: '最后购物', description: '购买纪念品和特产', duration: '2小时', cost: 500 },
        { time: '12:00', title: '退房准备', description: '整理行李，准备离开', duration: '1小时', cost: 0 },
        { time: '15:00', title: '前往机场', description: '前往机场，准备返程', duration: '2小时', cost: 200 }
      );
    } else {
      // 中间天数：游览
      const dayActivities = [
        { time: '09:00', title: '著名景点游览', description: '参观当地著名景点', duration: '3小时', cost: 400 },
        { time: '13:00', title: '当地餐厅', description: '品尝地道美食', duration: '1小时', cost: 200 },
        { time: '15:00', title: '文化体验', description: '体验当地传统文化', duration: '2小时', cost: 300 },
        { time: '18:00', title: '自由活动', description: '自由安排，享受休闲时光', duration: '2小时', cost: 150 }
      ];
      activities.push(...dayActivities);
    }

    return activities;
  }

  /**
   * 构建提示词
   * @param {string} userRequest 用户需求
   * @returns {string} 格式化的提示词
   */
  buildPrompt(userRequest) {
    return `请根据以下用户需求生成一份详细的旅行计划，要求：

1. 旅行计划格式为JSON格式，包含以下结构：
{
  "tripDetails": {
    "destination": "目的地",
    "startDate": "出发日期(YYYY-MM-DD格式)",
    "duration": 天数(数字),
    "budget": 预算(数字)
  },
  "itinerary": [
    {
      "date": "日期(YYYY-MM-DD格式)",
      "activities": [
        {
          "time": "时间(HH:MM格式)",
          "title": "活动标题",
          "description": "简短描述",
          "duration": "持续时间",
          "cost": 花费(数字)
        }
      ]
    }
  ],
  "costBreakdown": {
    "accommodation": 住宿费用,
    "transportation": 交通费用,
    "food": 餐饮费用,
    "tickets": 门票费用,
    "others": 其他费用
  }
}

2. 要求：
- 每天安排3-5个活动
- 每个活动包含时间、地点、简短描述、花费
- 时间安排要合理，考虑交通时间
- 花费要符合预算范围
- 活动要符合目的地特色
- 返回纯JSON格式，不要包含其他文字

用户需求：${userRequest}

请生成旅行计划：`;
  }

  /**
   * 解析旅行计划
   * @param {string} text API返回的文本
   * @returns {Object} 解析后的旅行计划
   */
  parseTripPlan(text) {
    try {
      // 尝试提取JSON部分
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法找到JSON格式的旅行计划');
      }

      const jsonStr = jsonMatch[0];
      const tripPlan = JSON.parse(jsonStr);

      // 验证必要字段
      if (!tripPlan.tripDetails || !tripPlan.itinerary || !tripPlan.costBreakdown) {
        throw new Error('旅行计划格式不完整');
      }

      // 确保日期格式正确
      if (tripPlan.tripDetails.startDate) {
        const startDate = new Date(tripPlan.tripDetails.startDate);
        tripPlan.itinerary.forEach((day, index) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + index);
          day.date = dayDate.toISOString().split('T')[0];
        });
      }

      return tripPlan;

    } catch (error) {
      console.error('❌ [阿里云百炼API] 解析旅行计划失败:', error);
      
      // 返回默认旅行计划作为备用
      return this.getDefaultTripPlan();
    }
  }

  /**
   * 获取默认旅行计划（备用方案）
   * @returns {Object} 默认旅行计划
   */
  getDefaultTripPlan() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return {
      tripDetails: {
        destination: '目的地待定',
        startDate: tomorrow.toISOString().split('T')[0],
        duration: 3,
        budget: 5000
      },
      itinerary: [
        {
          date: tomorrow.toISOString().split('T')[0],
          activities: [
            {
              time: '09:00',
              title: '抵达目的地',
              description: '开始您的旅程',
              duration: '1小时',
              cost: 0
            },
            {
              time: '10:00',
              title: '城市探索',
              description: '了解当地文化',
              duration: '3小时',
              cost: 200
            },
            {
              time: '14:00',
              title: '当地美食',
              description: '品尝特色美食',
              duration: '1小时',
              cost: 150
            }
          ]
        }
      ],
      costBreakdown: {
        accommodation: 1000,
        transportation: 800,
        food: 600,
        tickets: 400,
        others: 300
      }
    };
  }
}

// 创建单例实例
const bailianAPI = new BailianAPI();

export default bailianAPI;
