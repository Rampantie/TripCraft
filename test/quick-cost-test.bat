@echo off
echo 💰 快速费用计算测试
echo.

echo 📋 测试经济型偏好 (预算5000元)
echo 预期: 住宿200-400元/晚, 交通5-20元/次, 餐饮30-100元/餐
echo.
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行3天，预算5000元\", \"userPreferences\": {\"attractionType\": \"cultural\", \"travelPace\": \"moderate\", \"accommodation\": \"budget\", \"transportation\": \"public\"}}" ^
  | jq -r '.data | "总费用: ¥" + (.costBreakdown | to_entries | map(.value) | add | tostring) + " (预算使用率: " + (((.costBreakdown | to_entries | map(.value) | add) / .tripDetails.budget * 100) | tostring) + "%)"'

echo.
echo.
echo 📋 测试豪华型偏好 (预算20000元)
echo 预期: 住宿800-2000元/晚, 交通50-200元/次, 餐饮300-800元/餐
echo.
curl -X POST http://localhost:3001/api/generate-trip-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"userRequest\": \"我想去日本旅行3天，预算20000元\", \"userPreferences\": {\"attractionType\": \"natural\", \"travelPace\": \"relaxed\", \"accommodation\": \"luxury\", \"transportation\": \"private\"}}" ^
  | jq -r '.data | "总费用: ¥" + (.costBreakdown | to_entries | map(.value) | add | tostring) + " (预算使用率: " + (((.costBreakdown | to_entries | map(.value) | add) / .tripDetails.budget * 100) | tostring) + "%)"'

echo.
echo.
echo ✅ 测试完成！请检查费用是否符合预期。
echo 💡 提示: 如果看到jq错误，请安装jq工具或直接查看原始JSON输出
pause
