import { useCronJobs } from '../hooks/useClawdbotAPI';

export function CronJobs() {
  const { jobs, loading, error, toggleJob, runJob } = useCronJobs();

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Cron Jobs</h2>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500">No cron jobs configured</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{job.name}</h3>
                  {job.agentId && (
                    <p className="text-sm text-gray-600">Agent: {job.agentId}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Schedule: {job.schedule.expr} ({job.schedule.tz})
                  </p>
                  {job.state && (
                    <>
                      {job.state.nextRunAtMs && (
                        <p className="text-sm text-gray-600">
                          Next: {new Date(job.state.nextRunAtMs).toLocaleString()}
                        </p>
                      )}
                      {job.state.lastRunAtMs && (
                        <p className="text-sm text-gray-600">
                          Last: {new Date(job.state.lastRunAtMs).toLocaleString()}
                          {job.state.lastStatus && ` (${job.state.lastStatus})`}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <button
                    onClick={() => toggleJob(job.id, !job.enabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      job.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  {job.enabled && (
                    <button
                      onClick={() => runJob(job.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Run Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
