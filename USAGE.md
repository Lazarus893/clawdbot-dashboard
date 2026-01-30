# Clawdbot Dashboard 使用说明

## 🚀 快速开始

### 1. 访问面板

**前端界面**: http://localhost:5173
**后端 API**: http://localhost:3001

### 2. 功能说明

#### Dashboard 页面
- 实时显示所有活跃的 Sessions
- 分为两类：
  - **Main Sessions**: 主要对话 sessions
  - **Cron Sessions**: 定时任务相关 sessions
- 显示信息：
  - Session Key（会话标识）
  - 模型信息
  - Token 使用情况（输入/输出/总计）
  - 最后活跃时间

#### Cron Jobs 页面
- 查看所有定时任务
- 显示信息：
  - 任务名称
  - 执行计划（Cron 表达式）
  - 下次执行时间
  - 上次执行状态
- 操作：
  - 启用/禁用任务
  - 手动触发执行

#### System Status 页面
- Gateway 运行状态
- 进程 PID
- 运行时长

### 3. 数据更新频率

- Dashboard: 每 5 秒自动刷新
- Cron Jobs: 每 10 秒自动刷新
- System Status: 每 5 秒自动刷新

## 🔧 开发

### 启动开发服务器

```bash
cd ~/Projects/clawdbot-dashboard
npm run dev
```

### 仅启动后端

```bash
cd backend
npm run dev
```

### 仅启动前端

```bash
cd frontend
npm run dev
```

### 查看日志

```bash
tail -f /tmp/dashboard.log
```

## 📡 API 端点

### Sessions

**GET /api/sessions/list**

返回所有活跃的 sessions。

响应示例：
```json
{
  "sessions": [
    {
      "key": "agent:main:main",
      "kind": "direct",
      "updatedAt": 1769750400000,
      "ageMs": 12345678,
      "sessionId": "xxx",
      "model": "claude-opus-4-5",
      "inputTokens": 1000,
      "outputTokens": 2000,
      "totalTokens": 3000
    }
  ]
}
```

### Cron Jobs

**GET /api/cron/list**

返回所有 cron jobs。

**POST /api/cron/update/:jobId**

更新 cron job（启用/禁用）。

请求体：
```json
{
  "enabled": true
}
```

**POST /api/cron/run/:jobId**

手动触发 cron job 执行。

### System

**GET /api/system/status**

返回系统状态。

响应示例：
```json
{
  "gateway": {
    "running": true,
    "pid": 12345,
    "uptime": "2:34:56"
  }
}
```

## 🐛 故障排除

### 前端无法连接后端

检查后端是否运行：
```bash
curl http://localhost:3001/health
```

### API 返回空数据

检查 Clawdbot Gateway 是否运行：
```bash
clawdbot status
```

### Sessions 数据格式错误

确保使用最新版本的 Clawdbot CLI：
```bash
clawdbot --version
```

## 📦 部署

### 生产构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 🔗 链接

- **GitHub**: https://github.com/Lazarus893/clawdbot-dashboard
- **Clawdbot 文档**: https://docs.clawd.bot

## 📝 更新日志

### v1.0.0 (2026-01-30)
- ✨ 初始版本发布
- 📊 Sessions 监控
- ⏰ Cron Jobs 管理
- 🔧 System Status 监控
- 🎨 响应式 UI（Tailwind CSS）
- 🔄 自动刷新数据
