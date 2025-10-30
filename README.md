# TripCraft

一个Web端的AI旅行规划师

✨ 由前端 Vue + 后端 Node 组成，集成阿里云百炼大模型与 Supabase，支持语音输入、行程生成、计划保存与统计可视化（ECharts）。支持 Docker 一键运行与 GitHub Actions 自动构建推送到阿里云容器镜像服务（ACR）。

## 项目要求

1、智能行程规划: 用户可以通过语音（或文字，语音功能一定要有）输入旅行目的地、日期、预算、同行人数、旅行偏好（例如：“我想去日本，5 天，预算 1 万元，喜欢美食和动漫，带孩子”），AI 会自动生成个性化的旅行路线，包括交通、住宿、景点、餐厅等详细信息。

2、费用预算与管理: 由 AI 进行预算分析，记录旅行开销（推荐可以使用语音）。

3、用户管理与数据存储:

注册登录系统: 用户可以保存和管理多份旅行计划。

云端行程同步: 旅行计划、偏好设置、费用记录等数据云端同步，方便多设备查看和修改。

## 项目核心功能

软件旨在简化旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

### 🔑 主要特性
- **语音输入**：集成科大讯飞语音识别API，识别准确
- **AI 生成行程**：阿里云百炼（Qwen 系列）快速生成，支持“快速模式”⏩
- **计划管理**：Supabase 存储，状态切换（规划中/已完成），实际花费记录
- **地图**：Leaflet 城市级定位展示
- **可视化**：ECharts 饼图/统计数据、用户总/均花费
- **UX**：自定义模态框、删除确认、查看只读、导出 TXT
- **Docker 支持**：前后端镜像，Secrets 构建期注入，免运行期手动配置

## 🧭 功能详解

### 🤖 智能行程规划
- **自然语言/语音输入**：用户可用文本或语音描述需求（目的地、天数、预算、偏好）。
- **AI 生成**：调用阿里云百炼（Qwen）生成结构化行程 JSON：
  - 目的地、未来出发日期、天数、预算、城市级经纬度
  - 按天拆分的活动列表（时间、标题、描述、地点、花费）
  - 住宿/交通/餐饮/门票/其他的总览估算
- **只读查看/导出**：已保存计划支持只读模式预览，并可一键导出为 TXT 文件。

### 💰 费用预算与管理
- **生成时预算约束**：总费用不超过用户预算，尽量接近预算 80%~95%。
- **实际花费记录**：在计划详情页完成行程时输入“实际总花费”，落库保存。
- **统计可视化**：
  - 用户主页展示总花费与均花费（均花费=总花费/完成计划数）
  - 使用 ECharts 饼图展示各次完成计划的实际花费占比，支持 tooltip 查看目的地与金额。
- **状态切换**：
  - 计划状态：用户完成该次旅行后，可以转换计划状态规划中 ▶ 已完成，并填入实际的日期和花费
  - 可在用户主页将计划从“已完成”恢复为“规划中”，实际花费清零

### 👤 用户管理与数据存储
- **认证与资料**：基于 Supabase 进行注册/登录（用户名可修改，带美观提示）。
- **计划存储**：旅行计划保存用户数据库中。
- **实时统计**：导航栏/个人主页展示用户的总计划数、已完成计划数、总花费（完成计划的实际花费之和）。
- **数据一致性**：完成计划时同步更新计划日期与花费和行程一致，确保前后端展示一致。

## 🧱 技术栈
- 前端：Vue 3、Vue Router、Pinia、ECharts、Leaflet
- 后端：Node.js + Express（AI 代理/提示词）、node-fetch
- 数据：Supabase（认证 + 数据库）
- AI：阿里云百炼 DashScope（Qwen）
- 部署：Docker、Nginx（前端）、GitHub Actions → ACR

## 📁 目录结构
```
TripCraft/
  public/
  src/
    components/
    utils/
    App.vue
    main.js
  backend/
    server.js
    package.json
  Dockerfile.frontend
  Dockerfile.backend
```

## 🚀 快速开始（Docker 方式）

项目已通过Github Actions自动在推送时构建Docker镜像并推送到阿里云ACR。你可以直接拉取已推送到阿里云 ACR 的镜像运行。

**注：请在本地的Docker上运行，云端服务器运行时可能因为带宽原因前端页面无法展示。**

### 1) 拉取并运行镜像 🐳
#### 后端（Node）🧠
```bash
docker run -d -p 3001:3001 --name tripcraft-backend crpi-38knp31niny4x869.cn-heyuan.personal.cr.aliyuncs.com/tripcraft/tripcraft-backend:latest
```
#### 前端（Nginx）🖥️
前端镜像在构建期注入了以下变量（无需运行期再配置）：
- `VUE_APP_XUNFEI_APP_ID`
- `VUE_APP_XUNFEI_API_SECRET`
- `VUE_APP_XUNFEI_API_KEY`
- `VUE_APP_SUPABASE_URL`
- `VUE_APP_SUPABASE_ANON_KEY`

运行：
```bash
docker run -d -p 8080:80 --name tripcraft-frontend crpi-38knp31niny4x869.cn-heyuan.personal.cr.aliyuncs.com/tripcraft/tripcraft-frontend:latest
```
打开浏览器访问：`http://localhost:8080` 🎉

> 提示：如果前端需要访问远端后端，请确保前端构建时的 API 代理地址正确，或通过 Nginx 配置反向代理。

## 🧪 后端 API
- 生成旅行计划：`POST /api/generate-trip-plan`
  - body: `{ userRequest: string, userPreferences?: object }`
  - 返回：`{ success: true, data: { tripDetails, itinerary, costBreakdown } }`
- 健康检查：`GET /health`

## 🔐 安全与密钥
- 所有密钥通过 GitHub Actions Secrets 在构建期以 `--build-arg` 注入镜像，避免明文写入代码库。
- 前端：通过 `.env.local`（CI 生成）→ 构建注入到打包产物。
- 后端：`BAILIAN_API_KEY` 以构建参数写入镜像环境变量。

## ⚙️ 本地开发（可选）
```bash
# 前端开发
npm install
npm run serve

# 后端开发
cd backend
npm install
npm run start
```

## 🧰 故障排查
- 语音识别失败：检查 Xunfei 密钥是否在构建期正确注入；浏览器需 HTTPS/本地环境。
- 地图不显示：网络问题或瓦片加载失败，检查控制台与网络策略。
- Docker 拉取慢：在 Docker Desktop 配置国内镜像加速源后重试。
- ACR 推送失败：检查 GitHub Actions 中 Secrets 与 `docker-build.yml` 是否匹配。

## 📜 许可证
本项目仅用于学习与研究目的。请遵守第三方 API/服务的许可协议与使用条款。

---
如果本文档对你有帮助，欢迎点亮一颗 ⭐️！遇到问题可以提交 Issue，我们会尽快回复。🙌