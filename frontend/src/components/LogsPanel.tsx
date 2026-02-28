import { useUI } from '../hooks/useUI';
import { Terminal, X, Download, Pause, Play } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';

const levelColors = {
  info: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  warn: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
  error: 'text-red-400 border-red-500/20 bg-red-500/10',
  debug: 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10',
};

const levelIcons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  debug: '🐛',
};

export function LogsPanel() {
  const { isLogsPanelOpen, setLogsPanelOpen, logs, addLog } = useUI();
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  // Simulate incoming logs
  useEffect(() => {
    if (!isLogsPanelOpen) return;
    
    const interval = setInterval(() => {
      if (!isPaused && Math.random() > 0.7) {
        const sources = ['gateway', 'api', 'websocket', 'scheduler'];
        const messages = [
          'Request processed successfully',
          'WebSocket connection established',
          'Session data refreshed',
          'Cron job triggered',
          'API latency: 45ms',
          'Token usage updated',
        ];
        const levels: ('info' | 'warn' | 'error' | 'debug')[] = ['info', 'info', 'info', 'debug', 'warn', 'error'];
        
        addLog({
          level: levels[Math.floor(Math.random() * levels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLogsPanelOpen, isPaused, addLog]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(l => l.level === filter);

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

  if (!isLogsPanelOpen) {
    return (
      <button
        onClick={() => setLogsPanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 glass-card-strong rounded-xl border border-orange-500/30 shadow-lg shadow-orange-500/20 hover:scale-110 transition-all duration-300 group"
      >
        <Terminal className="w-5 h-5 text-orange-400" />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {logs.length > 99 ? '99+' : logs.length}
          </span>
        )}
        <span className="absolute right-full mr-2 px-2 py-1 text-xs text-zinc-400 bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Logs (⌘L)
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 glass-card-strong border-t border-zinc-800/50 z-50 animate-slide-in-up flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">System Logs</h3>
          <span className="text-xs text-zinc-500">({filteredLogs.length} entries)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg">
            {(['all', 'info', 'warn', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-all capitalize
                  ${filter === f 
                    ? 'bg-zinc-700 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-zinc-700/50 mx-1" />

          {/* Actions */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg transition-colors ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-zinc-800/50 text-zinc-400'}`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 transition-colors"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setLogsPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No logs yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.slice().reverse().map((log) => (
              <div
                key={log.id}
                className={`
                  flex items-start gap-3 p-2 rounded-lg border transition-all animate-fadeIn
                  ${levelColors[log.level]}
                `}
              >
                <span className="shrink-0">{levelIcons[log.level]}</span>
                <span className="text-xs text-zinc-500 shrink-0 w-20">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 shrink-0">
                  {log.source}
                </span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
