import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CronJobs } from './components/CronJobs';
import { SystemStatus } from './components/SystemStatus';
import { AgentBindings } from './components/AgentBindings';
import { NotificationCenter } from './components/NotificationCenter';
import { CommandPalette } from './components/CommandPalette';
import { SessionDrawer } from './components/SessionDrawer';
import { LogsPanel } from './components/LogsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { UIProvider } from './hooks/useUI';
import {
  SquaresFour, 
  Robot, 
  Clock, 
  HardDrives, 
  Sparkle,
  CaretRight,
  List,
  X,
  Keyboard
} from '@phosphor-icons/react';

type Tab = 'dashboard' | 'agents' | 'cron' | 'system';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string; shortcut: string }[] = [
    { id: 'dashboard', label: 'Sessions', icon: <SquaresFour className="w-5 h-5" />, description: 'Active sessions', shortcut: '⌘1' },
    { id: 'agents', label: 'Agents', icon: <Robot className="w-5 h-5" />, description: 'Agent bindings', shortcut: '⌘2' },
    { id: 'cron', label: 'Cron Jobs', icon: <Clock className="w-5 h-5" />, description: 'Scheduled tasks', shortcut: '⌘3' },
    { id: 'system', label: 'System', icon: <HardDrives className="w-5 h-5" />, description: 'Gateway status', shortcut: '⌘4' },
  ];

  // Keyboard shortcuts
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('dashboard');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('agents');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('cron');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('system');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="gradient-mesh-bg" />
      
      {/* Dynamic glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary orange glow - top left */}
        <div 
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px] animate-breathe"
          style={{ animationDelay: '0s' }}
        />
        {/* Amber glow - bottom right */}
        <div 
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[150px] animate-breathe"
          style={{ animationDelay: '2s' }}
        />
        {/* Secondary orange - center right */}
        <div 
          className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/6 blur-[100px] animate-breathe"
          style={{ animationDelay: '4s' }}
        />
        {/* Yellow accent - bottom left */}
        <div 
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-yellow-500/5 blur-[80px] animate-breathe"
          style={{ animationDelay: '1s' }}
        />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`particle animate-float-particle ${
              i % 3 === 0 ? 'particle-orange' : i % 3 === 1 ? 'particle-amber' : 'particle-yellow'
            } ${i % 4 === 0 ? 'particle-lg' : i % 2 === 0 ? 'particle-md' : 'particle-sm'}`}
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${5 + (i * 11) % 90}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${6 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header with enhanced glassmorphism */}
      <header className="sticky top-0 z-50 glass-card-strong border-b border-zinc-800/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileListOpen(!mobileListOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                {mobileListOpen ? (
                  <X className="w-5 h-5 text-zinc-400" />
                ) : (
                  <List className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {/* Logo with animated glow */}
              <div className="relative group cursor-pointer">
                <div className="p-3 gradient-animated rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-500 group-hover:shadow-orange-500/50 group-hover:scale-110 group-hover:rotate-3">
                  <Robot className="w-6 h-6 text-white" />
                </div>
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-xl opacity-30 group-hover:opacity-60 transition-all duration-500 animate-breathe" />
                {/* Pulse ring */}
                <div className="absolute inset-[-4px] rounded-xl border-2 border-orange-500/0 group-hover:border-orange-500/40 transition-all duration-300 group-hover:animate-border-glow" />
              </div>
              
              <div>
                <h1 className="text-lg sm:text-xl font-bold gradient-text-animated flex items-center gap-2">
                  Clawdbot Dashboard
                  <Sparkle className="w-4 h-4 text-amber-400 animate-pulse hidden sm:block" />
                </h1>
                <p className="text-[10px] sm:text-xs text-zinc-500">Monitoring & Management</p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
              
              {/* Command palette hint */}
              <button
                onClick={() => {}}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs text-zinc-500 hover:text-zinc-300 hover:border-orange-500/30 transition-all"
              >
                <Keyboard className="w-4 h-4" />
                <span>⌘K</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation with enhanced glass effect */}
      <nav className="sticky top-[73px] z-40 glass-card border-b border-zinc-800/20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop navigation */}
          <div className="hidden lg:flex gap-2 py-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;

              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setHoveredTab(null);
                  }}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-200 ease-out whitespace-nowrap
                    ${isActive
                      ? 'gradient-animated text-white shadow-lg shadow-orange-500/25 border border-orange-500/40 scale-105'
                      : 'text-zinc-400 hover:text-zinc-200 glass-card hover:border-orange-500/30 hover:scale-102'
                    }
                    ${isHovered && !isActive ? 'translate-x-0.5' : ''}
                  `}
                >
                  <span className={`transition-transform duration-200 ${isHovered ? 'scale-110' : ''} ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>

                  {/* Active indicator with glow */}
                  {isActive && (
                    <>
                      <CaretRight className="w-4 h-4 text-white/80 ml-0.5 animate-slide-in-left" />
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/30 to-amber-500/30 blur-md -z-10 animate-pulse-glow" />
                    </>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && !isActive && (
                    <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 glass-card-strong text-zinc-300 text-xs rounded-lg whitespace-nowrap border border-zinc-700/50 shadow-lg z-50">
                      {tab.description}
                    </span>
                  )}

                  {/* Keyboard shortcut */}
                  <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800/50 rounded ml-1">
                    {tab.shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>

          {/* Mobile navigation */}
          {mobileListOpen && (
            <div className="lg:hidden py-3 space-y-1 animate-slide-in-up">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileListOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                      transition-all duration-200
                      ${isActive
                        ? 'gradient-animated text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="ml-auto text-xs text-zinc-500">{tab.shortcut}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile tab indicator */}
          <div className="lg:hidden flex py-3 gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                    transition-all duration-200
                    ${isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto min-h-[calc(100vh-140px)] px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn py-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'agents' && <AgentBindings />}
          {activeTab === 'cron' && <CronJobs />}
          {activeTab === 'system' && <SystemStatus />}
        </div>
      </main>

      {/* Footer with glass effect */}
      <footer className="border-t border-zinc-800/30 mt-8 glass-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-orange-500 blur-sm animate-breathe" />
              </div>
              <p className="text-xs text-zinc-500">
                Clawdbot Dashboard • Built with React + Vite
              </p>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">⌘K</kbd>
                Command
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">⌘L</kbd>
                Logs
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global components */}
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
