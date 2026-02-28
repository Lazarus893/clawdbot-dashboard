import { useUI } from '../hooks/useUI';
import { useSessions } from '../hooks/useOpenClawAPI';
import { useEffect, useState } from 'react';
import {
  X,
  ChatCircle as MessageSquare,
  Cpu,
  Coins,
  Copy,
  Terminal,
  Pulse,
  Lightning,
  Clock,
  PaperPlaneTilt,
  SlackLogo,
  ChatCircleDots,
  User,
  Robot,
  Wrench
} from '@phosphor-icons/react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const session = sessions.find(s => s.key === selectedSession);

  // Mock fetching session details
  useEffect(() => {
    if (selectedSession) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMessages([
          { role: 'system', content: 'Session started', timestamp: Date.now() - 3600000 },
          { role: 'user', content: 'Hello, can you help me with something?', timestamp: Date.now() - 3500000 },
          { role: 'assistant', content: 'Of course! I\'d be happy to help. What do you need assistance with?', timestamp: Date.now() - 3400000 },
          { role: 'user', content: 'I want to analyze my session data', timestamp: Date.now() - 1800000 },
          { role: 'assistant', content: 'I can help you analyze your session data. I see you have active sessions with various models including GPT-4 and Claude. Would you like me to show you token usage statistics?', timestamp: Date.now() - 1700000 },
        ]);
        setLoading(false);
      }, 500);
    }
  }, [selectedSession]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSession) {
        setSelectedSession(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSession, setSelectedSession]);

  if (!selectedSession || !session) return null;

  const color = session.key.includes('telegram') ? 'bg-blue-500' :
                session.key.includes('slack') ? 'bg-purple-500' :
                session.key.includes('cron') ? 'bg-amber-500' :
                'bg-orange-500';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={() => setSelectedSession(null)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl glass-card-strong border-l border-zinc-800/50 z-50 animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl shadow-lg`}>
              {
              session.key.includes('telegram') ? <PaperPlaneTilt weight="duotone" className="w-5 h-5" /> :
               session.key.includes('slack') ? <SlackLogo weight="duotone" className="w-5 h-5" /> :
               session.key.includes('cron') ? <Clock weight="duotone" className="w-5 h-5" /> : <ChatCircleDots weight="duotone" className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-semibold text-white truncate max-w-[200px]">{session.key}</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800/50">{session.kind}</span>
                <span>•</span>
                <span>{formatTimeAgo(session.ageMs)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedSession(null)}
            className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-zinc-800/50">
          <div className="glass-card rounded-xl p-3 text-center">
            <Cpu className="w-5 h-5 mx-auto mb-2 text-orange-400" />
            <p className="text-lg font-bold text-white">{session.model?.split('/').pop() || 'N/A'}</p>
            <p className="text-xs text-zinc-500">Model</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Coins className="w-5 h-5 mx-auto mb-2 text-amber-400" />
            <p className="text-lg font-bold text-white">{formatTokens(session.totalTokens)}</p>
            <p className="text-xs text-zinc-500">Total Tokens</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Pulse className="w-5 h-5 mx-auto mb-2 text-green-400" />
            <p className="text-lg font-bold text-white">Active</p>
            <p className="text-xs text-zinc-500">Status</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800/50">
          <button className="flex-1 px-4 py-3 text-sm font-medium text-orange-400 border-b-2 border-orange-400 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </button>
          <button className="flex-1 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4" />
            Logs
          </button>
          <button className="flex-1 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2">
            <Lightning className="w-4 h-4" />
            Tools
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-zinc-800/50 rounded w-20"></div>
                  <div className="h-16 bg-zinc-800/30 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0
                    ${msg.role === 'user' ? 'bg-orange-500' : 
                      msg.role === 'assistant' ? 'bg-zinc-700' : 'bg-zinc-800'}
                  `}>
                    {msg.role === 'user' ? <User weight="duotone" className="w-4 h-4" /> : msg.role === 'assistant' ? <Robot weight="duotone" className="w-4 h-4" /> : <Wrench weight="duotone" className="w-4 h-4" />}
                  </div>
                  <div className={`
                    max-w-[80%] p-3 rounded-2xl text-sm
                    ${msg.role === 'user' 
                      ? 'bg-orange-500/20 text-orange-100 rounded-br-md' 
                      : msg.role === 'assistant'
                      ? 'bg-zinc-800/80 text-zinc-200 rounded-bl-md'
                      : 'bg-zinc-800/50 text-zinc-500 text-xs italic rounded-bl-md'
                    }
                  `}>
                    {msg.content}
                    {msg.timestamp && (
                      <p className="text-[10px] opacity-50 mt-2">
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
        <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Copy className="w-3.5 h-3.5" />
            <span>Session Key copied</span>
          </div>
          <button 
            onClick={() => setSelectedSession(null)}
            className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
