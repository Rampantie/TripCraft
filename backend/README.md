# TripCraft 后端代理服务器

## 🚀 快速开始

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```bash
# 后端服务器配置
PORT=3001

# 阿里云百炼API配置
BAILIAN_API_KEY=sk-4dd76a7ef7464c3c98f18339a7b31bf2

# 允许的跨域来源
CORS_ORIGINS=http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080
```

### 3. 启动服务器
```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

## 📡 API端点

### 健康检查
```
GET /health
```

### 生成旅行计划
```
POST /api/generate-trip-plan
Content-Type: application/json

{
  "userRequest": "我想去日本旅行7天，预算1万元"
}
```

## 🔧 配置说明

- **PORT**: 服务器端口（默认3001）
- **BAILIAN_API_KEY**: 阿里云百炼API密钥
- **CORS_ORIGINS**: 允许跨域的来源列表

## 🐛 故障排除

### 1. 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :3001

# 杀死进程
taskkill /PID <进程ID> /F
```

### 2. API密钥错误
检查 `.env` 文件中的 `BAILIAN_API_KEY` 是否正确

### 3. 跨域问题
确保前端地址在 `CORS_ORIGINS` 中

## 📝 日志说明

- `🚀 [后端代理]` - 服务器启动信息
- `📝 [后端代理]` - 请求信息
- `📡 [后端代理]` - API调用信息
- `✅ [后端代理]` - 成功信息
- `❌ [后端代理]` - 错误信息
