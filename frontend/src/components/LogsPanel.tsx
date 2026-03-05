import { useUI } from '../hooks/useUI';
import {
  Terminal,
  X,
  Download,
  Pause,
  Play,
  WifiHigh,
  WifiSlash,
  Info,
  Warning,
  XCircle,
  Bug,
} from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WS_URL = 'ws://localhost:3001/ws/logs';
const API_BASE = 'http://localhost:3001/api';

const levelConfig = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500/6 border-blue-500/10', icon: Info },
  warn: { color: 'text-amber-400', bg: 'bg-amber-500/6 border-amber-500/10', icon: Warning },
  error: { color: 'text-red-400', bg: 'bg-red-500/6 border-red-500/10', icon: XCircle },
  debug: { color: 'text-zinc-500', bg: 'bg-zinc-500/6 border-zinc-500/10', icon: Bug },
};

export function LogsPanel() {
  const { isLogsPanelOpen, setLogsPanelOpen, logs, addLog } = useUI();
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [wsConnected, setWsConnected] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number>(undefined);

  useEffect(() => {
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  useEffect(() => {
    if (!isLogsPanelOpen) return;

    fetch(`${API_BASE}/logs/recent`)
      .then(res => res.json())
      .then(json => {
        (json.logs || []).forEach((entry: any) => {
          addLog({ level: entry.level, message: entry.message, source: entry.source });
        });
      })
      .catch(() => {});

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => { setWsConnected(false); reconnectTimer.current = window.setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'log' && msg.data) addLog({ level: msg.data.level, message: msg.data.message, source: msg.data.source });
        } catch {}
      };
    }
    connect();
    return () => { clearTimeout(reconnectTimer.current); wsRef.current?.close(); wsRef.current = null; };
  }, [isLogsPanelOpen, addLog]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const handleDownload = () => {
    const content = logs.map(l =>
      `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clawdbot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isLogsPanelOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={() => setLogsPanelOpen(true)}
            className="fixed bottom-5 right-5 z-40 p-2.5 rounded-lg bg-[#0A0A0C] border border-zinc-800 shadow-lg hover:border-[#FF4D00]/20 transition-colors group"
          >
            <Terminal className="w-4 h-4 text-zinc-500 group-hover:text-[#FF4D00] transition-colors" />
            {logs.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF4D00] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {logs.length > 99 ? '99' : logs.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isLogsPanelOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-72 bg-[#09090B] border-t border-zinc-800/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <h3 className="font-medium text-sm text-zinc-200">Logs</h3>
                <span className="text-[11px] text-zinc-600 tabular-nums">({filteredLogs.length})</span>
                <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${wsConnected ? 'bg-emerald-500/8 text-emerald-400' : 'bg-red-500/8 text-red-400'}`}>
                  {wsConnected ? <WifiHigh className="w-2.5 h-2.5" /> : <WifiSlash className="w-2.5 h-2.5" />}
                  {wsConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 p-0.5 bg-zinc-800/40 rounded-lg mr-1">
                  {(['all', 'info', 'warn', 'error'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize ${filter === f ? 'bg-zinc-700/80 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsPaused(!isPaused)} className={`p-1.5 rounded-lg transition-colors ${isPaused ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'}`}>
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleDownload} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setLogsPanelOpen(false)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-700">
                  <div className="text-center">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-[11px]">No logs yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLogs.slice().reverse().map((log) => {
                    const config = levelConfig[log.level];
                    const LevelIcon = config.icon;
                    return (
                      <div key={log.id} className={`flex items-start gap-2.5 p-1.5 rounded border ${config.bg}`}>
                        <LevelIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${config.color}`} />
                        <span className="text-zinc-600 shrink-0 w-16 tabular-nums">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/50 shrink-0">{log.source}</span>
                        <span className="flex-1 break-all text-zinc-400">{log.message}</span>
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
