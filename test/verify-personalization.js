/**
 * 个性化功能验证脚本
 * 用于测试个性化旅行计划生成功能是否正常工作
 */

const fetch = require('node-fetch');
const { validateTripPlanCosts } = require('./cost-validator.js');

// 测试用例
const testCases = [
  {
    name: '人文景点 + 轻松节奏',
    userRequest: '我想去日本旅行7天，预算1万元',
    userPreferences: {
      attractionType: 'cultural',
      travelPace: 'relaxed',
      accommodation: 'comfortable',
      transportation: 'public'
    }
  },
  {
    name: '自然景点 + 紧凑节奏',
    userRequest: '我想去日本旅行7天，预算1万元',
    userPreferences: {
      attractionType: 'natural',
      travelPace: 'intensive',
      accommodation: 'luxury',
      transportation: 'private'
    }
  },
  {
    name: '混合类型 + 适中节奏',
    userRequest: '我想去日本旅行7天，预算1万元',
    userPreferences: {
      attractionType: 'mixed',
      travelPace: 'moderate',
      accommodation: 'budget',
      transportation: 'mixed'
    }
  }
];

async function testPersonalization() {
  console.log('🧪 开始测试个性化旅行计划生成功能...\n');
  
  for (const testCase of testCases) {
    console.log(`📋 测试用例: ${testCase.name}`);
    console.log(`   用户需求: ${testCase.userRequest}`);
    console.log(`   偏好设置:`, testCase.userPreferences);
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-trip-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRequest: testCase.userRequest,
          userPreferences: testCase.userPreferences
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log(`   ❌ 请求失败: ${response.status} - ${errorData.error || response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ 生成成功!`);
        console.log(`   📍 目的地: ${data.data.tripDetails?.destination || 'N/A'}`);
        console.log(`   📅 天数: ${data.data.tripDetails?.duration || 'N/A'}天`);
        console.log(`   💰 预算: ¥${data.data.tripDetails?.budget || 'N/A'}`);
        console.log(`   📝 行程天数: ${data.data.itinerary?.length || 0}天`);
        
        // 检查个性化效果
        if (data.data.itinerary && data.data.itinerary.length > 0) {
          const firstDay = data.data.itinerary[0];
          const activities = firstDay.activities || [];
          console.log(`   🎯 第一天活动数量: ${activities.length}个`);
          
          if (activities.length > 0) {
            console.log(`   📋 第一天活动示例:`);
            activities.slice(0, 2).forEach((activity, index) => {
              console.log(`      ${index + 1}. ${activity.time} - ${activity.title} (¥${activity.cost || 0})`);
            });
          }
        }
        
        // 验证费用计算
        console.log(`   💰 费用验证:`);
        const costValidation = validateTripPlanCosts(data.data);
        if (costValidation.isValid) {
          console.log(`   ✅ 费用验证通过`);
        } else {
          console.log(`   ❌ 费用验证失败: ${costValidation.issues.length}个问题`);
          costValidation.issues.slice(0, 2).forEach((issue, index) => {
            console.log(`      ${index + 1}. ${issue}`);
          });
        }
      } else {
        console.log(`   ❌ 生成失败: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ 网络错误: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🏁 测试完成!');
  console.log('\n💡 提示:');
  console.log('   - 如果看到网络错误，请确保后端服务器正在运行');
  console.log('   - 运行命令: cd backend && npm run dev');
  console.log('   - 或者运行: .\\backend\\start.bat');
}

// 运行测试
testPersonalization().catch(console.error);
