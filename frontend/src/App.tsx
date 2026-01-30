import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CronJobs } from './components/CronJobs';
import { SystemStatus } from './components/SystemStatus';
import { AgentBindings } from './components/AgentBindings';

type Tab = 'dashboard' | 'agents' | 'cron' | 'system';

// Icon components for navigation
function DashboardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function AgentIcon({ className = "w-5 h-5" }: { className?: string }) {
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

function CronIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function SystemIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Sessions', icon: <DashboardIcon /> },
    { id: 'agents', label: 'Agents', icon: <AgentIcon /> },
    { id: 'cron', label: 'Cron Jobs', icon: <CronIcon /> },
    { id: 'system', label: 'System', icon: <SystemIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="12" rx="2" />
                <circle cx="9" cy="14" r="2" />
                <circle cx="15" cy="14" r="2" />
                <path d="M12 2v6" />
                <circle cx="12" cy="2" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Clawdbot Dashboard
              </h1>
              <p className="text-xs text-slate-500">Monitoring & Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-40 bg-slate-900/60 backdrop-blur-lg border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-600/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }
                `}
              >
                <span className={activeTab === tab.id ? 'text-violet-400' : ''}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
        <div className="animate-fadeIn">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'agents' && <AgentBindings />}
          {activeTab === 'cron' && <CronJobs />}
          {activeTab === 'system' && <SystemStatus />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-slate-500">
            Clawdbot Dashboard • Built with React + Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
