import { useSystemStatus } from '../hooks/useOpenClawAPI';
import { motion } from 'framer-motion';
import {
  HardDrives,
  Pulse,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  Terminal,
  Folder,
  Globe,
  Cpu,
  HardDrive,
} from '@phosphor-icons/react';

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.4, bounce: 0 } },
};

export function SystemStatus() {
  const { status, loading, error, isRefreshing, refetch } = useSystemStatus();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton skeleton-heading w-36" />
            <div className="skeleton skeleton-text w-56" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>

        {/* Gateway card skeleton */}
        <div className="skeleton-card p-6">
          <div className="flex items-center gap-5">
            <div className="skeleton w-14 h-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="skeleton skeleton-heading w-24" />
                <div className="skeleton skeleton-circle w-5 h-5" />
              </div>
              <div className="skeleton skeleton-text w-16" />
            </div>
            <div className="skeleton skeleton-circle w-3 h-3" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="skeleton skeleton-text w-16" />
                  <div className="skeleton skeleton-heading w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="md:col-span-3 skeleton-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="skeleton skeleton-circle w-4 h-4" />
                <div className="skeleton skeleton-text w-24" />
              </div>
              <div className="space-y-2.5">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="skeleton skeleton-circle w-1.5 h-1.5" />
                    <div className="skeleton h-6 rounded" style={{ width: `${60 + j * 10}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resources skeleton */}
        <div className="skeleton-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="skeleton skeleton-circle w-4 h-4" />
            <div className="skeleton skeleton-text w-32" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="skeleton skeleton-text w-20" />
                  <div className="skeleton skeleton-text w-8" />
                </div>
                <div className="skeleton h-1.5 w-full rounded-full" />
                <div className="skeleton skeleton-text w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <XCircle className="w-10 h-10 text-red-500/60 mx-auto mb-3" />
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={refetch} className="btn btn-ghost">
          <ArrowsClockwise className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  const isRunning = status.gateway.running;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">System Status</h2>
          <p className="text-sm text-zinc-500 mt-0.5">OpenClaw infrastructure health</p>
        </div>
        <button onClick={refetch} disabled={isRefreshing} className="btn btn-ghost">
          <ArrowsClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Gateway status card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
        className={`card p-6 ${isRunning ? 'border-emerald-500/15' : 'border-red-500/20'}`}
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isRunning ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <HardDrives className={`w-7 h-7 ${isRunning ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="text-lg font-semibold text-zinc-100">Gateway</h3>
              {isRunning ? (
                <CheckCircle weight="fill" className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle weight="fill" className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className={`text-sm font-medium ${isRunning ? 'text-emerald-400' : 'text-red-400'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </p>
          </div>
          {isRunning && (
            <div className="w-3 h-3 rounded-full bg-emerald-400 status-dot-active" />
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {isRunning && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-3"
        >
          {status.gateway.pid && (
            <motion.div variants={itemVariants} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/8 flex items-center justify-center">
                  <Hash className="w-4.5 h-4.5 text-[#FF4D00]" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Process ID</p>
                  <p className="text-lg font-semibold text-zinc-100 tabular-nums">{status.gateway.pid}</p>
                </div>
              </div>
            </motion.div>
          )}
          {status.gateway.uptime && (
            <motion.div variants={itemVariants} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/8 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Uptime</p>
                  <p className="text-lg font-semibold text-zinc-100">{status.gateway.uptime}</p>
                </div>
              </div>
            </motion.div>
          )}
          <motion.div variants={itemVariants} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/8 flex items-center justify-center">
                <Pulse className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Status</p>
                <p className="text-lg font-semibold text-emerald-400">Healthy</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Info cards — Bento Grid: 6 cols */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* Quick Actions — 3 cols */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-3 card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quick Actions</h4>
          </div>
          <div className="space-y-2.5">
            {[
              { cmd: 'openclaw gateway status', desc: 'Check status' },
              { cmd: 'openclaw gateway restart', desc: 'Restart gateway' },
              { cmd: 'openclaw sessions', desc: 'List sessions' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-[#FF4D00]/60">&#x2022;</span>
                <code className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-800 text-xs text-zinc-400 font-mono">
                  {item.cmd}
                </code>
                <span className="text-zinc-600 text-xs">— {item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Configuration — 3 cols */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-3 card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Configuration</h4>
          </div>
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'Config Directory', value: '~/.openclaw', icon: Folder },
              { label: 'Agents Config', value: 'agents.yaml', icon: HardDrive },
              { label: 'Dashboard API', value: 'localhost:3001', icon: Globe },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-zinc-500 text-xs">
                  <item.icon className="w-3.5 h-3.5 text-zinc-600" />
                  {item.label}
                </span>
                <code className="text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-800 text-xs font-mono">
                  {item.value}
                </code>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Resources */}
      {isRunning && status.resources && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0, delay: 0.15 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">System Resources</h4>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-active" />
              Live
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: `CPU (${status.resources.cpuCores} cores)`,
                value: status.resources.cpuPercent,
                detail: `Load: ${status.resources.loadAvg.join(', ')}`,
              },
              {
                label: 'Memory',
                value: status.resources.memoryPercent,
                detail: `${(status.resources.memoryUsedMB / 1024).toFixed(1)} / ${(status.resources.memoryTotalMB / 1024).toFixed(1)} GB`,
              },
              {
                label: 'Load Avg (5m)',
                value: Math.min(100, Math.round((status.resources.loadAvg[1] / status.resources.cpuCores) * 100)),
                detail: `${status.resources.loadAvg[1]} / ${status.resources.cpuCores} cores`,
              },
            ].map((resource, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 text-xs">{resource.label}</span>
                  <span className="font-medium text-zinc-300 text-xs tabular-nums">{resource.value}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill bg-[#FF4D00]"
                    style={{ width: `${resource.value}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 tabular-nums">{resource.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
