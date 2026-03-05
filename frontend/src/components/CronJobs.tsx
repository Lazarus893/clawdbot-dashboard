import { useCronJobs } from '../hooks/useOpenClawAPI';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  CircleNotch,
  Calendar,
  Robot,
  ArrowsClockwise,
  CaretDown,
  CaretUp,
  Timer,
  Lightning,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  WarningCircle,
} from '@phosphor-icons/react';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff < 0) return 'now';
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `in ${days}d`;
  if (hours > 0) return `in ${hours}h`;
  if (minutes > 0) return `in ${minutes}m`;
  return 'soon';
}

function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) { setTimeLeft('Running...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return <span className="font-mono tabular-nums">{timeLeft}</span>;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.4, bounce: 0 } },
};

interface JobCardProps {
  job: {
    id: string; name: string; enabled: boolean; agentId?: string;
    schedule: { expr: string; tz: string };
    state?: { nextRunAtMs?: number; lastRunAtMs?: number; lastStatus?: string };
  };
  isLoading: boolean;
  onToggle: (id: string, enabled: boolean) => void;
  onRun: (id: string) => void;
}

function JobCard({ job, isLoading, onToggle, onRun }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = job.state?.lastStatus === 'success' ? 'text-emerald-400' : job.state?.lastStatus === 'error' ? 'text-red-400' : 'text-zinc-500';
  const StatusIcon = job.state?.lastStatus === 'success' ? CheckCircle : job.state?.lastStatus === 'error' ? XCircle : WarningCircle;

  return (
    <motion.div variants={itemVariants} className={`card p-4 transition-colors ${job.enabled ? 'hover:border-[#FF4D00]/15' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="font-medium text-sm text-zinc-200 truncate">{job.name}</h3>
            <button
              onClick={() => onToggle(job.id, !job.enabled)}
              disabled={isLoading}
              className={`transition-colors ${job.enabled ? 'text-[#FF4D00]' : 'text-zinc-600'}`}
            >
              {job.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              <code className="font-mono text-[#FF4D00]/80 bg-[#FF4D00]/5 px-1.5 py-0.5 rounded border border-[#FF4D00]/10">
                {job.schedule.expr}
              </code>
              <span className="text-zinc-600">({job.schedule.tz})</span>
            </span>
            {job.agentId && (
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Robot className="w-3.5 h-3.5" />
                <span className="text-zinc-400">{job.agentId}</span>
              </span>
            )}
          </div>

          {job.enabled && job.state?.nextRunAtMs && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 border border-zinc-800 text-xs">
                <Timer className="w-3.5 h-3.5 text-[#FF4D00]/70" />
                <span className="text-zinc-500">Next:</span>
                <span className="font-medium text-zinc-300">
                  <CountdownTimer targetMs={job.state.nextRunAtMs} />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {job.enabled && (
            <button
              onClick={() => onRun(job.id)}
              disabled={isLoading}
              className="btn btn-primary text-xs py-1.5 px-2.5"
            >
              {isLoading ? <CircleNotch className="w-3.5 h-3.5 animate-spin" /> : <><Play className="w-3.5 h-3.5" /> Run</>}
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-zinc-600 hover:text-zinc-400 rounded-lg hover:bg-zinc-800/50 transition-colors self-end">
            {expanded ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-zinc-800/50 overflow-hidden"
        >
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {job.state?.lastRunAtMs && (
              <div className="flex items-start gap-2">
                <StatusIcon className={`w-4 h-4 mt-0.5 ${statusColor}`} />
                <div>
                  <p className="text-zinc-600 text-[11px]">Last run</p>
                  <p className="text-zinc-300 text-xs">{formatDate(job.state.lastRunAtMs)}</p>
                  {job.state.lastStatus && <span className={`text-[11px] font-medium ${statusColor}`}>{job.state.lastStatus}</span>}
                </div>
              </div>
            )}
            {job.state?.nextRunAtMs && (
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-[#FF4D00]/60" />
                <div>
                  <p className="text-zinc-600 text-[11px]">Next run</p>
                  <p className="text-zinc-300 text-xs">{formatDate(job.state.nextRunAtMs)}</p>
                  <span className="text-[11px] text-[#FF4D00]/70">{formatRelativeTime(job.state.nextRunAtMs)}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-700 mt-2">ID: <code className="text-zinc-500">{job.id}</code></p>
        </motion.div>
      )}
    </motion.div>
  );
}

export function CronJobs() {
  const { jobs, loading, error, isRefreshing, actionLoading, refetch, toggleJob, runJob } = useCronJobs();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton skeleton-heading w-28" />
            <div className="skeleton skeleton-text w-44" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="skeleton skeleton-heading w-10" />
                  <div className="skeleton skeleton-text w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Job cards skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton skeleton-text w-40" />
                    <div className="skeleton w-5 h-5 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-6 w-32 rounded" />
                    <div className="skeleton skeleton-text w-16" />
                  </div>
                  <div className="skeleton h-7 w-36 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton h-8 w-16 rounded-lg" />
                  <div className="skeleton w-7 h-7 rounded-lg self-end" />
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
        <Lightning className="w-10 h-10 text-red-500/60 mx-auto mb-3" />
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={refetch} className="btn btn-ghost">
          <ArrowsClockwise className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return (a.state?.nextRunAtMs || Infinity) - (b.state?.nextRunAtMs || Infinity);
  });

  const enabledCount = jobs.filter(j => j.enabled).length;
  const successRate = Math.round(
    (jobs.filter(j => j.state?.lastStatus === 'success').length * 100) /
    Math.max(1, jobs.filter(j => j.state?.lastStatus).length)
  );

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Clock },
    { label: 'Enabled', value: enabledCount, icon: CheckCircle },
    { label: 'Disabled', value: jobs.length - enabledCount, icon: XCircle },
    { label: 'Success Rate', value: `${successRate}%`, icon: Lightning },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Cron Jobs</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{enabledCount} of {jobs.length} jobs enabled</p>
        </div>
        <button onClick={refetch} disabled={isRefreshing} className="btn btn-ghost">
          <ArrowsClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="card p-4">
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

      {/* Jobs list */}
      {sortedJobs.length > 0 ? (
        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} isLoading={actionLoading === job.id} onToggle={toggleJob} onRun={runJob} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No cron jobs configured</p>
          <p className="text-sm text-zinc-600 mt-1">Add cron jobs to your configuration</p>
        </div>
      )}
    </div>
  );
}
