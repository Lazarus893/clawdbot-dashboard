# CLAUDE.md - Clawdbot Dashboard

> AI Assistant for managing OpenClaw - Monitoring Sessions, Cron Jobs, Agents and System Status

## Project Overview

- **Project name**: OpenClaw Dashboard
- **Type**: Web Application (React SPA)
- **Core functionality**: Visual management panel for OpenClaw - real-time session monitoring, cron job management, agent configuration, system metrics
- **Target users**: Developers and Operators managing OpenClaw instances

---

## Design Context

### Brand Identity
- **Name**: Clawdbot
- **Personality**: Professional, Clean, Technical, Developer-focused
- **Philosophy**: Linear/Vercel-inspired restrained design - 功能优先，克制装饰

### Color Palette

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary | `accent` | `#FF4D00` | Actions, highlights, active states |
| Primary Hover | `accent-hover` | `#FF6200` | Hover states |
| Primary Active | `accent-active` | `#E64500` | Active/pressed states |
| Background Deep | `bg-deep` | `#09090B` | Page background |
| Background Surface | `bg-surface` | `#0A0A0C` | Card backgrounds |
| Background Elevated | `bg-elevated` | `#121214` | Elevated surfaces |
| Border Default | `border-default` | `rgba(255,255,255,0.10)` | Default borders |
| Border Highlight | `border-highlight` | `rgba(255,255,255,0.15)` | Hover borders |
| Text Primary | `text-primary` | `#FAFAFA` | Headings, important text |
| Text Secondary | `text-secondary` | `#A1A1AA` | Body text |
| Text Tertiary | `text-tertiary` | `#71717A` | Labels, hints |
| Status Success | `status-success` | `#10B981` | Active, success states |
| Status Warning | `status-warning` | `#F59E0B` | Warning states |
| Status Error | `status-error` | `#EF4444` | Error states |

### Typography

- **Primary font**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`
- **Monospace font**: `'Geist Mono', 'SF Mono', Consolas, 'Courier New', monospace`
- **Scale**: 10px, 11px, 12px, 14px, 16px, 20px+
- **Line height**: Tight (1.2-1.4) for headings, normal (1.5-1.6) for body

### Spacing System

Based on Tailwind default scale:
- `gap-1` / `gap-2`: Tight spaces
- `gap-3` / `gap-4`: Default component spacing
- `gap-6`: Section spacing
- Padding: `p-3`, `p-4` for cards; `px-4 py-2` for buttons

### Motion & Animation

- **Library**: Framer Motion
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **Duration**: 150-300ms for interactions
- **Principles**:
  - Spring-based animations (bounce: 0-0.2)
  - Functional animations only - no decorative motion
  - `prefers-reduced-motion` must be respected

### Layout Approach

- **Container**: Max-width 1400px, centered
- **Grid**: Bento-style grid for stats (4 cols desktop, 2 cols mobile)
- **Responsive breakpoints**:
  - Mobile: < 640px (single column, compact tabs)
  - Tablet: 640px - 1024px
  - Desktop: > 1024px (full navigation)

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 (`@theme` custom tokens)
- Framer Motion (Spring animations)
- Phosphor Icons (unified icon library)
- cmdk (Command Palette)
- Recharts (Charts)
- Sonner (Toasts)
- Zustand (State management)

### Backend
- Node.js + Express + TypeScript
- WebSocket (real-time logs)
- OpenClaw CLI + ccps CLI integration

---

## Key UI Patterns

### Cards (Liquid Glass)
```tsx
<div className="card p-4">
  {/* Content */}
</div>
```
- Background: `bg-surface`
- Border: `border-default`, hover to `border-highlight`
- Inner glow: `::before` with subtle white border
- Top highlight: `::after` with gradient

### Buttons (Tactile Feedback)
```tsx
<button className="btn btn-primary">
  Action
</button>
```
- Active state: `translateY(1px) scale(0.98)`
- Hover: subtle color shift
- Focus: visible ring (2px accent)

### Status Indicators
- Active: Green dot with `breathe-dot` animation
- Warning: Static amber dot
- Error: Static red dot

### Loading States
- Skeleton screens matching exact layout
- Shimmer animation with subtle gradient

---

## Common Tasks

### Adding a new page/tab
1. Create component in `src/components/`
2. Add to `tabs` array in `App.tsx`
3. Add route/conditional render

### Adding a new stat card
```tsx
<motion.div variants={itemVariants} className="card p-4">
  <div className="flex items-center gap-3">
    <Icon className="w-4.5 h-4.5 text-[#FF4D00]" />
    <div>
      <p className="text-xl font-semibold text-zinc-100">{value}</p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  </div>
</motion.div>
```

### Adding a new table
```tsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr><th>Column</th></tr>
    </thead>
    <tbody>
      <tr><td>Data</td></tr>
    </tbody>
  </table>
</div>
```

---

## Commands

```bash
# Install dependencies
npm run install-all

# Development
npm run dev

# Build
npm run build

# Start production
npm run start
```

---

*Last updated: 2026-03-12*
