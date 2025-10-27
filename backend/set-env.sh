#!/bin/bash

echo "🔧 设置后端环境变量"
echo

echo "设置 BAILIAN_API_KEY..."
export BAILIAN_API_KEY=sk-4dd76a7ef7464c3c98f18339a7b31bf2

echo "设置 PORT..."
export PORT=3001

echo "设置 CORS_ORIGINS..."
export CORS_ORIGINS=http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080

echo
echo "✅ 环境变量设置完成！"
echo
echo "验证环境变量:"
echo "BAILIAN_API_KEY = $BAILIAN_API_KEY"
echo "PORT = $PORT"
echo "CORS_ORIGINS = $CORS_ORIGINS"
echo

echo "🚀 启动后端服务器..."
npm run dev
