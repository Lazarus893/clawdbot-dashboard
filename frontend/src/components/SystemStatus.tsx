import { useSystemStatus } from '../hooks/useClawdbotAPI';

export function SystemStatus() {
  const { status, loading, error } = useSystemStatus();

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!status) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">System Status</h2>
      <div className="border rounded-lg p-6 bg-white shadow">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Gateway</h3>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  status.gateway.running ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span>
                {status.gateway.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            {status.gateway.pid && (
              <p className="text-sm text-gray-600 mt-1">PID: {status.gateway.pid}</p>
            )}
            {status.gateway.uptime && (
              <p className="text-sm text-gray-600">Uptime: {status.gateway.uptime}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
