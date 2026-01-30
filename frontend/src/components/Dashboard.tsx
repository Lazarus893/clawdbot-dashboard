import { useSessions } from '../hooks/useClawdbotAPI';

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function Dashboard() {
  const { sessions, loading, error } = useSessions();

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  // Separate main and cron sessions
  const mainSessions = sessions.filter(s => !s.key.includes(':cron:'));
  const cronSessions = sessions.filter(s => s.key.includes(':cron:'));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Active Sessions</h2>
        <p className="text-gray-600">
          Total: {sessions.length} | Main: {mainSessions.length} | Cron: {cronSessions.length}
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Sessions */}
        {mainSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Main Sessions</h3>
            <div className="grid gap-4">
              {mainSessions.map((session) => (
                <div key={session.key} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{session.key}</h4>
                      <p className="text-sm text-gray-600">Kind: {session.kind}</p>
                      {session.model && (
                        <p className="text-sm text-gray-600">Model: {session.model}</p>
                      )}
                      {session.totalTokens && (
                        <p className="text-sm text-gray-600">
                          Tokens: {session.totalTokens.toLocaleString()} 
                          (in: {session.inputTokens?.toLocaleString() || 0}, 
                          out: {session.outputTokens?.toLocaleString() || 0})
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Active
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(session.ageMs)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cron Sessions */}
        {cronSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Cron Job Sessions</h3>
            <div className="grid gap-4">
              {cronSessions.slice(0, 5).map((session) => (
                <div key={session.key} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{session.key.split(':').pop()}</h4>
                      <p className="text-xs text-gray-600">Model: {session.model}</p>
                      {session.totalTokens && (
                        <p className="text-xs text-gray-600">
                          Tokens: {session.totalTokens.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatTimeAgo(session.ageMs)}</p>
                  </div>
                </div>
              ))}
              {cronSessions.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {cronSessions.length - 5} more cron sessions
                </p>
              )}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No active sessions</p>
        )}
      </div>
    </div>
  );
}
