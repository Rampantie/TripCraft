@echo off
echo 🧪 测试个性化旅行计划生成功能
echo.

echo 📋 测试1: 人文景点偏好 + 轻松节奏
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行7天，预算1万元\", \"userPreferences\": {\"attractionType\": \"cultural\", \"travelPace\": \"relaxed\", \"accommodation\": \"comfortable\", \"transportation\": \"public\"}}"

echo.
echo.
echo 📋 测试2: 自然景点偏好 + 紧凑节奏
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行7天，预算1万元\", \"userPreferences\": {\"attractionType\": \"natural\", \"travelPace\": \"intensive\", \"accommodation\": \"luxury\", \"transportation\": \"private\"}}"

echo.
echo.
echo 📋 测试3: 混合偏好 + 适中节奏
echo 发送请求到后端API...
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行7天，预算1万元\", \"userPreferences\": {\"attractionType\": \"mixed\", \"travelPace\": \"moderate\", \"accommodation\": \"budget\", \"transportation\": \"mixed\"}}"

echo.
echo.
echo ✅ 测试完成！请检查后端控制台输出，查看个性化提示词是否正确生成。
pause
