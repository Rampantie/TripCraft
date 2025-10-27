@echo off
echo 🚀 启动 TripCraft 后端服务器
echo.

echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 设置环境变量...
set BAILIAN_API_KEY=%BAILIAN_API_KEY%
set PORT=3001

echo.
echo ✅ 环境变量设置完成:
echo    BAILIAN_API_KEY = %BAILIAN_API_KEY%
echo    PORT = %PORT%
echo.

echo 🚀 启动服务器...
npm run dev
