import { useSystemStatus } from '../hooks/useClawdbotAPI';

// Icon components
function ServerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function ActivityIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function HashIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function XCircleIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

export function SystemStatus() {
  const { status, loading, error, isRefreshing, refetch } = useSystemStatus();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700/50 rounded w-1/4"></div>
          <div className="h-48 bg-slate-800/50 rounded-xl"></div>
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

  if (!status) return null;

  const isRunning = status.gateway.running;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            System Status
          </h2>
          <p className="text-slate-400 mt-1">
            Clawdbot infrastructure health
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

      {/* Main Status Card */}
      <div className={`
        relative overflow-hidden rounded-2xl p-8
        ${isRunning 
          ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-slate-900/80 border border-emerald-500/30' 
          : 'bg-gradient-to-br from-red-500/20 via-red-600/10 to-slate-900/80 border border-red-500/30'
        }
      `}>
        {/* Background decoration */}
        <div className={`
          absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20
          ${isRunning ? 'bg-emerald-500' : 'bg-red-500'}
        `} />
        
        <div className="relative flex items-center gap-6">
          <div className={`
            p-4 rounded-2xl
            ${isRunning ? 'bg-emerald-500/20' : 'bg-red-500/20'}
          `}>
            <ServerIcon className={`w-12 h-12 ${isRunning ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">Gateway</h3>
              {isRunning ? (
                <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
              ) : (
                <XCircleIcon className="w-7 h-7 text-red-400" />
              )}
            </div>
            <p className={`text-lg ${isRunning ? 'text-emerald-300' : 'text-red-300'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </p>
          </div>
          
          {/* Pulse indicator */}
          {isRunning && (
            <div className="relative">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      {isRunning && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* PID */}
          {status.gateway.pid && (
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <HashIcon className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm text-slate-400 uppercase tracking-wider">Process ID</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{status.gateway.pid}</p>
            </div>
          )}
          
          {/* Uptime */}
          {status.gateway.uptime && (
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm text-slate-400 uppercase tracking-wider">Uptime</span>
              </div>
              <p className="text-3xl font-bold text-white">{status.gateway.uptime}</p>
            </div>
          )}
          
          {/* Status */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm text-slate-400 uppercase tracking-wider">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-lg font-medium text-emerald-300">Healthy</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-slate-500">•</span>
              <code className="bg-slate-700/50 px-2 py-1 rounded text-xs">clawdbot gateway status</code>
              <span className="text-slate-500">— Check status</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-slate-500">•</span>
              <code className="bg-slate-700/50 px-2 py-1 rounded text-xs">clawdbot gateway restart</code>
              <span className="text-slate-500">— Restart gateway</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-slate-500">•</span>
              <code className="bg-slate-700/50 px-2 py-1 rounded text-xs">clawdbot sessions list</code>
              <span className="text-slate-500">— List sessions</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Configuration
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Config Directory</span>
              <code className="text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded text-xs">~/.clawdbot</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Agents Config</span>
              <code className="text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded text-xs">agents.yaml</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dashboard API</span>
              <code className="text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded text-xs">localhost:3001</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
