import { useSessions } from '../hooks/useClawdbotAPI';

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

// Icon components
function SessionIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CpuIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  );
}

function TokenIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

function CronIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M16 16l2 2" />
    </svg>
  );
}

export function Dashboard() {
  const { sessions, loading, error, isRefreshing, refetch } = useSessions();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700/50 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
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

  // Separate main and cron sessions
  const mainSessions = sessions.filter(s => !s.key.includes(':cron:'));
  const cronSessions = sessions.filter(s => s.key.includes(':cron:'));

  // Calculate total tokens
  const totalInputTokens = sessions.reduce((acc, s) => acc + (s.inputTokens || 0), 0);
  const totalOutputTokens = sessions.reduce((acc, s) => acc + (s.outputTokens || 0), 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Active Sessions
          </h2>
          <p className="text-slate-400 mt-1">
            Real-time session monitoring
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-xl p-4 border border-violet-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <SessionIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
              <p className="text-xs text-violet-300">Total Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl p-4 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <SessionIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mainSessions.length}</p>
              <p className="text-xs text-emerald-300">Main Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <CronIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{cronSessions.length}</p>
              <p className="text-xs text-amber-300">Cron Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <TokenIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatTokens(totalTokens)}</p>
              <p className="text-xs text-cyan-300">Total Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sessions */}
      {mainSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SessionIcon className="w-5 h-5 text-emerald-400" />
            Main Sessions
          </h3>
          <div className="grid gap-4">
            {mainSessions.map((session) => (
              <div 
                key={session.key} 
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{session.key}</h4>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                        {session.kind}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {session.model && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <CpuIcon className="w-4 h-4" />
                          <span className="text-slate-300">{session.model}</span>
                        </div>
                      )}
                      
                      {session.totalTokens && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <TokenIcon className="w-4 h-4" />
                          <span className="text-slate-300">
                            {formatTokens(session.totalTokens)} tokens
                          </span>
                          <span className="text-slate-500 text-xs">
                            (↓{formatTokens(session.inputTokens)} ↑{formatTokens(session.outputTokens)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Active
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {formatTimeAgo(session.ageMs)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cron Sessions */}
      {cronSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CronIcon className="w-5 h-5 text-amber-400" />
            Cron Job Sessions
            <span className="text-sm font-normal text-slate-400">
              ({cronSessions.length} active)
            </span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cronSessions.slice(0, 6).map((session) => (
              <div 
                key={session.key} 
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30 hover:border-amber-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-white truncate">
                      {session.key.split(':').pop()}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <CpuIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{session.model}</span>
                    </div>
                    {session.totalTokens && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <TokenIcon className="w-3.5 h-3.5" />
                        <span>{formatTokens(session.totalTokens)}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                    {formatTimeAgo(session.ageMs)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {cronSessions.length > 6 && (
            <p className="text-sm text-slate-500 text-center">
              ... and {cronSessions.length - 6} more cron sessions
            </p>
          )}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-16">
          <SessionIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No active sessions</p>
          <p className="text-sm text-slate-500 mt-2">
            Sessions will appear here when Clawdbot is in use
          </p>
        </div>
      )}
    </div>
  );
}
