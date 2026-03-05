import { useAgentsOverview } from '../hooks/useOpenClawAPI';
import { motion } from 'framer-motion';
import {
  Robot,
  Hash,
  Cpu,
  Users,
  Link,
  ArrowsClockwise,
  Brain,
  ArrowsCounterClockwise,
} from '@phosphor-icons/react';
import { ClaudeCodeSwitcher } from './ClaudeCodeSwitcher';

const agentAccents: Record<string, string> = {
  main: 'border-violet-500/15',
  slack: 'border-emerald-500/15',
  coding: 'border-amber-500/15',
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.4, bounce: 0 } },
};

export function AgentBindings() {
  const { agents, bindings, loading, error, isRefreshing, refetch } = useAgentsOverview();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton skeleton-heading w-36" />
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
                  <div className="skeleton skeleton-heading w-8" />
                  <div className="skeleton skeleton-text w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              {/* Agent header */}
              <div className="p-4 border-b border-zinc-800/40">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <div className="skeleton skeleton-text w-20" />
                    <div className="skeleton skeleton-text w-14" style={{ height: '0.5rem' }} />
                  </div>
                </div>
              </div>
              {/* Agent details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="skeleton skeleton-circle w-3.5 h-3.5" />
                  <div className="skeleton skeleton-text w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton skeleton-circle w-3.5 h-3.5" />
                  <div className="skeleton skeleton-text w-24" />
                </div>
                <div className="pt-3 border-t border-zinc-800/40 space-y-2">
                  <div className="skeleton skeleton-text w-28" style={{ height: '0.5rem' }} />
                  <div className="flex gap-1.5">
                    <div className="skeleton h-6 w-16 rounded" />
                    <div className="skeleton h-6 w-20 rounded" />
                  </div>
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
          <ArrowsClockwise className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Agents', value: agents.length, icon: Robot },
    { label: 'Bindings', value: bindings.length, icon: Hash },
    { label: 'Providers', value: agents.filter(a => a.model).map(a => a.model?.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i).length, icon: Cpu },
    { label: 'With Subagents', value: agents.filter(a => a.subagents?.allowAgents?.length).length, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Agent Bindings</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{agents.length} agents, {bindings.length} bindings</p>
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

      {/* Claude Code Provider Switcher */}
      <ClaudeCodeSwitcher />

      {/* Agent cards */}
      <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            variants={itemVariants}
            className={`card ${agentAccents[agent.id] || ''} hover:border-[#FF4D00]/15 transition-colors`}
          >
            {/* Agent header */}
            <div className="p-4 border-b border-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800/60 flex items-center justify-center">
                  <Robot className="w-4.5 h-4.5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-zinc-200">{agent.name || agent.id}</h3>
                  <p className="text-[11px] text-zinc-600">ID: {agent.id}</p>
                </div>
              </div>
            </div>

            {/* Agent details */}
            <div className="p-4 space-y-3">
              {agent.model && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="text-zinc-400">{agent.model}</span>
                </div>
              )}
              {agent.thinkingLevel && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Brain className="w-3.5 h-3.5" />
                  <span className="text-zinc-400">Thinking: {agent.thinkingLevel}</span>
                </div>
              )}
              {agent.maxTurns && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ArrowsCounterClockwise className="w-3.5 h-3.5" />
                  <span className="text-zinc-400">Max Turns: {agent.maxTurns}</span>
                </div>
              )}

              {/* Subagents */}
              {agent.subagents?.allowAgents && agent.subagents.allowAgents.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/40">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Allowed Subagents
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.subagents.allowAgents.map((subId) => (
                      <span key={subId} className="px-2 py-0.5 rounded bg-zinc-800/60 text-[11px] text-zinc-400 border border-zinc-800">
                        {subId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bindings */}
              {agent.bindings && agent.bindings.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/40">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                    <Link className="w-3 h-3" /> Channel Bindings
                  </p>
                  <div className="space-y-1">
                    {agent.bindings.map((binding, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                        <Hash className="w-3 h-3 text-zinc-600" />
                        <span className="text-zinc-400 font-mono text-[11px]">{binding.pattern || binding.channel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* All bindings table */}
      {bindings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Link className="w-4 h-4 text-zinc-500" />
            All Channel Bindings
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Channel / Pattern</th>
                  <th>Agent</th>
                </tr>
              </thead>
              <tbody>
                {bindings.map((binding, idx) => (
                  <tr key={idx}>
                    <td>
                      <code className="text-xs text-zinc-400 font-mono bg-zinc-800/40 px-2 py-0.5 rounded">{binding.pattern || binding.channel}</code>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/40 border border-zinc-800 text-xs text-zinc-400">
                        <Robot className="w-3 h-3" />
                        {binding.agent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {agents.length === 0 && (
        <div className="text-center py-16">
          <Robot className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No agents configured</p>
          <p className="text-sm text-zinc-600 mt-1">Add agents to your configuration</p>
        </div>
      )}
    </div>
  );
}
