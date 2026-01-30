# Clawdbot Dashboard

> 可视化管理面板 for Clawdbot - 监控任务、Cron Jobs 和 Sub-Agents

## 功能特性

- 📊 **Dashboard**: 实时查看所有活跃 sessions 和 sub-agents
- ⏰ **Cron Jobs**: 管理定时任务（启用/禁用、手动触发）
- 🔧 **System Status**: 监控 Gateway 运行状态

## 技术栈

**前端**:
- React 18 + TypeScript
- Vite
- Tailwind CSS

**后端**:
- Node.js + Express
- TypeScript
- 直接调用 Clawdbot CLI

## 快速开始

### 1. 安装依赖

```bash
npm run install-all
```

### 2. 启动开发服务器

```bash
npm run dev
```

这会同时启动：
- 后端 API: http://localhost:3001
- 前端界面: http://localhost:3000

### 3. 访问面板

打开浏览器访问 http://localhost:3000

## 项目结构

```
clawdbot-dashboard/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   └── App.tsx
│   └── package.json
├── backend/           # Express 后端
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── server.ts
│   │   └── clawdbot-client.ts
│   └── package.json
└── package.json       # Root
```

## API 端点

### Sessions

- `GET /api/sessions/list` - 列出所有 sessions

### Cron Jobs

- `GET /api/cron/list` - 列出所有 cron jobs
- `POST /api/cron/update/:jobId` - 更新 cron job
- `POST /api/cron/run/:jobId` - 手动触发 cron job

### System

- `GET /api/system/status` - 获取系统状态

## 开发

### 仅启动后端

```bash
cd backend && npm run dev
```

### 仅启动前端

```bash
cd frontend && npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署

生产环境启动：

```bash
npm start
```

## 截图

*(待添加)*

## License

MIT © Tony Ye
