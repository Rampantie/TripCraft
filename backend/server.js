const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// 尝试加载环境变量，如果失败则使用默认值
try {
  require('dotenv').config();
} catch (error) {
  console.log('⚠️ [后端代理] 未找到dotenv，使用默认配置');
}

const app = express();
const PORT = process.env.PORT || 3001;

// 设置默认的API Key（如果环境变量未设置）
const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || 'sk-4dd76a7ef7464c3c98f18339a7b31bf2';

// 中间件
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'],
  credentials: true
}));
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TripCraft后端代理服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// API Key验证端点
app.get('/api/verify-key', async (req, res) => {
  try {
    const apiKey = BAILIAN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API Key未配置',
        suggestions: ['请在.env文件中配置BAILIAN_API_KEY']
      });
    }

    // 尝试调用一个简单的API来验证Key（同步调用）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
        // 移除 X-DashScope-Async 头，使用同步调用
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: '你好'
            }
          ]
        },
        parameters: {
          max_tokens: 10
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();
    
    if (response.ok && data.output && data.output.text) {
      res.json({
        success: true,
        message: 'API Key验证成功',
        apiKey: apiKey.substring(0, 10) + '...',
        model: 'qwen-plus',
        status: response.status,
        response: data.output.text
      });
    } else {
      res.status(response.status).json({
        success: false,
        error: `API Key验证失败: ${data.message || response.statusText}`,
        status: response.status,
        details: data,
        suggestions: [
          '1. 检查API Key是否正确',
          '2. 确认API Key有访问qwen-plus模型的权限',
          '3. 在阿里云百炼控制台申请模型访问权限'
        ]
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'API Key验证过程中发生错误: ' + error.message,
      suggestions: ['检查网络连接和API Key配置']
    });
  }
});

// 阿里云百炼API代理端点
app.post('/api/generate-trip-plan', async (req, res) => {
  try {
    console.log('🚀 [后端代理] 收到旅行计划生成请求');
    console.log('📝 [后端代理] 用户需求:', req.body.userRequest);

    const { userRequest } = req.body;
    
    if (!userRequest || !userRequest.trim()) {
      return res.status(400).json({ 
        error: '用户需求不能为空',
        code: 'INVALID_REQUEST'
      });
    }

    // 检查API密钥
    const apiKey = BAILIAN_API_KEY;
    if (!apiKey) {
      console.error('❌ [后端代理] 未配置BAILIAN_API_KEY环境变量');
      return res.status(500).json({ 
        error: '服务器配置错误：未配置API密钥',
        code: 'MISSING_API_KEY'
      });
    }

    // 构建提示词
    const prompt = buildPrompt(userRequest);
    console.log('📋 [后端代理] 构建的提示词长度:', prompt.length);

    // 调用阿里云百炼API（同步调用）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
        // 移除 X-DashScope-Async 头，使用同步调用
      },
      body: JSON.stringify({
        model: 'qwen-plus',
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
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('📡 [后端代理] 阿里云API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [后端代理] 阿里云API错误:', errorText);
      
      let errorMessage = `阿里云API调用失败: ${response.status} ${response.statusText}`;
      let suggestions = [];
      
      if (response.status === 403) {
        // 检查是否是异步调用错误
        if (errorText.includes('asynchronous calls')) {
          errorMessage = 'API不支持异步调用 (403 Forbidden)';
          suggestions = [
            '1. 已自动切换到同步调用模式',
            '2. 请重新尝试请求',
            '3. 如果仍有问题，请联系技术支持'
          ];
        } else {
          errorMessage = 'API访问被拒绝 (403 Forbidden)';
          suggestions = [
            '1. 检查API Key是否正确',
            '2. 确认API Key有访问qwen-plus模型的权限',
            '3. 检查API Key是否已过期',
            '4. 确认API Key与服务地域匹配',
            '5. 在阿里云百炼控制台申请模型访问权限'
          ];
        }
      } else if (response.status === 401) {
        errorMessage = 'API认证失败 (401 Unauthorized)';
        suggestions = [
          '1. 检查API Key是否正确',
          '2. 确认API Key格式正确',
          '3. 检查Authorization头格式'
        ];
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: errorText,
        code: 'BAILIAN_API_ERROR',
        suggestions: suggestions
      });
    }

    const data = await response.json();
    console.log('📥 [后端代理] 收到阿里云API响应:', JSON.stringify(data, null, 2));

    if (!data.output || !data.output.text) {
      console.error('❌ [后端代理] 阿里云API响应格式错误:', data);
      return res.status(400).json({ 
        error: `阿里云API响应格式错误: 缺少output.text字段`,
        code: 'INVALID_RESPONSE_FORMAT',
        details: data
      });
    }

    // 解析生成的旅行计划
    const tripPlan = parseTripPlan(data.output.text);
    console.log('✅ [后端代理] 旅行计划解析成功');

    res.json({
      success: true,
      data: tripPlan,
      message: '旅行计划生成成功'
    });

    } catch (error) {
      console.error('❌ [后端代理] 服务器错误:', error);
      
      let errorMessage = '服务器内部错误: ' + error.message;
      let suggestions = [];
      
      if (error.name === 'AbortError') {
        errorMessage = 'API调用超时，请稍后重试';
        suggestions = [
          '1. 网络连接可能较慢',
          '2. 尝试减少提示词长度',
          '3. 检查网络连接状态'
        ];
      }
      
      res.status(500).json({ 
        error: errorMessage,
        code: 'INTERNAL_SERVER_ERROR',
        suggestions: suggestions
      });
    }
});

// 构建提示词
function buildPrompt(userRequest) {
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

// 解析旅行计划
function parseTripPlan(text) {
  try {
    console.log('🔍 [后端代理] 开始解析旅行计划');
    console.log('📝 [后端代理] 原始响应文本:', text);
    
    // 尝试提取JSON部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('⚠️ [后端代理] 未找到JSON格式，尝试智能解析');
      return parseFromText(text);
    }

    const jsonStr = jsonMatch[0];
    console.log('📋 [后端代理] 提取的JSON:', jsonStr);
    
    const tripPlan = JSON.parse(jsonStr);

    // 验证必要字段
    if (!tripPlan.tripDetails || !tripPlan.itinerary || !tripPlan.costBreakdown) {
      console.log('⚠️ [后端代理] JSON格式不完整，尝试智能解析');
      return parseFromText(text);
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

    console.log('✅ [后端代理] 旅行计划解析成功');
    return tripPlan;

  } catch (error) {
    console.error('❌ [后端代理] 解析旅行计划失败:', error);
    console.log('🔄 [后端代理] 尝试智能解析');
    
    // 尝试智能解析
    try {
      return parseFromText(text);
    } catch (parseError) {
      console.error('❌ [后端代理] 智能解析也失败:', parseError);
      return getDefaultTripPlan();
    }
  }
}

// 智能解析函数
function parseFromText(text) {
  console.log('🧠 [后端代理] 开始智能解析旅行计划');
  
  // 提取目的地
  const destinationMatch = text.match(/(?:目的地|地点|去|到)[：:]?\s*([^，。\n]+)/);
  const destination = destinationMatch ? destinationMatch[1].trim() : '目的地待定';
  
  // 提取天数
  const durationMatch = text.match(/(\d+)[天日]/);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 3;
  
  // 提取预算
  const budgetMatch = text.match(/(\d+)[万千]?元/);
  let budget = 5000;
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]);
    budget = text.includes('万') ? amount * 10000 : amount;
  }
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7);
  
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
      activities: generateDayActivities(destination, i, duration)
    };
    
    tripPlan.itinerary.push(dayPlan);
  }
  
  console.log('✅ [后端代理] 智能解析完成');
  return tripPlan;
}

// 生成每日活动
function generateDayActivities(destination, dayIndex, totalDays) {
  const activities = [];
  
  if (dayIndex === 0) {
    activities.push(
      { time: '09:00', title: '抵达目的地', description: '开始您的旅程', duration: '2小时', cost: 0 },
      { time: '12:00', title: '酒店入住', description: '办理入住手续，休息调整', duration: '1小时', cost: 0 },
      { time: '14:00', title: '城市探索', description: '熟悉周边环境，了解当地文化', duration: '3小时', cost: 200 },
      { time: '18:00', title: '当地美食', description: '品尝特色美食，体验当地文化', duration: '2小时', cost: 300 }
    );
  } else if (dayIndex === totalDays - 1) {
    activities.push(
      { time: '09:00', title: '最后购物', description: '购买纪念品和特产', duration: '2小时', cost: 500 },
      { time: '12:00', title: '退房准备', description: '整理行李，准备离开', duration: '1小时', cost: 0 },
      { time: '15:00', title: '前往机场', description: '前往机场，准备返程', duration: '2小时', cost: 200 }
    );
  } else {
    activities.push(
      { time: '09:00', title: '著名景点游览', description: '参观当地著名景点', duration: '3小时', cost: 400 },
      { time: '13:00', title: '当地餐厅', description: '品尝地道美食', duration: '1小时', cost: 200 },
      { time: '15:00', title: '文化体验', description: '体验当地传统文化', duration: '2小时', cost: 300 },
      { time: '18:00', title: '自由活动', description: '自由安排，享受休闲时光', duration: '2小时', cost: 150 }
    );
  }
  
  return activities;
}

// 获取默认旅行计划（备用方案）
function getDefaultTripPlan() {
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

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 [后端代理] 服务器启动成功');
  console.log(`📍 [后端代理] 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 [后端代理] 健康检查: http://localhost:${PORT}/health`);
  console.log(`🎯 [后端代理] API端点: http://localhost:${PORT}/api/generate-trip-plan`);
  console.log('📋 [后端代理] 环境变量检查:');
  console.log(`   - BAILIAN_API_KEY: ${BAILIAN_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - API Key (前10位): ${BAILIAN_API_KEY ? BAILIAN_API_KEY.substring(0, 10) + '...' : '未设置'}`);
});
