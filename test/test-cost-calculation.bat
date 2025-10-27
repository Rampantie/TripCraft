@echo off
echo 💰 测试费用计算准确性
echo.

echo 📋 测试1: 经济型偏好 - 应该产生较低费用
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行5天，预算5000元\", \"userPreferences\": {\"attractionType\": \"cultural\", \"travelPace\": \"moderate\", \"accommodation\": \"budget\", \"transportation\": \"public\"}}"

echo.
echo.
echo 📋 测试2: 豪华型偏好 - 应该产生较高费用
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行5天，预算20000元\", \"userPreferences\": {\"attractionType\": \"natural\", \"travelPace\": \"relaxed\", \"accommodation\": \"luxury\", \"transportation\": \"private\"}}"

echo.
echo.
echo 📋 测试3: 混合偏好 - 应该产生中等费用
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行5天，预算10000元\", \"userPreferences\": {\"attractionType\": \"mixed\", \"travelPace\": \"moderate\", \"accommodation\": \"comfortable\", \"transportation\": \"mixed\"}}"

echo.
echo.
echo ✅ 测试完成！请检查：
echo 1. 每个活动的cost是否合理
echo 2. costBreakdown是否与活动费用匹配
echo 3. 总费用是否接近预算的80-95%%
echo 4. 费用是否符合偏好设置（经济型 vs 豪华型）
pause
