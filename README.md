# OpenClaw Dashboard

> 可视化管理面板 for OpenClaw - 监控任务、Cron Jobs 和 Sub-Agents

## 功能特性

- 📊 **Dashboard**: 实时查看所有活跃 sessions 和 sub-agents
- ⏰ **Cron Jobs**: 管理定时任务（启用/禁用、手动触发）
- 🔧 **System Status**: 监控 Gateway 运行状态

## 技术栈

**前端**:
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4

**后端**:
- Node.js + Express
- TypeScript
- 直接调用 OpenClaw CLI

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
- 前端界面: http://localhost:5173

### 3. 访问面板

打开浏览器访问 http://localhost:5173

## 项目结构

```
openclaw-dashboard/
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
│   │   └── openclaw-client.ts
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

## 环境变量

后端支持以下环境变量：

- `OPENCLAW_BIN`: OpenClaw CLI 路径（默认: `openclaw`）
- `OPENCLAW_CONFIG_DIR`: 配置目录（默认: `~/.openclaw`）

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
