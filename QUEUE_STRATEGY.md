# OpenClaw 线性消息排队策略

## 问题分析

并发报错的常见原因：
1. **API 限流** - 同一时刻多个请求触发 rate limit
2. **Session 状态竞争** - 多个消息同时修改同一 session 状态
3. **响应乱序** - 后发的消息先返回，导致上下文错乱
4. **资源耗尽** - 子 agent 或工具调用堆积

---

## 核心策略：Session 级串行队列

```typescript
// 按 session 隔离的线性队列
interface SessionMessageQueue {
  // 每个 session 独立队列，不同 session 可并行
  queues: Map<sessionKey, LinearQueue>
  
  // 全局并发控制（防止系统过载）
  globalConcurrency: Semaphore
  
  // 处理中消息跟踪
  inFlight: Map<messageId, InFlightMessage>
}

// 队列中的消息
interface QueuedMessage {
  id: string
  sessionKey: string
  content: string
  timestamp: number
  priority: 'normal' | 'high' | 'urgent'
  retryCount: number
  resolve: (value: any) => void
  reject: (error: any) => void
}
```

---

## 关键机制

### 1. 严格 FIFO + 等待前一个完成

```typescript
class LinearQueue {
  private queue: QueuedMessage[] = []
  private isProcessing = false
  private currentMessage: QueuedMessage | null = null
  
  async enqueue(message: QueuedMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      message.resolve = resolve
      message.reject = reject
      
      // 插队逻辑：urgent 消息放队首，但不超过正在处理的消息
      if (message.priority === 'urgent' && this.currentMessage) {
        this.queue.unshift(message)
      } else {
        this.queue.push(message)
      }
      
      this.processNext()
    })
  }
  
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return
    
    this.isProcessing = true
    this.currentMessage = this.queue.shift()!
    
    try {
      // 获取全局许可（防止系统过载）
      await globalSemaphore.acquire()
      
      const result = await this.processMessage(this.currentMessage)
      this.currentMessage.resolve(result)
      
    } catch (error) {
      // 可重试错误处理
      if (this.shouldRetry(error, this.currentMessage)) {
        this.currentMessage.retryCount++
        // 延迟重试，指数退避
        await delay(Math.pow(2, this.currentMessage.retryCount) * 1000)
        this.queue.unshift(this.currentMessage)
      } else {
        this.currentMessage.reject(error)
      }
      
    } finally {
      globalSemaphore.release()
      this.currentMessage = null
      this.isProcessing = false
      
      // 继续处理下一个
      this.processNext()
    }
  }
  
  private shouldRetry(error: any, message: QueuedMessage): boolean {
    // Rate limit 错误重试
    if (error.code === 'RATE_LIMIT' && message.retryCount < 3) return true
    // 临时错误重试
    if (error.code === 'ETIMEDOUT' && message.retryCount < 2) return true
    return false
  }
}
```

### 2. 全局并发控制（背压）

```typescript
class Semaphore {
  private permits: number
  private waiters: Array<() => void> = []
  
  constructor(initial: number) {
    this.permits = initial
  }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }
    // 队列满了，等待
    return new Promise(resolve => this.waiters.push(resolve))
  }
  
  release(): void {
    if (this.waiters.length > 0) {
      const next = this.waiters.shift()!
      next()
    } else {
      this.permits++
    }
  }
}

// 全局配置：最大并发消息数
const globalSemaphore = new Semaphore(3) // 同时处理最多 3 条消息（不同 session）
```

### 3. 消息去重（防止重复提交）

```typescript
class Deduplicator {
  private recentMessages: Map<string, number> = new Map()
  private readonly WINDOW_MS = 5000 // 5秒窗口
  
  isDuplicate(content: string, sessionKey: string): boolean {
    const key = `${sessionKey}:${hash(content)}`
    const now = Date.now()
    const lastSeen = this.recentMessages.get(key)
    
    if (lastSeen && now - lastSeen < this.WINDOW_MS) {
      return true // 重复消息
    }
    
    this.recentMessages.set(key, now)
    this.cleanup()
    return false
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, time] of this.recentMessages) {
      if (now - time > this.WINDOW_MS) {
        this.recentMessages.delete(key)
      }
    }
  }
}
```

### 4. 超时熔断机制

```typescript
interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: number
  
  // 配置
  failureThreshold: number      // 失败多少次后熔断
  resetTimeoutMs: number        // 熔断后多久尝试恢复
}

class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map()
  
  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.getBreaker(key)
    
    if (breaker.state === 'OPEN') {
      if (Date.now() - breaker.lastFailureTime > breaker.resetTimeoutMs) {
        breaker.state = 'HALF_OPEN'
      } else {
        throw new Error('CIRCUIT_OPEN: Service temporarily unavailable')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess(breaker)
      return result
    } catch (error) {
      this.onFailure(breaker)
      throw error
    }
  }
  
  private onSuccess(breaker: CircuitBreaker): void {
    breaker.failureCount = 0
    breaker.state = 'CLOSED'
  }
  
  private onFailure(breaker: CircuitBreaker): void {
    breaker.failureCount++
    breaker.lastFailureTime = Date.now()
    
    if (breaker.failureCount >= breaker.failureThreshold) {
      breaker.state = 'OPEN'
    }
  }
}
```

---

## 完整调用流程

```
用户消息
    ↓
[去重检查] ──重复?──→ 返回已处理结果
    ↓ 否
[按 sessionKey 路由到对应队列]
    ↓
[队列排队] ──有正在处理的?──→ 等待
    ↓ 队首
[获取全局并发许可]
    ↓
[熔断器检查]
    ↓
[调用 OpenClaw API]
    ↓
[结果返回用户]
    ↓
[触发处理下一个消息]
```

---

## OpenClaw 集成建议

### 在 Gateway 层实现

```typescript
// gateway/middleware/queue.ts
const messageQueues = new Map<string, LinearQueue>()
const deduplicator = new Deduplicator()
const circuitBreaker = new CircuitBreakerManager()

export async function handleMessage(
  sessionKey: string, 
  message: string,
  options: { priority?: 'normal' | 'high' | 'urgent' } = {}
): Promise<any> {
  // 1. 去重检查
  if (deduplicator.isDuplicate(message, sessionKey)) {
    throw new Error('Duplicate message detected')
  }
  
  // 2. 获取或创建 session 队列
  if (!messageQueues.has(sessionKey)) {
    messageQueues.set(sessionKey, new LinearQueue())
  }
  const queue = messageQueues.get(sessionKey)!
  
  // 3. 入队等待处理
  return queue.enqueue({
    id: generateId(),
    sessionKey,
    content: message,
    timestamp: Date.now(),
    priority: options.priority || 'normal',
    retryCount: 0
  })
}

// 在 API handler 中使用
app.post('/api/message', async (req, res) => {
  try {
    const { sessionKey, message, priority } = req.body
    
    // 使用队列处理
    const result = await handleMessage(sessionKey, message, { priority })
    
    res.json({ success: true, result })
  } catch (error) {
    res.status(429).json({ 
      error: error.message,
      retryAfter: 5 // 建议客户端多久后重试
    })
  }
})
```

### 客户端配合

```typescript
// 前端发送消息时
async function sendMessage(content: string) {
  // 本地先显示，标记为"发送中"
  const localId = addPendingMessage(content)
  
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionKey: currentSession,
        message: content,
        priority: 'normal'
      })
    })
    
    if (response.status === 429) {
      // 被限流，显示等待提示
      updateMessageStatus(localId, 'queued')
      // 可以在这里轮询或等待 WebSocket 通知
    } else {
      updateMessageStatus(localId, 'sent')
    }
    
  } catch (error) {
    updateMessageStatus(localId, 'error')
  }
}
```

---

## 配置参数建议

```yaml
queue:
  # 每个 session 最大队列长度（防止内存溢出）
  maxQueueSize: 50
  
  # 全局最大并发处理数
  globalConcurrency: 3
  
  # 单条消息超时时间
  messageTimeout: 120000  # 2分钟
  
  # 重试配置
  retry:
    maxAttempts: 3
    backoffMultiplier: 2
    initialDelay: 1000  # 1秒
  
  # 熔断器配置
  circuitBreaker:
    failureThreshold: 5
    resetTimeout: 30000  # 30秒
  
  # 去重窗口
  dedupWindow: 5000  # 5秒
```

---

## 效果

| 场景 | 解决前 | 解决后 |
|------|--------|--------|
| 快速连发 5 条消息 | 并发报错/乱序响应 | 排队串行，顺序响应 |
| API rate limit | 大量 429 错误 | 自动退避重试 |
| 长消息处理中发新消息 | 状态混乱 | 等待完成后再处理 |
| 系统过载 | 崩溃/无响应 | 背压保护，优雅降级 |

要我帮你实现这个策略的具体代码吗？或者你遇到的是哪种具体报错？
