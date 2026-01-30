import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CronJobs } from './components/CronJobs';
import { SystemStatus } from './components/SystemStatus';

type Tab = 'dashboard' | 'cron' | 'system';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cron', label: 'Cron Jobs' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 Clawdbot Dashboard
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cron' && <CronJobs />}
        {activeTab === 'system' && <SystemStatus />}
      </main>
    </div>
  );
}

export default App;
