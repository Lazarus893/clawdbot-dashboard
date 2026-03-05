import { useUI } from '../hooks/useUI';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  SquaresFour,
  Robot,
  Clock,
  HardDrives,
  Moon,
  Sun,
  Terminal,
  ArrowsClockwise,
} from '@phosphor-icons/react';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleTheme, isDarkMode, setLogsPanelOpen } = useUI();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = useMemo(() => [
    {
      id: 'sessions', title: 'Go to Sessions', subtitle: 'View active sessions',
      icon: <SquaresFour className="w-4 h-4" />, shortcut: '⌘1',
      action: () => { document.querySelector<HTMLElement>('button[data-tab="dashboard"]')?.click(); setCommandPaletteOpen(false); },
    },
    {
      id: 'agents', title: 'Go to Agents', subtitle: 'Manage agent bindings',
      icon: <Robot className="w-4 h-4" />, shortcut: '⌘2',
      action: () => { document.querySelector<HTMLElement>('button[data-tab="agents"]')?.click(); setCommandPaletteOpen(false); },
    },
    {
      id: 'cron', title: 'Go to Cron Jobs', subtitle: 'View scheduled tasks',
      icon: <Clock className="w-4 h-4" />, shortcut: '⌘3',
      action: () => { document.querySelector<HTMLElement>('button[data-tab="cron"]')?.click(); setCommandPaletteOpen(false); },
    },
    {
      id: 'system', title: 'Go to System', subtitle: 'Check gateway status',
      icon: <HardDrives className="w-4 h-4" />, shortcut: '⌘4',
      action: () => { document.querySelector<HTMLElement>('button[data-tab="system"]')?.click(); setCommandPaletteOpen(false); },
    },
    {
      id: 'theme', title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, shortcut: '⌘T',
      action: () => { toggleTheme(); setCommandPaletteOpen(false); },
    },
    {
      id: 'logs', title: 'Toggle Logs Panel', subtitle: 'Show/hide system logs',
      icon: <Terminal className="w-4 h-4" />, shortcut: '⌘L',
      action: () => { setLogsPanelOpen(true); setCommandPaletteOpen(false); },
    },
    {
      id: 'refresh', title: 'Refresh All Data', subtitle: 'Reload everything',
      icon: <ArrowsClockwise className="w-4 h-4" />, shortcut: '⌘R',
      action: () => window.location.reload(),
    },
  ], [isDarkMode, setCommandPaletteOpen, toggleTheme, setLogsPanelOpen]);

  const filtered = useMemo(() => {
    if (!search) return commands;
    const q = search.toLowerCase();
    return commands.filter(c => c.title.toLowerCase().includes(q) || c.subtitle?.toLowerCase().includes(q));
  }, [commands, search]);

  useEffect(() => setSelectedIndex(0), [search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(!isCommandPaletteOpen); }
      if (e.key === 'Escape' && isCommandPaletteOpen) setCommandPaletteOpen(false);
      if (isCommandPaletteOpen) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => (i + 1) % filtered.length); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length); }
        if (e.key === 'Enter' && filtered[selectedIndex]) filtered[selectedIndex].action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCommandPaletteOpen, setCommandPaletteOpen, filtered, selectedIndex]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="relative w-full max-w-lg mx-4 bg-[#0A0A0C] rounded-xl border border-zinc-800/60 shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50">
              <MagnifyingGlass className="w-5 h-5 text-zinc-600" />
              <input
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
                autoFocus
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-zinc-800/60 rounded">ESC</kbd>
            </div>

            {/* Commands */}
            <div className="max-h-[50vh] overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-zinc-600 text-sm">No commands found</div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`
                      w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors duration-100
                      ${i === selectedIndex ? 'bg-zinc-800/60 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/30'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === selectedIndex ? 'text-[#FF4D00] bg-[#FF4D00]/8' : 'text-zinc-600'}`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cmd.title}</p>
                      {cmd.subtitle && <p className="text-[11px] text-zinc-600">{cmd.subtitle}</p>}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-zinc-800/60 rounded">{cmd.shortcut}</kbd>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-800/50 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-zinc-800/60 rounded text-[10px]">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-zinc-800/60 rounded text-[10px]">↵</kbd> select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
