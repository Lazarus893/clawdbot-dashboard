import { useAgentsOverview } from '../hooks/useClawdbotAPI';

// Agent color mapping
const agentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  main: { 
    bg: 'from-violet-500/20 to-purple-600/20', 
    border: 'border-violet-500/50', 
    text: 'text-violet-300',
    glow: 'shadow-violet-500/20'
  },
  slack: { 
    bg: 'from-emerald-500/20 to-green-600/20', 
    border: 'border-emerald-500/50', 
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20'
  },
  coding: { 
    bg: 'from-amber-500/20 to-orange-600/20', 
    border: 'border-amber-500/50', 
    text: 'text-amber-300',
    glow: 'shadow-amber-500/20'
  },
  default: { 
    bg: 'from-slate-500/20 to-gray-600/20', 
    border: 'border-slate-500/50', 
    text: 'text-slate-300',
    glow: 'shadow-slate-500/20'
  },
};

function getAgentColor(agentId: string) {
  return agentColors[agentId] || agentColors.default;
}

// Icon components
function BotIcon({ className = "w-6 h-6" }: { className?: string }) {
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

function ChannelIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" />
    </svg>
  );
}

function LinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CpuIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  );
}

function UsersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function AgentBindings() {
  const { agents, bindings, loading, error, isRefreshing, refetch } = useAgentsOverview();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700/50 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-800/50 rounded-xl"></div>
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

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Agent Bindings
          </h2>
          <p className="text-slate-400 mt-1">
            {agents.length} agents • {bindings.length} channel bindings
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
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <BotIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{agents.length}</p>
              <p className="text-xs text-slate-400">Total Agents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <ChannelIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{bindings.length}</p>
              <p className="text-xs text-slate-400">Bindings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <CpuIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {agents.filter(a => a.model).map(a => a.model?.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i).length}
              </p>
              <p className="text-xs text-slate-400">Providers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <UsersIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {agents.filter(a => a.subagents?.allowAgents?.length).length}
              </p>
              <p className="text-xs text-slate-400">With Subagents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const color = getAgentColor(agent.id);
          return (
            <div 
              key={agent.id}
              className={`
                relative overflow-hidden rounded-xl border ${color.border}
                bg-gradient-to-br ${color.bg} backdrop-blur-sm
                shadow-lg ${color.glow}
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
              `}
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/10`}>
                    <BotIcon className={`w-6 h-6 ${color.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {agent.name || agent.id}
                    </h3>
                    <p className="text-sm text-slate-400">ID: {agent.id}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Model */}
                {agent.model && (
                  <div className="flex items-center gap-2 text-sm">
                    <CpuIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{agent.model}</span>
                  </div>
                )}

                {/* Thinking Level */}
                {agent.thinkingLevel && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">💭</span>
                    <span className="text-slate-300">Thinking: {agent.thinkingLevel}</span>
                  </div>
                )}

                {/* Max Turns */}
                {agent.maxTurns && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">🔄</span>
                    <span className="text-slate-300">Max Turns: {agent.maxTurns}</span>
                  </div>
                )}

                {/* Subagents */}
                {agent.subagents?.allowAgents && agent.subagents.allowAgents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <UsersIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Allowed Subagents
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.subagents.allowAgents.map((subId) => {
                        const subColor = getAgentColor(subId);
                        return (
                          <span 
                            key={subId}
                            className={`px-2 py-1 rounded-md text-xs font-medium ${subColor.text} bg-white/10`}
                          >
                            {subId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bindings */}
                {agent.bindings && agent.bindings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Channel Bindings
                      </span>
                    </div>
                    <div className="space-y-2">
                      {agent.bindings.map((binding, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 text-sm"
                        >
                          <ChannelIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 font-mono text-xs">
                            {binding.pattern || binding.channel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Bindings Table */}
      {bindings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            All Channel Bindings
          </h3>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Channel / Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Agent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {bindings.map((binding, idx) => {
                  const color = getAgentColor(binding.agent);
                  return (
                    <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-sm text-slate-300 font-mono bg-slate-900/50 px-2 py-1 rounded">
                          {binding.pattern || binding.channel}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${color.bg} ${color.border} border`}>
                          <BotIcon className={`w-4 h-4 ${color.text}`} />
                          <span className={color.text}>{binding.agent}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {agents.length === 0 && (
        <div className="text-center py-12">
          <BotIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No agents configured</p>
          <p className="text-sm text-slate-500 mt-2">
            Add agents to your Clawdbot configuration to see them here
          </p>
        </div>
      )}
    </div>
  );
}
