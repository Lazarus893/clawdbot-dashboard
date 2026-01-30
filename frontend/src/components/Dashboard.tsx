import { useSessions } from '../hooks/useClawdbotAPI';

export function Dashboard() {
  const { sessions, loading, error } = useSessions();

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500">No active sessions</p>
        ) : (
          sessions.map((session) => (
            <div key={session.sessionKey} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{session.sessionKey}</h3>
                  <p className="text-sm text-gray-600">Agent: {session.agentId}</p>
                  <p className="text-sm text-gray-600">Kind: {session.kind}</p>
                  {session.model && (
                    <p className="text-sm text-gray-600">Model: {session.model}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Active
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Messages: {session.messageCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last: {new Date(session.lastMessageAtMs).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
