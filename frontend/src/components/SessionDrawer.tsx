import { useUI } from '../hooks/useUI';
import { useSessions, useSessionMessages } from '../hooks/useOpenClawAPI';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cpu,
  Coins,
  Terminal,
  Pulse,
  Lightning,
  Clock,
  PaperPlaneTilt,
  SlackLogo,
  ChatCircleDots,
  User,
  Robot,
  Wrench,
  FileText,
  ChatCircle,
} from '@phosphor-icons/react';

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
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

export function SessionDrawer() {
  const { selectedSession, setSelectedSession } = useUI();
  const { sessions } = useSessions();
  const { messages, loading, error } = useSessionMessages(selectedSession);
  const session = sessions.find(s => s.key === selectedSession);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSession) setSelectedSession(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedSession, setSelectedSession]);

  const isOpen = !!(selectedSession && session);

  const getSessionIcon = () => {
    if (session?.key.includes('telegram')) return PaperPlaneTilt;
    if (session?.key.includes('slack')) return SlackLogo;
    if (session?.key.includes('cron')) return Clock;
    return ChatCircleDots;
  };
  const Icon = getSessionIcon();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSelectedSession(null)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#09090B] border-l border-zinc-800/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 flex items-center justify-center">
                  <Icon weight="duotone" className="w-4.5 h-4.5 text-[#FF4D00]" />
                </div>
                <div>
                  <h2 className="font-medium text-sm text-zinc-200 truncate max-w-[240px]">{session.key}</h2>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/60">{session.kind}</span>
                    <span>{formatTimeAgo(session.ageMs)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 p-4 border-b border-zinc-800/50">
              {[
                { icon: Cpu, label: 'Model', value: session.model?.split('/').pop() || 'N/A', color: 'text-[#FF4D00]' },
                { icon: Coins, label: 'Tokens', value: formatTokens(session.totalTokens), color: 'text-amber-400' },
                { icon: Pulse, label: 'Status', value: 'Active', color: 'text-emerald-400' },
              ].map((stat) => (
                <div key={stat.label} className="card p-3 text-center">
                  <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
                  <p className="text-sm font-semibold text-zinc-200">{stat.value}</p>
                  <p className="text-[10px] text-zinc-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800/50">
              <button className="flex-1 px-4 py-2.5 text-xs font-medium text-[#FF4D00] border-b-2 border-[#FF4D00] flex items-center justify-center gap-1.5">
                <ChatCircle className="w-3.5 h-3.5" /> Messages
              </button>
              <button className="flex-1 px-4 py-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-400 flex items-center justify-center gap-1.5 transition-colors">
                <Terminal className="w-3.5 h-3.5" /> Logs
              </button>
              <button className="flex-1 px-4 py-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-400 flex items-center justify-center gap-1.5 transition-colors">
                <Lightning className="w-3.5 h-3.5" /> Tools
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 bg-zinc-800/40 rounded w-16" />
                      <div className="h-12 bg-zinc-800/30 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : error || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                  <FileText className="w-10 h-10 opacity-30" />
                  <p className="text-xs">{error ? 'Failed to load messages' : 'No messages available'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`
                        w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs
                        ${msg.role === 'user' ? 'bg-[#FF4D00]/15 text-[#FF4D00]' :
                          msg.role === 'assistant' ? 'bg-zinc-800 text-zinc-400' :
                          'bg-zinc-800/50 text-zinc-500'}
                      `}>
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> :
                         msg.role === 'assistant' ? <Robot className="w-3.5 h-3.5" /> :
                         <Wrench className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`
                        max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed
                        ${msg.role === 'user'
                          ? 'bg-[#FF4D00]/10 text-zinc-200 border border-[#FF4D00]/10 rounded-br-sm'
                          : msg.role === 'assistant'
                          ? 'bg-zinc-800/60 text-zinc-300 border border-zinc-800 rounded-bl-sm'
                          : 'bg-zinc-800/30 text-zinc-500 italic rounded-bl-sm'}
                      `}>
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                        {msg.timestamp && (
                          <p className="text-[10px] text-zinc-700 mt-1.5 tabular-nums">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-800/50 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="btn btn-ghost text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
