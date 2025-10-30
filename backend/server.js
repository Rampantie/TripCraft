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
const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY;

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
    console.log('👤 [后端代理] 用户偏好:', req.body.userPreferences);

    const { userRequest, userPreferences } = req.body;
    
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

    // 构建个性化提示词
    const prompt = buildPersonalizedPrompt(userRequest, userPreferences);
    console.log('📋 [后端代理] 构建的个性化提示词长度:', prompt.length);

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

// 构建个性化提示词
function buildPersonalizedPrompt(userRequest, userPreferences) {
  // 获取当前日期
  const currentDate = new Date();
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const tomorrowDate = new Date(currentDate);
  tomorrowDate.setDate(currentDate.getDate() + 1);
  const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];
  
  // 解析用户偏好
  const preferences = userPreferences || {
    attractionType: 'mixed',
    travelPace: 'moderate',
    accommodation: 'comfortable',
    transportation: 'mixed'
  };

  // 偏好描述映射
  const preferenceDescriptions = {
    attractionType: {
      'cultural': '人文景点（博物馆、历史建筑、文化遗址、艺术展览等）',
      'natural': '自然景点（山川、湖泊、海滩、公园、自然保护区等）',
      'mixed': '混合类型（人文与自然景点相结合）'
    },
    travelPace: {
      'relaxed': '轻松休闲（每天安排较少活动，有充足休息时间）',
      'moderate': '适中节奏（每天安排适量活动，平衡游览与休息）',
      'intensive': '紧凑忙碌（每天安排较多活动，充分利用时间）'
    },
    accommodation: {
      'budget': '经济型住宿（青旅、经济酒店等，注重性价比）',
      'comfortable': '舒适型住宿（中档酒店、民宿等，注重舒适度）',
      'luxury': '豪华型住宿（五星级酒店、度假村等，注重品质体验）'
    },
    transportation: {
      'public': '公共交通（地铁、公交、火车等，经济环保）',
      'private': '私人交通（出租车、网约车、包车等，便捷舒适）',
      'mixed': '混合方式（根据情况选择最合适的交通方式）'
    }
  };

  // 构建个性化描述
  const personalizedDescription = `
用户旅行偏好设置：
- 景点类型偏好：${preferenceDescriptions.attractionType[preferences.attractionType]}
- 旅行节奏：${preferenceDescriptions.travelPace[preferences.travelPace]}
- 住宿偏好：${preferenceDescriptions.accommodation[preferences.accommodation]}
- 交通偏好：${preferenceDescriptions.transportation[preferences.transportation]}

请根据以上偏好设置，为用户生成个性化的旅行计划。`;

  return `请根据以下用户需求和偏好设置生成一份详细的个性化旅行计划：

${personalizedDescription}

重要提醒：当前日期是 ${currentDateStr}，请确保生成的出发日期是未来日期（建议从 ${tomorrowDateStr} 开始）。

1. 旅行计划格式为JSON格式，包含以下结构：
{
  "tripDetails": {
    "destination": "目的地",
    "startDate": "出发日期(YYYY-MM-DD格式，必须是未来日期)",
    "duration": 天数(数字),
    "budget": 预算(数字),
    "latitude": 目的地代表纬度(数字),
    "longitude": 目的地代表经度(数字)
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
          "category": "活动类别(transportation|accommodation|attraction|restaurant|other)",
          "place": "地点/名称",
          "address": "地址(可选)",
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

2. 个性化要求：
- 景点选择要符合用户的景点类型偏好
- 行程安排要符合用户的旅行节奏偏好
- 住宿推荐要符合用户的住宿偏好
- 交通方式要符合用户的交通偏好
- 每天安排3-6个活动（根据旅行节奏调整）
- 每个活动包含时间、地点、简短描述、花费、category分类
- 时间安排要合理，考虑交通时间
- 活动要符合目的地特色

2.1 每日必含信息（重要）：
- 每天的 activities 中必须至少包含以下类别各≥1条：
  * transportation（交通：到达/离开/市内移动等）
  * accommodation（住宿：入住/续住/退房等）
  * attraction（景点/活动/项目等）
  * restaurant（餐饮：早餐/午餐/晚餐/特色小吃等）

3. 费用计算要求（重要）：
- 每个活动的cost字段必须反映实际花费
- 住宿费用要根据住宿偏好和目的地实际情况计算：
  * 经济型：青旅床位50-150元/晚，经济酒店200-400元/晚
  * 舒适型：中档酒店400-800元/晚，精品民宿600-1200元/晚
  * 豪华型：五星级酒店800-2000元/晚，度假村1000-3000元/晚
- 交通费用要根据交通偏好计算：
  * 公共交通：地铁5-20元/次，公交2-10元/次，火车50-500元/次
  * 私人交通：出租车50-200元/次，网约车30-150元/次，包车300-800元/天
  * 混合方式：根据距离和便利性选择最合适的交通方式
- 餐饮费用要根据目的地消费水平：
  * 经济型：快餐30-60元/餐，小餐馆50-100元/餐
  * 舒适型：中档餐厅100-200元/餐，特色餐厅150-300元/餐
  * 豪华型：高档餐厅300-800元/餐，米其林餐厅500-1500元/餐
- 门票费用要根据景点类型：
  * 人文景点：博物馆20-100元，历史建筑30-150元，艺术展览50-200元
  * 自然景点：公园10-50元，自然保护区50-200元，主题公园200-500元
- 所有费用从 activities 的 cost 字段汇总得到，按 category 分类聚合：
  * accommodation = 所有 category=accommodation 的 cost 之和
  * transportation = 所有 category=transportation 的 cost 之和
  * food = 所有 category=restaurant 的 cost 之和
  * tickets = 所有 category=attraction 的 cost 之和（若含付费活动/门票）
  * others = 所有 category=other 的 cost 之和
- costBreakdown 中各项费用必须严格等于上述聚合结果，保持前后数据一致
- 总花费不能超过用户预算，但应该接近预算的80-95%

3.1 真实世界价格约束（极其重要）：
- activities 内每一项的 cost 必须尽量采用“现实世界真实价格”，而非随意估算。
- 对于景点（category=attraction），优先使用真实门票价（如“明孝陵”按旺/淡季官方价格给出，币种统一为人民币）。
- 对于餐饮（category=restaurant），按该城市当前常见消费水平选择具体餐厅与人均价格（给出合计价）。
- 对于交通（category=transportation），根据里程与交通方式估算接近真实的价格（地铁/公交按当地票价区间，打车按起步价+里程单价，火车/高铁按二等座常见票价区间）。
- 对于住宿（category=accommodation），选择与偏好匹配的真实/常见价位酒店或民宿，给出每晚含税总价。
- 若确实无法确定某项精确价格，请给出“本地常见价”并在活动的 description 中注明“价格为估算值，可能随季节/活动变动”。

4. 日期要求（重要）：
- 出发日期必须是未来日期，不能是今天或过去的日期
- 当前日期：${currentDateStr}
- 建议出发日期：${tomorrowDateStr} 或之后
- 行程中的每一天的日期都要基于出发日期正确计算

5. 地图定位要求（重要）：
- 仅输出一个代表本次旅行目的地的坐标（city-level），用于地图单点标记
- 该坐标应接近城市中心或主要景点聚集区
- 请将该坐标填写在 tripDetails.latitude 与 tripDetails.longitude 字段中

6. 返回要求：
- 返回纯JSON格式，不要包含其他文字
- 确保所有数字字段都是数字类型，不是字符串

用户需求：${userRequest}

请生成个性化旅行计划：`;
}


// 解析旅行计划
function parseTripPlan(text) {
  try {
    console.log('🔍 [后端代理] 开始解析旅行计划');
    console.log('📝 [后端代理] 原始响应文本:', text);
    
    // 尝试提取JSON部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('未找到JSON格式的旅行计划');
    }

    const jsonStr = jsonMatch[0];
    console.log('📋 [后端代理] 提取的JSON:', jsonStr);
    
    const tripPlan = JSON.parse(jsonStr);

    // 验证必要字段
    if (!tripPlan.tripDetails || !tripPlan.itinerary || !tripPlan.costBreakdown) {
      throw new Error('旅行计划JSON格式不完整');
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
    
    // 如果解析失败，抛出错误
    throw new Error('无法解析旅行计划: ' + error.message);
  }
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
