# Clawdbot Dashboard 视觉优化方案 V2.0

> **版本:** 2.0 (Professional Edition)
> **日期:** 2026-03-05
> **设计理念:** 克制 · 高智感 · 科技感 · 线条感

> **参考框架:** Linear/Vercel Design Philosophy + Jakub Krehel Production Polish

---

## 📊 Reconnaissance Complete

**项目类型**: SaaS Dashboard - OpenClaw Agent 管理面板
**现有技术栈**: React + Vite + Framer Motion + Tailwind CSS v4
**现有动画风格**: 大量呼吸/浮动效果 (3000-8000ms)、渐变动画、频繁光晕
**现有配色**: 黑橙主题 + Glassmorphism
**字体系统**: 系统默认字体

**推断意图**: 为开发者和管理者提供高效的 Agent 监控和管理工具

**推荐视角权重**:
- **Primary**: **Emil Kowalski** — 生产效率工具需要克制、快速、有目的性的动画
- **Secondary**: **Jakub Krehel** — 精致的打磨和专业的进出场动画
- **Selective**: **Jhey Tompkins** — 仅用于空状态和引导流程

---

## 一、设计系统重构

### 1.1 字体系统 (Critical: Inter Ban)

```css
/* ❌ BANNED: Inter Font - Generic AI Default */
/* ✅ REQUIRED: Geist Mono + Cabinet Grotesk/Satoshi */

@import url('https://api.fontshare.com/v2/css?f[]=geist-mono@400,500,600&f[]=cabinet-grotesk@400,500,600,700&display=swap');

:root {
  --font-display: 'Cabinet Grotesk', -apple-system, sans-serif;
  --font-body: 'Cabinet Grotesk', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', Consolas, monospace;
}
```

**应用规则:**
| 用途 | 字体 | 样式 |
|------|------|------|
| Display/H1 | Cabinet Grotesk | `text-4xl md:text-6xl tracking-tighter leading-none font-semibold` |
| 标题 | Cabinet Grotesk | `text-xl md:text-2xl tracking-tight font-medium` |
| 正文 | Cabinet Grotesk | `text-base text-gray-400 leading-relaxed` |
| 数据/代码 | Geist Mono | `font-mono text-sm tabular-nums` |

---

### 1.2 配色系统 (Single Accent Rule)

```css
:root {
  /* === 单一强调色 === */
  --accent: #FF4D00;              /* Electric Orange - 低饱和度，高对比 */
  --accent-dim: rgba(255, 77, 0, 0.08);
  --accent-subtle: rgba(255, 77, 0, 0.04);

  /* === 中性基色 - Zinc 统一 === */
  --bg-deep: #09090B;           /* Zinc-950 */
  --bg-surface: #0A0A0C;        /* Zinc-950 + subtle elevation */
  --bg-elevated: #121214;         /* Zinc-900 */
  --bg-elevated-2: #18181B;      /* Zinc-800 */
  --bg-card: #09090B;            /* 同深色，仅用边框区分 */

  /* === 线条系统 === */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-accent: rgba(255, 77, 0, 0.15);
  --border-highlight: rgba(255, 255, 255, 0.15);

  /* === 文字层级 === */
  --text-primary: #FAFAFA;        /* Zinc-50 */
  --text-secondary: #A1A1AA;     /* Zinc-400 */
  --text-tertiary: #71717A;      /* Zinc-500 */
  --text-dim: #3F3F46;           /* Zinc-700 */

  /* === 状态色 - 去饱和度 === */
  --status-success: #10B981;      /* Emerald-500 */
  --status-warning: #F59E0B;      /* Amber-500 */
  --status-error: #EF4444;        /* Red-500 */
  --status-info: #3B82F6;        /* Blue-500 */
}
```

**配色原则:**
```diff
- ❌ 渐变按钮、多重光晕、紫色/蓝色 AI 风格
- ❌ 饱和度过高 (s > 80%)
- ❌ 纯黑色 #000000
+ ✅ 单一强调色 (Electric Orange)
+ ✅ Zinc 灰度系统统一
+ ✅ Off-Black 背景 (#09090B)
+ ✅ 去饱和度状态色
```

---

### 1.3 间距系统 (8px Grid)

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

**Tailwind 映射:**
```
--space-1  →  p-1 / gap-1  / m-1  (4px)
--space-2  →  p-2 / gap-2  / m-2  (8px)
--space-4  →  p-4 / gap-4  / m-4  (16px)
--space-6  →  p-6 / gap-6  / m-6  (24px)
--space-8  →  p-8 / gap-8  / m-8  (32px)
```

---

### 1.4 视口安全 (Critical: dvh Rule)

```diff
- ❌ h-screen (导致 iOS Safari 布局跳动)
+ ✅ min-h-[100dvh] (动态视口高度)
```

```css
.hero-section {
  min-height: 100dvh;  /* Dynamic Viewport Height */
}
```

---

## 二、组件架构规范

### 2.1 基础约束

| 约束 | 说明 | 违规示例 |
|--------|------|----------|
| 禁止 Emoji | 使用 Phosphor 图标 | `🚀` ❌ → `<Rocket className="w-4" />` ✅ |
| Grid 优先 | 避免复杂 Flex 计算 | `w-[calc(33%-1rem)]` ❌ → `grid-cols-3 gap-6` ✅ |
| 容器限制 | 使用 max-w-* | `w-full px-4` ✅ |
| 响应式断点 | sm/md/lg/xl 标准化 | 避免自定义断点 |
| 触摸目标 | 最小 44px | `<button className="h-11">` ✅ |

---

### 2.2 图标系统

```tsx
// ✅ 正确：统一使用 Phosphor Icons
import { Robot, Clock, HardDrives } from '@phosphor-icons/react';

<Robot className="w-5 h-5 stroke-[1.5]" />  /* 统一 stroke-width */
```

**图标规范:**
- **尺寸**: w-4 h-4 (16px) / w-5 h-5 (20px) / w-6 h-6 (24px)
- **线条粗细**: stroke-[1.5] 或 stroke-[2]（统一全局）
- **颜色**: 继承文字颜色 `text-inherit`
- **禁用**: Lucide 图标（保持单一图标库）

---

### 2.3 卡片组件 (Liquid Glass Refraction)

```tsx
// ✅ 正确：Liquid Glass + 内边框 + 细阴影
<div className="card border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl rounded-xl overflow-hidden relative">
  {/* 内边框 - 模拟物理折射 */}
  <div className="absolute inset-0 rounded-xl border border-white/[0.05] pointer-events-none" />

  {/* 内阴影 - 深度效果 */}
  <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />

  {/* 内容 */}
  <div className="relative p-6">
    <h3 className="font-display font-medium text-lg text-zinc-100 mb-2">Title</h3>
    <p className="text-zinc-400">Description</p>
  </div>
</div>
```

**卡片规则:**
- ✅ 1px 半透明边框 (`border-zinc-800/50`)
- ✅ 内边框效果 (`border-white/[0.05]`)
- ✅ 背景模糊 (`backdrop-blur-xl`)
- ✅ 内阴影深度 (`shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`)
- ❌ 禁止外发光效果
- ❌ 禁止渐变背景

---

### 2.4 按钮组件 (Tactile Feedback)

```tsx
// ✅ 正确：物理按压反馈
<button className="btn-primary group relative overflow-hidden">
  <span className="btn-label relative z-10">Action</span>
</button>

<style>
.btn-primary {
  @apply flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg;
  @apply bg-[#FF4D00] text-white font-medium text-sm;
  @apply transition-all duration-150;
}

.btn-primary:hover {
  @apply bg-[#FF6200];
}

/* 物理按压反馈 */
.btn-primary:active {
  @apply translate-y-[1px] scale-[0.98];
  @apply bg-[#E64500];
}
</style>
```

**按钮交互状态:**
```
┌──────────┬─────────────────────────────────────────┐
│ 状态      │ CSS 效果                            │
├──────────┼─────────────────────────────────────────┤
│ Default  │ 基础样式                            │
├──────────┼─────────────────────────────────────────┤
│ Hover    │ background 变亮，150ms 过渡             │
├──────────┼─────────────────────────────────────────┤
│ Active   │ translate-y-[1px] + scale-[0.98]      │
├──────────┼─────────────────────────────────────────┤
│ Focus    │ outline: 2px solid rgba(255,77,0,0.4) │
├──────────┼─────────────────────────────────────────┤
│ Disabled │ opacity: 0.5, cursor: not-allowed   │
└──────────┴─────────────────────────────────────────┘
```

---

## 三、动画系统 (Emil + Jakub Perspective)

### 3.1 动画原则

```diff
- ❌ 频繁的呼吸/浮动效果 (3000-8000ms)
- ❌ 无目的的装饰性动画
- ❌ 高频触发的 UI 动画
+ ✅ 有明确功能目的的微交互
+ ✅ 生产效率优先的快速过渡
+ ✅ 可中断的 transition (CSS)
```

### 3.2 动画时长规范 (Emil 视角)

| 上下文 | 推荐时长 | 缓动函数 |
|--------|----------|----------|
| Hover 状态 | 150ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 按钮反馈 | 100ms | `ease-out` |
| 页面过渡 | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 列表进入 | 400ms | spring (stiffness: 100, damping: 20) |
| 模态打开 | 350ms | spring (stiffness: 200, damping: 25) |

### 3.3 Spring Physics (Jakub 进场动画)

```tsx
import { motion } from 'framer-motion';

// ✅ 正确：Jakub 进场动画配方
<motion.div
  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
  transition={{
    type: 'spring',
    duration: 0.45,
    bounce: 0,  /* Jakub: 0 for professional polish */
    stiffness: 100,
    damping: 20,
  }}
>
  Content
</motion.div>
```

**退场动画 (更微妙):**
```tsx
<motion.div
  exit={{
    opacity: 0,
    y: -4,  /* 比进场更小的值 */
    filter: 'blur(2px)', /* 更淡的模糊 */
  }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

---

### 3.4 Staggered 编排

```tsx
// ✅ 正确：Parent + Children 同一组件树
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, /* 80ms 级联延迟 */
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul
  variants={listVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={itemVariants}
      className="border-b border-zinc-800/50 py-3"
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

### 3.5 Layout Transitions

```tsx
// ✅ 正确：使用 layoutId 实现平滑重排
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    layout
    layoutId="tab-content"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

---

### 3.6 Magnetic Button (MOTION_INTENSITY > 5 时可选)

```tsx
// ✅ 正确：使用 useMotionValue 避免渲染循环
import { motion, useMotionValue, useTransform } from 'framer-motion';

function MagneticButton({ children, ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ clientX, clientY, currentTarget }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    mouseX.set(clientX - centerX);
    mouseY.set(clientY - centerY);
  }

  return (
    <motion.button
      {...props}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF4D00] text-white font-medium text-sm"
    >
      {children}
    </motion.button>
  );
}
```

---

## 四、布局系统 (Anti-3-Column Rule)

### 4.1 Bento Grid 范式

```tsx
// ✅ 正确：不对称 Bento 布局
<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
  {/* 大卡片 - 4 列宽 */}
  <div className="md:col-span-4 min-h-[200px] p-6 border border-zinc-800/50 bg-zinc-950/50 rounded-xl">
    <h3 className="font-display font-medium text-lg text-zinc-100">Main Metrics</h3>
  </div>

  {/* 中卡片 - 2 列宽 */}
  <div className="md:col-span-2 min-h-[200px] p-6 border border-zinc-800/50 bg-zinc-950/50 rounded-xl">
    <h3 className="font-display font-medium text-lg text-zinc-100">Status</h3>
  </div>

  {/* 第二行：三等分 */}
  <div className="md:col-span-2 min-h-[160px] p-6 border border-zinc-800/50 bg-zinc-950/50 rounded-xl" />
  <div className="md:col-span-2 min-h-[160px] p-6 border border-zinc-800/50 bg-zinc-950/50 rounded-xl" />
  <div className="md:col-span-2 min-h-[160px] p-6 border border-zinc-800/50 bg-zinc-950/50 rounded-xl" />
</div>
```

**布局规则:**
- ✅ 使用 CSS Grid (`grid-cols-*`)
- ✅ 非对称划分 (`col-span-4`, `col-span-2`)
- ❌ 禁止 3 列等分 (BANNED: 3 equal cards horizontally)
- ❌ 禁止复杂 Flex 计算

---

### 4.2 页面容器

```tsx
// ✅ 正确：安全容器
<main className="min-h-[100dvh]">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    {content}
  </div>
</main>
```

---

## 五、微交互 (Jakub Polish)

### 5.1 Status Dot 呼吸效果

```tsx
// ✅ 正确：微妙呼吸，无外发光
<motion.div
  className="w-2 h-2 rounded-full bg-[#10B981]"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

---

### 5.2 Tooltip (Radix UI)

```tsx
// ✅ 正确：无障碍优先的 Tooltip
import * as Tooltip from '@radix-ui/react-tooltip';

<Tooltip.Root delayDuration={200}>
  <Tooltip.Trigger asChild>
    <button className="flex items-center">
      <Info className="w-4 h-4 text-zinc-500" />
    </button>
  </Tooltip.Trigger>
  <Tooltip.Content
    className="px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-300 shadow-lg"
    sideOffset={8}
  >
    Tooltip content
  </Tooltip.Content>
</Tooltip.Root>
```

---

### 5.3 Toast 通知 (Sonner)

```tsx
// ✅ 正确：极简 Toast 系统
import { toast } from 'sonner';

toast.success('Configuration saved', {
  duration: 3000,
  position: 'bottom-right',
  style: {
    background: '#09090B',
    border: '1px solid rgba(255,255,255,0.1)',
  },
});
```

---

## 六、性能与无障碍

### 6.1 GPU 加速规则

```diff
- ❌ 动画: top, left, width, height
+ ✅ 动画: transform, opacity
```

```css
/* ✅ 正确：硬件加速 */
.animate-entrance {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU */
}
```

---

### 6.2 Prefers Reduced Motion

```tsx
// ✅ 正确：尊重动画偏好
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={!shouldReduceMotion ? { opacity: 1 } : {}}
  transition={!shouldReduceMotion ? { duration: 0.3 } : {}}
>
  Content
</motion.div>
```

---

### 6.3 无障碍标准 (WCAG 2.1 AA)

| 要求 | 最小值 | 实现方式 |
|------|--------|----------|
| 文字对比度 | 4.5:1 | `text-zinc-100` on `bg-zinc-950` |
| 大文字对比度 | 3.0:1 | `text-2xl+` |
| 触摸目标 | 44x44px | `min-h-[44px] min-w-[44px]` |
| 焦点指示器 | 可见 | `outline: 2px solid` |
| ARIA 标签 | 有语义 | `aria-label`, `aria-describedby` |

---

## 七、推荐引入的库

### 7.1 核心依赖

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.2",
    "sonner": "^1.5.0",
    "react-spring": "^9.7.4"
  }
}
```

**安装命令:**
```bash
cd frontend && npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-toast sonner react-spring
```

---

### 7.2 字体依赖

```bash
# 使用 Fontshare (免费，无需 API Key)
# Geist Mono + Cabinet Grotesk
```

---

## 八、实施路线图

### Phase 1: 基础架构 (1周)
- [ ] 安装字体 (Cabinet Grotesk + Geist Mono)
- [ ] 更新 CSS 变量系统
- [ ] 配置 Tailwind v4 字体栈
- [ ] 建立间距/圆角系统
- [ ] 创建 tokens 配置

### Phase 2: 组件库 (2周)
- [ ] Card (Liquid Glass)
- [ ] Button (Tactile Feedback)
- [ ] Table (Border System)
- [ ] Tooltip (Radix UI)
- [ ] Toast (Sonner)
- [ ] Modal (Radix Dialog)

### Phase 3: 页面重构 (2周)
- [ ] Dashboard (Bento Grid)
- [ ] Agents (List + Detail)
- [ ] Cron Jobs (Timeline)
- [ ] System Status (Metrics Grid)

### Phase 4: 动画优化 (1周)
- [ ] 移除装饰性粒子效果
- [ ] 实现 Spring 进场动画
- [ ] 添加 Layout Transitions
- [ ] 优化时长 (150-300ms)
- [ ] 支持 Reduced Motion

---

## 九、检查清单 (Pre-Flight)

在代码输出前检查:

```diff
- [ ] 使用了 Inter 字体 → 改用 Cabinet Grotesk/Geist
- [ ] 使用了 emoji → 改用 Phosphor Icons
- [ ] 使用了 h-screen → 改用 min-h-[100dvh]
- [ ] 使用了复杂的 flex 计算 → 改用 CSS Grid
- [ ] 使用了 3 列等分布局 → 改用不对称 Bento
- [ ] 动画使用了 top/left → 改用 transform
- [ ] 缺少加载/空状态 → 添加完整状态
- [ ] 缺少 prefers-reduced-motion → 添加支持
- [ ] 使用了紫色/蓝色 AI 风格 → 改用 Zinc + 单强调色
- [ ] 按钮没有物理反馈 → 添加 active:translate-y-[1px]
```

---

## 十、设计师参考总结

| 设计师 | 核心理念 | 应用于本项目 |
|--------|----------|------------|
| **Emil Kowalski** | 克制、速度、有目的的动画 | 主要视角 - 生产效率工具需要快速、不干扰的交互 |
| **Jakub Krehel** | 精致打磨、进出场动画 | 次要视角 - Spring Physics、微妙的退场、阴影细节 |
| **Jhey Tompkins** | 实验性、顽皮 | 选择性 - 仅用于空状态和引导流程 |

**最常引用**: **Emil Kowalski**

**理由**: OpenClaw Dashboard 是生产效率工具，用户关注的是数据和控制，而非装饰性动画。Emil 的克制哲学最适合此类应用。

**如果要调整权重**:
- **更偏向 Emil**: 移除所有非必要动画，将 Hover 时长降至 100ms
- **更偏向 Jakub**: 增强 Spring 弹性效果，添加更精致的阴影和光效
- **更偏向 Jhey**: 在引导流程添加更多惊喜元素，空状态使用创意动画

---

## 附录：Tailwind CSS v4 配置

```css
/* frontend/tailwind.config.js */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        zinc: {
          950: '#09090B',
          900: '#121214',
          800: '#18181B',
          700: '#27272A',
          600: '#3F3F46',
          500: '#71717A',
          400: '#A1A1AA',
          300: '#D4D4D8',
          200: '#E4E4E7',
          100: '#F4F4F5',
          50: '#FAFAFA',
        },
        accent: {
          DEFAULT: '#FF4D00',
          dim: 'rgba(255, 77, 0, 0.08)',
          subtle: 'rgba(255, 77, 0, 0.04)',
        },
      },
      animation: {
        'breathe': 'breathe 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 总结

本 V2 方案基于 **Linear/Vercel 设计哲学** + **Jakub Krehel 生产打磨** + **Web Interface Guidelines** 严格审核。

**核心改变：**
1. **字体升级** - Cabinet Grotesk + Geist Mono (替代 Inter)
2. **单一强调色** - Electric Orange (#FF4D00)，移除 AI 紫色
3. **克制动画** - 移除粒子/呼吸，仅保留 150-300ms 功能性动画
4. **Liquid Glass** - 内边框 + 内阴影替代外发光
5. **Bento Grid** - 非对称布局替代 3 列等分
6. **Spring Physics** - Jakub 进场动画配方 (bounce: 0)
7. **物理反馈** - active 状态的 translate-y-[1px] + scale-[0.98]
8. **视口安全** - min-h-[100dvh] 替代 h-screen

**预期效果：**
- 专业的生产工具质感
- 快速、不干扰的交互
- 清晰的信息层次
- 优雅的进出场动画
- 完整的无障碍支持

---

*基于 Emil Kowalski (Linear)、Jakub Krehel (Production Polish)、Vercel Web Interface Guidelines 的专业设计方法论*
