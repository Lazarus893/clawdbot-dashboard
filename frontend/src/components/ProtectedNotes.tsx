import { useEffect, useState } from 'react';
import { Lock } from '@phosphor-icons/react';

interface NoteFile {
  name: string;
  content?: string;
  protected?: boolean;
  message?: string;
}

export function ProtectedNotes() {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<{ agents?: NoteFile; memory?: NoteFile }>({});
  const [activeTab, setActiveTab] = useState<'agents' | 'memory'>('agents');

  useEffect(() => {
    // Load AGENT.md immediately (no password needed)
    fetch('/api/notes/agents')
      .then(res => res.json())
      .then(data => {
        setNotes(prev => ({ ...prev, agents: data }));
      });
  }, []);

  const verifyPassword = async () => {
    if (!password) {
      setError('Please enter password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/notes/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sessionId }),
      });
      
      const data = await res.json();
      
      if (data.valid) {
        setIsUnlocked(true);
        // Now fetch MEMORY.md
        const memoryRes = await fetch(`/api/notes/memory?sessionId=${sessionId}`);
        const memoryData = await memoryRes.json();
        setNotes(prev => ({ ...prev, memory: memoryData }));
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPassword();
    }
  };

  const lock = () => {
    setIsUnlocked(false);
    setPassword('');
    setNotes(prev => ({ ...prev, memory: undefined }));
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-lg font-bold text-zinc-100 mt-3 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-md font-semibold text-zinc-200 mt-3 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-sm font-medium text-zinc-300 mt-2 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-zinc-400 ml-4 text-sm">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-zinc-400 text-sm">{line}</p>;
    });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">Notes</h3>
        {isUnlocked && (
          <button
            onClick={lock}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            Lock
          </button>
        )}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'agents'
              ? 'bg-[#FF4D00] text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          AGENT.md
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          disabled={!isUnlocked}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'memory'
              ? 'bg-[#FF4D00] text-white'
              : !isUnlocked
              ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {isUnlocked ? 'MEMORY.md' : <><Lock className="w-3 h-3 inline mr-1" />MEMORY.md</>}
        </button>
      </div>

      {/* Content */}
      <div className="bg-zinc-900/50 rounded-lg p-3 min-h-32 max-h-48 overflow-y-auto">
        {activeTab === 'agents' && notes.agents && (
          <div className="text-sm">
            {renderContent(notes.agents.content || '')}
          </div>
        )}

        {activeTab === 'memory' && !isUnlocked && (
          <div className="flex flex-col items-center justify-center h-24">
            <Lock className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-sm mb-3">MEMORY.md is protected</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FF4D00]"
              />
              <button
                onClick={verifyPassword}
                disabled={loading}
                className="bg-[#FF4D00] hover:bg-[#FF4D00]/90 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Unlock'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        )}

        {activeTab === 'memory' && isUnlocked && notes.memory && (
          <div className="text-sm">
            {renderContent(notes.memory.content || '')}
          </div>
        )}
      </div>
    </div>
  );
}
