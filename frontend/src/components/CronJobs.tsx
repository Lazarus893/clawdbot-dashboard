import { useCronJobs } from '../hooks/useOpenClawAPI';
import { useState, useEffect } from 'react';
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
  Archive,
  Pulse,
  WarningCircle
} from '@phosphor-icons/react';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff < 0) return 'now';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `in ${days}d`;
  if (hours > 0) return `in ${hours}h`;
  if (minutes > 0) return `in ${minutes}m`;
  return 'soon';
}

// Countdown timer component
function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTimeLeft('Running...');
        return;
      }
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);
  
  return <span className="font-mono">{timeLeft}</span>;
}

interface JobCardProps {
  job: {
    id: string;
    name: string;
    enabled: boolean;
    agentId?: string;
    schedule: {
      expr: string;
      tz: string;
    };
    state?: {
      nextRunAtMs?: number;
      lastRunAtMs?: number;
      lastStatus?: string;
    };
  };
  index: number;
  isLoading: boolean;
  onToggle: (id: string, enabled: boolean) => void;
  onRun: (id: string) => void;
}

function JobCard({ job, index, isLoading, onToggle, onRun }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusColor = job.state?.lastStatus === 'success' 
    ? 'text-green-500' 
    : job.state?.lastStatus === 'error' 
      ? 'text-red-500' 
      : 'text-zinc-500';
  
  const statusBg = job.state?.lastStatus === 'success' 
    ? 'bg-green-500/10' 
    : job.state?.lastStatus === 'error' 
      ? 'bg-red-500/10' 
      : 'bg-zinc-500/10';
  
  const StatusIcon = job.state?.lastStatus === 'success' 
    ? CheckCircle 
    : job.state?.lastStatus === 'error' 
      ? XCircle 
      : WarningCircle;
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`
        relative flex items-start gap-3 pl-2 animate-slide-in-up transition-all duration-500
        ${isHovered ? 'translate-x-2' : ''}
      `}
    >
      {/* Timeline dot with glow */}
      <div className={`
        relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
        ${job.enabled ? 'bg-orange-500/20' : 'bg-zinc-700/50'}
        ${isHovered && job.enabled ? 'scale-110 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : ''}
      `}>
        <Clock className={`w-5 h-5 transition-all duration-300 ${job.enabled ? 'text-orange-400' : 'text-zinc-500'} ${isHovered ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
        {/* Pulse ring when enabled */}
        {job.enabled && isHovered && (
          <span className="absolute inset-0 rounded-full border-2 border-orange-500/50 animate-ping" />
        )}
      </div>

      {/* Content with glass effect */}
      <div className={`
        flex-1 p-4 rounded-xl transition-all duration-500 cursor-pointer glass-card
        ${job.enabled 
          ? 'hover:border-orange-500/40' 
          : 'opacity-60 hover:opacity-80'
        }
        ${isHovered ? 'shadow-[0_0_30px_rgba(249,115,22,0.1)] border-orange-500/30' : ''}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-white truncate">{job.name}</h3>
              
              {/* Toggle button */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(job.id, !job.enabled); }}
                disabled={isLoading}
                className={`
                  transition-all duration-300 hover:scale-110
                  ${job.enabled ? 'text-orange-400' : 'text-zinc-500'}
                `}
              >
                {job.enabled ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Schedule */}
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <code className="font-mono text-orange-300 text-xs bg-orange-500/10 px-1.5 py-0.5 rounded">
                  {job.schedule.expr}
                </code>
                <span className="text-zinc-600 text-xs">({job.schedule.tz})</span>
              </div>
              
              {/* Agent */}
              {job.agentId && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Robot className="w-3.5 h-3.5" />
                  <span className="text-amber-300">{job.agentId}</span>
                </div>
              )}
            </div>
            
            {/* Next run countdown with glow */}
            {job.enabled && job.state?.nextRunAtMs && (
              <div className="flex items-center gap-2 mt-3">
                <div className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border-orange-500/30 
                  transition-all duration-300
                  ${isHovered ? 'shadow-[0_0_20px_rgba(249,115,22,0.2)] border-orange-500/50' : ''}
                `}>
                  <Timer className={`w-3.5 h-3.5 text-orange-400 ${isHovered ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-orange-300">Next run:</span>
                  <span className={`text-sm font-bold transition-all duration-300 ${isHovered ? 'text-gradient-primary' : 'text-orange-400'}`}>
                    <CountdownTimer targetMs={job.state.nextRunAtMs} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions with enhanced styling */}
          <div className="flex flex-col gap-2">
            {job.enabled && (
              <button
                onClick={(e) => { e.stopPropagation(); onRun(job.id); }}
                disabled={isLoading}
                className={`
                  flex items-center justify-center gap-1.5 px-3 py-2 
                  gradient-animated
                  text-white rounded-lg text-xs font-medium 
                  transition-all duration-500 disabled:opacity-50 
                  hover:scale-110 shadow-[0_0_20px_rgba(249,115,22,0.3)]
                  hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]
                `}
              >
                {isLoading ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center p-2 text-zinc-500 hover:text-orange-400 hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              {isExpanded ? (
                <CaretUp className="w-4 h-4" />
              ) : (
                <CaretDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3 animate-fadeIn">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {/* Last run info */}
              {job.state?.lastRunAtMs && (
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusBg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Last run</p>
                    <p className="text-zinc-300">{formatDate(job.state.lastRunAtMs)}</p>
                    {job.state.lastStatus && (
                      <span className={`text-xs font-medium ${statusColor}`}>
                        {job.state.lastStatus}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Next run info */}
              {job.state?.nextRunAtMs && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-orange-500/10">
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Next run</p>
                    <p className="text-zinc-300">{formatDate(job.state.nextRunAtMs)}</p>
                    <span className="text-xs text-orange-400">
                      {formatRelativeTime(job.state.nextRunAtMs)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-zinc-600">
              Job ID: <code className="text-zinc-400">{job.id}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CronJobs() {
  const { jobs, loading, error, isRefreshing, actionLoading, refetch, toggleJob, runJob } = useCronJobs();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800/50 rounded-lg w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800/50 rounded-full"></div>
                <div className="flex-1 h-32 bg-zinc-800/30 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-sm animate-scale-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Lightning className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-400 mb-4 font-medium">{error}</p>
          <button 
            onClick={refetch}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 hover:scale-105 border border-red-500/20"
          >
            <ArrowsClockwise className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Sort jobs: enabled first, then by next run time
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    const aNext = a.state?.nextRunAtMs || Infinity;
    const bNext = b.state?.nextRunAtMs || Infinity;
    return aNext - bNext;
  });

  const enabledCount = jobs.filter(j => j.enabled).length;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary flex items-center gap-2">
            Cron Jobs
            <Pulse className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-zinc-500 mt-1">
            {enabledCount} of {jobs.length} jobs enabled
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-orange-500/30 rounded-xl transition-all duration-300 text-zinc-400 hover:text-orange-400 disabled:opacity-50 hover:scale-105"
        >
          <ArrowsClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats cards with glass effects */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: Clock, color: 'orange', glow: 'rgba(249,115,22,0.3)' },
          { label: 'Enabled', value: enabledCount, icon: CheckCircle, color: 'green', glow: 'rgba(34,197,94,0.3)' },
          { label: 'Disabled', value: jobs.length - enabledCount, icon: XCircle, color: 'zinc', glow: 'rgba(113,113,122,0.2)' },
          { label: 'Success Rate', value: `${jobs.filter(j => j.state?.lastStatus === 'success').length * 100 / Math.max(1, jobs.filter(j => j.state?.lastStatus).length)}%`.split('.')[0] + '%', icon: Lightning, color: 'amber', glow: 'rgba(251,191,36,0.3)' },
        ].map((stat, idx) => (
          <div 
            key={stat.label}
            style={{ animationDelay: `${idx * 50}ms` }}
            className="glass-card rounded-xl p-4 animate-slide-in-up hover:border-orange-500/30 transition-all duration-500 group cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-500/20 transition-all duration-300 group-hover:scale-110`}
                style={{ 
                  boxShadow: `0 0 0 ${stat.glow}`,
                }}
              >
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white group-hover:text-gradient-primary transition-all duration-300">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs Timeline with glass container */}
      {sortedJobs.length > 0 ? (
        <div 
          className="glass-card-strong rounded-2xl p-5 animate-slide-in-up hover:border-orange-500/20 transition-all duration-500 group"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300">
              <Timer className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Scheduled Tasks</h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 ml-auto glass-card px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></span>
              Live
            </div>
          </div>
          
          <div className="relative">
            {/* Timeline line with gradient glow */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-amber-500/50 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.3)]" />

            <div className="space-y-4">
              {sortedJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  isLoading={actionLoading === job.id}
                  onToggle={toggleJob}
                  onRun={runJob}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 animate-scale-up">
          <div className="w-20 h-20 mx-auto mb-4 bg-zinc-800/50 rounded-2xl flex items-center justify-center">
            <Archive className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-medium">No cron jobs configured</p>
          <p className="text-sm text-zinc-600 mt-2">
            Add cron jobs to your Clawdbot configuration
          </p>
        </div>
      )}
    </div>
  );
}
