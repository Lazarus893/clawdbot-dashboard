import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dashboard } from './components/Dashboard';
import { CronJobs } from './components/CronJobs';
import { SystemStatus } from './components/SystemStatus';
import { AgentBindings } from './components/AgentBindings';
import { NotificationCenter } from './components/NotificationCenter';
import { CommandPalette } from './components/CommandPalette';
import { SessionDrawer } from './components/SessionDrawer';
import { LogsPanel } from './components/LogsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { UIProvider, useUI } from './hooks/useUI';
import {
  SquaresFour,
  Robot,
  Clock,
  HardDrives,
  List,
  X,
  Command,
} from '@phosphor-icons/react';

type Tab = 'dashboard' | 'agents' | 'cron' | 'system';

const pageVariants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, duration: 0.45, bounce: 0 },
  },
  exit: { opacity: 0, y: -4, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCommandPaletteOpen } = useUI();

  const tabs: { id: Tab; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'dashboard', label: 'Sessions', icon: <SquaresFour className="w-4 h-4" />, shortcut: '⌘1' },
    { id: 'agents', label: 'Agents', icon: <Robot className="w-4 h-4" />, shortcut: '⌘2' },
    { id: 'cron', label: 'Cron Jobs', icon: <Clock className="w-4 h-4" />, shortcut: '⌘3' },
    { id: 'system', label: 'System', icon: <HardDrives className="w-4 h-4" />, shortcut: '⌘4' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const tabMap: Record<string, Tab> = { '1': 'dashboard', '2': 'agents', '3': 'cron', '4': 'system' };
        const tab = tabMap[e.key];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#09090B] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-400" /> : <List className="w-5 h-5 text-zinc-400" />}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF4D00] flex items-center justify-center">
                  <Robot className="w-4.5 h-4.5 text-white" weight="bold" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-zinc-100 leading-tight">Clawdbot</h1>
                  <p className="text-[10px] text-zinc-600 leading-tight">Dashboard</p>
                </div>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${isActive
                        ? 'text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-zinc-800/60 border border-zinc-700/50 -z-10"
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                      />
                    )}
                    <kbd className="hidden xl:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-zinc-800/50 rounded">
                      {tab.shortcut}
                    </kbd>
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <NotificationCenter />
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
              >
                <Command className="w-3.5 h-3.5" />
                <span>K</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-zinc-800/50 bg-[#09090B] overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-4 py-2 space-y-0.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${isActive ? 'text-zinc-100 bg-zinc-800/60' : 'text-zinc-500 hover:text-zinc-300'}
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="ml-auto text-xs text-zinc-600">{tab.shortcut}</span>
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile tab bar (compact) */}
      <div className="lg:hidden sticky top-14 z-40 border-b border-zinc-800/50 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="flex px-4 py-2 gap-1.5 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/20'
                    : 'text-zinc-500 bg-zinc-800/30'
                  }
                `}
              >
                {tab.icon}
                <span className="sm:inline hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="py-6"
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'agents' && <AgentBindings />}
            {activeTab === 'cron' && <CronJobs />}
            {activeTab === 'system' && <SystemStatus />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] status-dot-active" />
              <span>Clawdbot Dashboard</span>
            </div>
            <span className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800/80 rounded text-[10px]">⌘K</kbd>
                Commands
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-800/80 rounded text-[10px]">⌘L</kbd>
                Logs
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global overlays */}
      <CommandPalette />
      <SessionDrawer />
      <LogsPanel />
    </div>
  );
}

function App() {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
}

export default App;
