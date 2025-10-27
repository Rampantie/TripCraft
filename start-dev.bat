@echo off
echo 🚀 启动 TripCraft 开发环境
echo.

echo 📦 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 启动后端服务器...
start "TripCraft Backend" cmd /k "cd backend && start.bat"

echo.
echo ⏳ 等待后端服务器启动...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 启动前端服务器...
cd ..
start "TripCraft Frontend" cmd /k "npm run serve"

echo.
echo ✅ 开发环境启动完成！
echo 📍 前端地址: http://localhost:8080
echo 📍 后端地址: http://localhost:3001
echo.
echo 按任意键关闭此窗口...
pause > nul
