import { useCronJobs } from '../hooks/useClawdbotAPI';

// Icon components
function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function LoaderIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function BotIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <circle cx="9" cy="14" r="2" />
      <circle cx="15" cy="14" r="2" />
      <path d="M12 2v6" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
    </svg>
  );
}

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

export function CronJobs() {
  const { jobs, loading, error, isRefreshing, actionLoading, refetch, toggleJob, runJob } = useCronJobs();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700/50 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-slate-800/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Cron Jobs
          </h2>
          <p className="text-slate-400 mt-1">
            {enabledCount} of {jobs.length} jobs enabled
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all text-slate-300 disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {sortedJobs.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No cron jobs configured</p>
            <p className="text-sm text-slate-500 mt-2">
              Add cron jobs to your Clawdbot configuration
            </p>
          </div>
        ) : (
          sortedJobs.map((job) => {
            const isLoading = actionLoading === job.id;
            const statusColor = job.state?.lastStatus === 'success' 
              ? 'text-emerald-400' 
              : job.state?.lastStatus === 'error' 
                ? 'text-red-400' 
                : 'text-slate-400';
            
            return (
              <div 
                key={job.id} 
                className={`
                  bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 
                  border transition-all duration-300
                  ${job.enabled 
                    ? 'border-slate-700/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5' 
                    : 'border-slate-800/50 opacity-60'
                  }
                `}
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Left side - Job info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${job.enabled ? 'bg-violet-500/20' : 'bg-slate-700/50'}`}>
                        <ClockIcon className={`w-5 h-5 ${job.enabled ? 'text-violet-400' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{job.name}</h3>
                        <p className="text-sm text-slate-400">ID: {job.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {/* Agent */}
                      {job.agentId && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <BotIcon className="w-4 h-4" />
                          <span>Agent: <span className="text-slate-300">{job.agentId}</span></span>
                        </div>
                      )}
                      
                      {/* Schedule */}
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-mono text-slate-300">{job.schedule.expr}</span>
                        <span className="text-xs text-slate-500">({job.schedule.tz})</span>
                      </div>
                      
                      {/* Next run */}
                      {job.state?.nextRunAtMs && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-emerald-400">→</span>
                          <span>Next: </span>
                          <span className="text-emerald-300">{formatRelativeTime(job.state.nextRunAtMs)}</span>
                          <span className="text-xs text-slate-500">({formatDate(job.state.nextRunAtMs)})</span>
                        </div>
                      )}
                      
                      {/* Last run */}
                      {job.state?.lastRunAtMs && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className={statusColor}>←</span>
                          <span>Last: </span>
                          <span className="text-slate-300">{formatDate(job.state.lastRunAtMs)}</span>
                          {job.state.lastStatus && (
                            <span className={`flex items-center gap-1 ${statusColor}`}>
                              {job.state.lastStatus === 'success' 
                                ? <CheckIcon className="w-3.5 h-3.5" />
                                : <XIcon className="w-3.5 h-3.5" />
                              }
                              {job.state.lastStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleJob(job.id, !job.enabled)}
                      disabled={isLoading}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${job.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600/30'
                        }
                        disabled:opacity-50
                      `}
                    >
                      {isLoading ? (
                        <LoaderIcon className="w-4 h-4" />
                      ) : (
                        job.enabled ? 'Enabled' : 'Disabled'
                      )}
                    </button>
                    
                    {job.enabled && (
                      <button
                        onClick={() => runJob(job.id)}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg text-sm font-medium transition-all border border-violet-500/30 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <LoaderIcon className="w-4 h-4" />
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            Run Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
