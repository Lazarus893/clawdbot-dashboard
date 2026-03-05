import { motion } from 'framer-motion';
import { useSessions } from '../hooks/useOpenClawAPI';
import { ModelSwitcher } from './ModelSwitcher';
import {
  ChatCircleDots,
  Clock,
  Cpu,
  Coins,
  ArrowsClockwise,
  Timer,
  CaretRight,
} from '@phosphor-icons/react';

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

function formatTokens(n?: number): string {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.4, bounce: 0 } },
};

export function Dashboard() {
  const { sessions, loading, error, isRefreshing, refetch } = useSessions();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton skeleton-heading w-40" />
            <div className="skeleton skeleton-text w-52" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>

        {/* Model switcher skeleton */}
        <div className="skeleton-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <div className="skeleton skeleton-text w-24" />
                <div className="skeleton skeleton-text w-36" />
              </div>
            </div>
            <div className="skeleton h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="skeleton skeleton-heading w-12" />
                  <div className="skeleton skeleton-text w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Session list skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="skeleton skeleton-circle w-4 h-4" />
            <div className="skeleton skeleton-text w-28" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton skeleton-text w-64" />
                    <div className="skeleton h-5 w-14 rounded" />
                  </div>
                  <div className="flex gap-4">
                    <div className="skeleton skeleton-text w-20" />
                    <div className="skeleton skeleton-text w-28" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton h-5 w-16 rounded" />
                  <div className="skeleton skeleton-text w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={refetch} className="btn btn-ghost">
          <ArrowsClockwise className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const mainSessions = sessions.filter(s => !s.key.includes(':cron:'));
  const cronSessions = sessions.filter(s => s.key.includes(':cron:'));
  const totalInputTokens = sessions.reduce((acc, s) => acc + (s.inputTokens || 0), 0);
  const totalOutputTokens = sessions.reduce((acc, s) => acc + (s.outputTokens || 0), 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  const stats = [
    { label: 'Total Sessions', value: sessions.length, icon: ChatCircleDots },
    { label: 'Main Sessions', value: mainSessions.length, icon: ChatCircleDots },
    { label: 'Cron Sessions', value: cronSessions.length, icon: Timer },
    { label: 'Total Tokens', value: formatTokens(totalTokens), icon: Coins },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Active Sessions</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Real-time session monitoring</p>
        </div>
        <button
          onClick={refetch}
          disabled={isRefreshing}
          className="btn btn-ghost"
        >
          <ArrowsClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Model Switcher */}
      <div className="relative z-30">
        <ModelSwitcher />
      </div>

      {/* Stats — Bento Grid: 4 cols on md+, 2 on mobile */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/8 flex items-center justify-center">
                <stat.icon className="w-4.5 h-4.5 text-[#FF4D00]" />
              </div>
              <div>
                <p className="text-xl font-semibold text-zinc-100 tabular-nums">{stat.value}</p>
                <p className="text-[11px] text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Sessions */}
      {mainSessions.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <ChatCircleDots className="w-4 h-4 text-zinc-500" />
            Main Sessions
          </h3>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {mainSessions.map((session) => (
              <motion.div
                key={session.key}
                variants={itemVariants}
                className="card p-4 hover:border-[#FF4D00]/20 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-medium text-sm text-zinc-200 truncate">{session.key}</h4>
                      <span className="shrink-0 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[11px] font-medium border border-emerald-500/15">
                        {session.kind}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                      {session.model && (
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span className="text-zinc-400">{session.model}</span>
                        </span>
                      )}
                      {session.totalTokens ? (
                        <span className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5" />
                          <span className="text-zinc-400 tabular-nums">{formatTokens(session.totalTokens)} tokens</span>
                          <span className="text-zinc-600 tabular-nums">
                            (↓{formatTokens(session.inputTokens)} ↑{formatTokens(session.outputTokens)})
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/8 text-emerald-400 rounded text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-active" />
                      Active
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(session.ageMs)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Cron Sessions */}
      {cronSessions.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Timer className="w-4 h-4 text-zinc-500" />
            Cron Job Sessions
            <span className="text-zinc-600">({cronSessions.length})</span>
          </h3>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {cronSessions.slice(0, 6).map((session) => (
              <motion.div
                key={session.key}
                variants={itemVariants}
                className="card p-3.5 hover:border-[#FF4D00]/15 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-zinc-300 truncate">
                      {session.key.split(':').pop()}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-500">
                      <Cpu className="w-3 h-3" />
                      <span className="truncate">{session.model}</span>
                    </div>
                    {session.totalTokens ? (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
                        <Coins className="w-3 h-3" />
                        <span className="tabular-nums">{formatTokens(session.totalTokens)}</span>
                      </div>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-zinc-600 whitespace-nowrap ml-2 tabular-nums">
                    {formatTimeAgo(session.ageMs)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          {cronSessions.length > 6 && (
            <p className="text-xs text-zinc-600 text-center flex items-center justify-center gap-1">
              and {cronSessions.length - 6} more
              <CaretRight className="w-3 h-3" />
            </p>
          )}
        </section>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="text-center py-16">
          <ChatCircleDots className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No active sessions</p>
          <p className="text-sm text-zinc-600 mt-1">Sessions will appear here when Clawdbot is in use</p>
        </div>
      )}
    </div>
  );
}
