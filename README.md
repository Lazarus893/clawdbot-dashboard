# OpenClaw Dashboard

> 可视化管理面板 for OpenClaw - 监控 Sessions、Cron Jobs、Agents 和系统状态

## 功能特性

- **Dashboard** — 实时查看所有活跃 Sessions，Token 统计，模型切换
- **Cron Jobs** — 管理定时任务（启用/禁用、手动触发、倒计时）
- **System Status** — 监控 Gateway 运行状态、CPU / 内存 / 负载实时指标
- **Agent Bindings** — 查看 Agent 配置、Channel 绑定、Subagent 关系
- **Model Switcher** — 一键切换 OpenClaw 默认模型并重启 Gateway
- **Claude Code Provider** — 一键切换 Claude Code 后端 Provider（官方 / GLM 等）
- **WebSocket Logs** — 实时日志流，按级别过滤
- **Command Palette** — `⌘K` 全局快捷操作

## 设计系统

V2 采用 Zinc + Electric Orange (`#FF4D00`) 配色，遵循 Linear/Vercel 克制设计哲学：

- **Liquid Glass** 卡片系统，内发光边框
- **Tactile Feedback** 按钮（按下微缩 + 位移）
- **Spring-based** 动画（framer-motion，零装饰动画）
- **骨架屏** 加载态，模拟真实布局结构
- **prefers-reduced-motion** 无障碍支持

## 技术栈

**前端**:
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4（`@theme` 自定义 token）
- framer-motion（Spring 动画）
- Phosphor Icons（统一图标库）
- cmdk（Command Palette）

**后端**:
- Node.js + Express + TypeScript
- WebSocket（实时日志）
- 调用 OpenClaw CLI + ccps CLI

## 快速开始

### 1. 安装依赖

```bash
npm run install-all
```

### 2. 启动开发服务器

```bash
npm run dev
```

同时启动：
- 后端 API: http://localhost:3001
- 前端界面: http://localhost:5173

### 3. 访问面板

打开浏览器访问 http://localhost:5173

## 项目结构

```
clawdbot-dashboard/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx          # Sessions 概览 + 统计
│       │   ├── SystemStatus.tsx       # 系统状态 + 资源监控
│       │   ├── CronJobs.tsx           # Cron 任务管理
│       │   ├── AgentBindings.tsx      # Agent 配置与绑定
│       │   ├── ModelSwitcher.tsx       # OpenClaw 模型切换
│       │   ├── ClaudeCodeSwitcher.tsx  # Claude Code Provider 切换
│       │   ├── LogsPanel.tsx          # WebSocket 实时日志
│       │   ├── SessionDrawer.tsx      # Session 详情抽屉
│       │   ├── CommandPalette.tsx     # ⌘K 命令面板
│       │   └── ...
│       ├── hooks/
│       │   └── useOpenClawAPI.ts      # API hooks
│       ├── App.tsx
│       └── index.css                  # 设计系统
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── sessions.ts
│       │   ├── cron.ts
│       │   ├── system.ts
│       │   ├── agents.ts              # 含 ccps Provider API
│       │   └── models.ts
│       ├── server.ts                  # Express + WebSocket
│       └── openclaw-client.ts         # CLI 交互层
└── package.json
```

## API 端点

### Sessions
- `GET /api/sessions/list` — 列出所有 sessions
- `GET /api/sessions/messages/:sessionKey` — 获取 session 消息

### Cron Jobs
- `GET /api/cron/list` — 列出所有 cron jobs
- `POST /api/cron/update/:jobId` — 启用/禁用 cron job
- `POST /api/cron/run/:jobId` — 手动触发 cron job

### System
- `GET /api/system/status` — 获取系统状态（Gateway + 资源指标）

### Models
- `GET /api/models/list` — 列出可用模型
- `GET /api/models/status` — 当前模型状态
- `POST /api/models/set` — 切换模型并重启 Gateway

### Agents
- `GET /api/agents/overview` — Agent 配置与绑定概览
- `GET /api/agents/ccps/list` — 列出 Claude Code Providers
- `POST /api/agents/ccps/use` — 切换 Claude Code Provider

### Logs
- `GET /api/logs/recent` — 最近日志
- `WebSocket /ws/logs` — 实时日志流

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OPENCLAW_BIN` | `openclaw` | OpenClaw CLI 路径 |
| `OPENCLAW_CONFIG_DIR` | `~/.openclaw` | 配置目录 |
| `CCPS_BIN` | `~/.local/bin/ccps` | ccps CLI 路径 |
| `CC_SWITCH_DB` | `~/.cc-switch/cc-switch.db` | ccps 数据库路径 |
| `PORT` | `3001` | 后端端口 |
| `CORS_ORIGIN` | `localhost:5173,5174,3000` | CORS 白名单 |

## 开发

```bash
cd backend && npm run dev    # 仅后端
cd frontend && npm run dev   # 仅前端
npm run build                # 构建生产版本
npm start                    # 生产环境启动
```

## License

MIT © Tony Ye
