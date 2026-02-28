# Code Review - OpenClaw Dashboard

## 1. Backend

### 1.1 `openclaw-client.ts`

| 问题 | 位置 | 描述 | 建议 |
|------|------|------|------|
| ✅ 已修复 | Line 10 | `OPENCLAW_BIN` 现在使用 `'openclaw'` 而非硬编码路径 | 使用 PATH 中的命令 |
| 进程检测不健壮 | `getSystemStatus` | 使用 `ps aux | grep` 可能匹配错误进程 | 使用 `openclaw gateway status --json` |
| 无超时处理 | 所有 API 调用 | `execAsync` 可能永久挂起 | 添加 timeout 选项 |
| JSON 解析 | `extractJSON` | 简单的字符串查找可能失败 | 使用更健壮的解析 |

### 1.2 路由文件

| 文件 | 问题 | 建议 |
|------|------|------|
| `routes/cron.ts` | 无输入验证 | 添加 request body 验证 |
| `routes/sessions.ts` | 无分页支持 | 添加 limit/offset 参数 |

## 2. Frontend

### 2.1 组件

| 组件 | 问题 | 建议 |
|------|------|------|
| `SystemStatus.tsx` | 资源数据是硬编码的 | 从 API 获取真实数据 |
| `useClawdbotAPI.ts` | 无错误重试逻辑 | 添加 retry with backoff |

### 2.2 性能

- 考虑使用 React Query 或 SWR 替代手动 fetch
- 添加 loading skeleton 组件

## 3. 安全

| 问题 | 严重程度 | 建议 |
|------|----------|------|
| 无认证 | 高 | 添加 API token 验证 |
| CORS 配置 | 中 | 限制允许的源 |
| 命令注入风险 | 高 | 验证和转义所有用户输入 |

## 4. 改进建议

1. **添加 API 认证**：使用 OpenClaw gateway token 进行验证
2. **WebSocket 支持**：实时推送状态更新
3. **日志系统**：添加结构化日志
4. **测试覆盖**：添加单元测试和集成测试
5. **Docker 支持**：添加 Dockerfile 便于部署

## 5. 环境变量

后端现在支持以下环境变量：

- `OPENCLAW_BIN`: OpenClaw CLI 可执行文件路径（默认使用 PATH 中的 `openclaw`）
- `OPENCLAW_CONFIG_DIR`: 配置目录路径（默认 `~/.openclaw`）
