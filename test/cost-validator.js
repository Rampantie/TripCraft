/**
 * 费用验证工具
 * 用于验证生成的旅行计划中费用是否合理和一致
 */

function validateTripPlanCosts(tripPlan) {
  const issues = [];
  const warnings = [];
  
  // 提取基本信息
  const budget = tripPlan.tripDetails?.budget || 0;
  const duration = tripPlan.tripDetails?.duration || 0;
  const costBreakdown = tripPlan.costBreakdown || {};
  const itinerary = tripPlan.itinerary || [];
  
  console.log(`🔍 验证旅行计划费用...`);
  console.log(`📊 预算: ¥${budget}, 天数: ${duration}天`);
  
  // 1. 计算实际活动费用总和
  let totalActivityCost = 0;
  let activityCount = 0;
  
  itinerary.forEach((day, dayIndex) => {
    if (day.activities) {
      day.activities.forEach((activity, activityIndex) => {
        const cost = typeof activity.cost === 'number' ? activity.cost : 0;
        totalActivityCost += cost;
        activityCount++;
        
        // 检查单个活动费用是否合理
        if (cost < 0) {
          issues.push(`第${dayIndex + 1}天活动${activityIndex + 1}费用为负数: ¥${cost}`);
        } else if (cost > 1000) {
          warnings.push(`第${dayIndex + 1}天活动${activityIndex + 1}费用较高: ¥${cost} - ${activity.title}`);
        }
      });
    }
  });
  
  // 2. 计算costBreakdown总和
  const breakdownTotal = Object.values(costBreakdown).reduce((sum, cost) => {
    return sum + (typeof cost === 'number' ? cost : 0);
  }, 0);
  
  // 3. 验证费用一致性
  const costDifference = Math.abs(totalActivityCost - breakdownTotal);
  const costDifferencePercent = breakdownTotal > 0 ? (costDifference / breakdownTotal) * 100 : 0;
  
  if (costDifference > 100) {
    issues.push(`活动费用总和(¥${totalActivityCost})与费用明细总和(¥${breakdownTotal})差异过大: ¥${costDifference}`);
  } else if (costDifferencePercent > 10) {
    warnings.push(`活动费用与费用明细存在${costDifferencePercent.toFixed(1)}%的差异`);
  }
  
  // 4. 验证预算使用率
  const budgetUsagePercent = breakdownTotal > 0 ? (breakdownTotal / budget) * 100 : 0;
  
  if (budgetUsagePercent > 100) {
    issues.push(`总费用(¥${breakdownTotal})超过预算(¥${budget})，超出${((budgetUsagePercent - 100)).toFixed(1)}%`);
  } else if (budgetUsagePercent < 50) {
    warnings.push(`预算使用率较低: ${budgetUsagePercent.toFixed(1)}%，可能费用计算过于保守`);
  } else if (budgetUsagePercent > 95) {
    warnings.push(`预算使用率很高: ${budgetUsagePercent.toFixed(1)}%，接近预算上限`);
  }
  
  // 5. 验证各项费用比例
  const accommodation = costBreakdown.accommodation || 0;
  const transportation = costBreakdown.transportation || 0;
  const food = costBreakdown.food || 0;
  const tickets = costBreakdown.tickets || 0;
  const others = costBreakdown.others || 0;
  
  if (breakdownTotal > 0) {
    const accommodationPercent = (accommodation / breakdownTotal) * 100;
    const transportationPercent = (transportation / breakdownTotal) * 100;
    const foodPercent = (food / breakdownTotal) * 100;
    
    if (accommodationPercent < 20 || accommodationPercent > 60) {
      warnings.push(`住宿费用比例异常: ${accommodationPercent.toFixed(1)}% (正常范围: 20-60%)`);
    }
    
    if (transportationPercent < 10 || transportationPercent > 40) {
      warnings.push(`交通费用比例异常: ${transportationPercent.toFixed(1)}% (正常范围: 10-40%)`);
    }
    
    if (foodPercent < 15 || foodPercent > 35) {
      warnings.push(`餐饮费用比例异常: ${foodPercent.toFixed(1)}% (正常范围: 15-35%)`);
    }
  }
  
  // 6. 验证每日平均费用
  if (duration > 0) {
    const dailyAverage = breakdownTotal / duration;
    const budgetDailyAverage = budget / duration;
    
    if (dailyAverage > budgetDailyAverage * 1.2) {
      warnings.push(`每日平均费用(¥${dailyAverage.toFixed(0)})超过预算每日平均(¥${budgetDailyAverage.toFixed(0)})的120%`);
    }
  }
  
  // 输出验证结果
  console.log(`\n📈 费用统计:`);
  console.log(`   活动费用总和: ¥${totalActivityCost}`);
  console.log(`   费用明细总和: ¥${breakdownTotal}`);
  console.log(`   预算使用率: ${budgetUsagePercent.toFixed(1)}%`);
  console.log(`   活动数量: ${activityCount}个`);
  
  if (breakdownTotal > 0) {
    console.log(`\n💰 费用明细:`);
    console.log(`   住宿: ¥${accommodation} (${((accommodation/breakdownTotal)*100).toFixed(1)}%)`);
    console.log(`   交通: ¥${transportation} (${((transportation/breakdownTotal)*100).toFixed(1)}%)`);
    console.log(`   餐饮: ¥${food} (${((food/breakdownTotal)*100).toFixed(1)}%)`);
    console.log(`   门票: ¥${tickets} (${((tickets/breakdownTotal)*100).toFixed(1)}%)`);
    console.log(`   其他: ¥${others} (${((others/breakdownTotal)*100).toFixed(1)}%)`);
  }
  
  // 输出问题和警告
  if (issues.length > 0) {
    console.log(`\n❌ 发现 ${issues.length} 个问题:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️ 发现 ${warnings.length} 个警告:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log(`\n✅ 费用验证通过！所有费用都符合预期。`);
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    warnings: warnings,
    stats: {
      totalActivityCost,
      breakdownTotal,
      budgetUsagePercent,
      activityCount,
      dailyAverage: duration > 0 ? breakdownTotal / duration : 0
    }
  };
}

// 如果直接运行此文件，则测试验证功能
if (require.main === module) {
  // 示例旅行计划
  const sampleTripPlan = {
    tripDetails: {
      destination: "日本东京",
      startDate: "2024-01-01",
      duration: 5,
      budget: 10000
    },
    itinerary: [
      {
        date: "2024-01-01",
        activities: [
          { time: "09:00", title: "抵达东京", description: "机场到酒店", duration: "2小时", cost: 200 },
          { time: "12:00", title: "酒店入住", description: "办理入住手续", duration: "1小时", cost: 0 },
          { time: "14:00", title: "浅草寺游览", description: "参观历史寺庙", duration: "2小时", cost: 50 },
          { time: "18:00", title: "当地美食", description: "品尝日式料理", duration: "2小时", cost: 300 }
        ]
      }
    ],
    costBreakdown: {
      accommodation: 4000,
      transportation: 2000,
      food: 1500,
      tickets: 500,
      others: 2000
    }
  };
  
  console.log("🧪 测试费用验证工具...\n");
  validateTripPlanCosts(sampleTripPlan);
}

module.exports = { validateTripPlanCosts };
