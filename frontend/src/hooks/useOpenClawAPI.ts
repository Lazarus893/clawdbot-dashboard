import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = 'http://localhost:3001/api';

export interface Session {
  key: string;
  kind: string;
  updatedAt: number;
  ageMs: number;
  sessionId: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
  };
  state?: {
    nextRunAtMs: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
  agentId?: string;
}

export interface SystemStatus {
  gateway: {
    running: boolean;
    pid?: number;
    uptime?: string;
  };
}

export interface AgentBinding {
  channel: string;
  agent: string;
  pattern?: string;
}

export interface AgentConfig {
  id: string;
  name?: string;
  model?: string;
  thinkingLevel?: string;
  maxTurns?: number;
  systemPrompt?: string;
  subagents?: {
    allowAgents?: string[];
  };
  bindings?: AgentBinding[];
}

export interface AgentsOverview {
  agents: AgentConfig[];
  bindings: AgentBinding[];
}

// Generic fetch hook with proper cleanup
function useApiData<T>(
  endpoint: string,
  initialData: T,
  autoRefresh: boolean = true,
  refreshInterval: number = 10000
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!isRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const json = await res.json();
      
      if (mountedRef.current) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    let intervalId: number | undefined;
    if (autoRefresh) {
      intervalId = window.setInterval(() => fetchData(true), refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval]);

  return { data, loading, error, isRefreshing, refetch: () => fetchData(true) };
}

export function useSessions(autoRefresh = true) {
  const { data, loading, error, isRefreshing, refetch } = useApiData<{ sessions: Session[] }>(
    '/sessions/list',
    { sessions: [] },
    autoRefresh,
    5000
  );

  return { 
    sessions: data.sessions, 
    loading, 
    error, 
    isRefreshing,
    refetch 
  };
}

export function useCronJobs(autoRefresh = true) {
  const { data, loading, error, isRefreshing, refetch } = useApiData<{ jobs: CronJob[] }>(
    '/cron/list',
    { jobs: [] },
    autoRefresh,
    10000
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const toggleJob = useCallback(async (jobId: string, enabled: boolean) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API_BASE}/cron/update/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error('Failed to update job');
      refetch();
    } catch (err) {
      console.error('Failed to toggle job:', err);
    } finally {
      setActionLoading(null);
    }
  }, [refetch]);

  const runJob = useCallback(async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API_BASE}/cron/run/${jobId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to run job');
      refetch();
    } catch (err) {
      console.error('Failed to run job:', err);
    } finally {
      setActionLoading(null);
    }
  }, [refetch]);

  return { 
    jobs: data.jobs, 
    loading, 
    error, 
    isRefreshing,
    actionLoading,
    refetch, 
    toggleJob, 
    runJob 
  };
}

export function useSystemStatus(autoRefresh = true) {
  const { data, loading, error, isRefreshing, refetch } = useApiData<SystemStatus | null>(
    '/system/status',
    null,
    autoRefresh,
    5000
  );

  return { status: data, loading, error, isRefreshing, refetch };
}

export function useAgentsOverview(autoRefresh = false) {
  const { data, loading, error, isRefreshing, refetch } = useApiData<AgentsOverview>(
    '/agents/overview',
    { agents: [], bindings: [] },
    autoRefresh,
    30000
  );

  return { 
    agents: data.agents, 
    bindings: data.bindings, 
    loading, 
    error, 
    isRefreshing,
    refetch 
  };
}
