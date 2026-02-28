import { useUI } from '../hooks/useUI';
import { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlass, 
  SquaresFour, 
  Robot, 
  Clock, 
  HardDrives, 
  Moon, 
  Sun, 
  Terminal,
  ArrowsClockwise
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
  const [search, setMagnifyingGlass] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = useMemo(() => [
    {
      id: 'sessions',
      title: 'Go to Sessions',
      subtitle: 'View active sessions',
      icon: <SquaresFour className="w-5 h-5" />,
      shortcut: '⌘1',
      action: () => {
        document.querySelector('button[data-tab="dashboard"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'agents',
      title: 'Go to Agents',
      subtitle: 'Manage agent bindings',
      icon: <Robot className="w-5 h-5" />,
      shortcut: '⌘2',
      action: () => {
        document.querySelector('button[data-tab="agents"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'cron',
      title: 'Go to Cron Jobs',
      subtitle: 'View scheduled tasks',
      icon: <Clock className="w-5 h-5" />,
      shortcut: '⌘3',
      action: () => {
        document.querySelector('button[data-tab="cron"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'system',
      title: 'Go to System',
      subtitle: 'Check gateway status',
      icon: <HardDrives className="w-5 h-5" />,
      shortcut: '⌘4',
      action: () => {
        document.querySelector('button[data-tab="system"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'theme',
      title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
      shortcut: '⌘T',
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'logs',
      title: 'Toggle Logs Panel',
      subtitle: 'Show/hide system logs',
      icon: <Terminal className="w-5 h-5" />,
      shortcut: '⌘L',
      action: () => {
        setLogsPanelOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'refresh',
      title: 'Refresh All Data',
      subtitle: 'Reload sessions, jobs, and status',
      icon: <ArrowsClockwise className="w-5 h-5" />,
      shortcut: '⌘R',
      action: () => {
        window.location.reload();
      },
    },
  ], [isDarkMode, setCommandPaletteOpen, toggleTheme, setLogsPanelOpen]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(lower) || 
      c.subtitle?.toLowerCase().includes(lower)
    );
  }, [commands, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      // Escape to close
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
      // Navigation
      if (isCommandPaletteOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % filteredCommands.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen, filteredCommands, selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => setCommandPaletteOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 glass-card-strong rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/50 animate-scale-up overflow-hidden">
        {/* MagnifyingGlass Input */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50">
          <MagnifyingGlass className="w-6 h-6 text-zinc-500" />
          <input
            type="text"
            placeholder="MagnifyingGlass commands..."
            value={search}
            onChange={(e) => setMagnifyingGlass(e.target.value)}
            className="flex-1 bg-transparent text-lg text-white placeholder-zinc-500 outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs font-mono text-zinc-500 bg-zinc-800/50 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <MagnifyingGlass className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No commands found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={command.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                    ${index === selectedIndex 
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30' 
                      : 'hover:bg-zinc-800/50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                    ${index === selectedIndex ? 'text-orange-400' : 'text-zinc-500'}
                  `}>
                    {command.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-zinc-300'}`}>
                      {command.title}
                    </p>
                    {command.subtitle && (
                      <p className="text-sm text-zinc-500">{command.subtitle}</p>
                    )}
                  </div>
                  {command.shortcut && (
                    <kbd className="px-2 py-1 text-xs font-mono text-zinc-500 bg-zinc-800/50 rounded-lg">
                      {command.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 p-3 border-t border-zinc-800/50 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">⌘K</kbd>
            <span>to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
