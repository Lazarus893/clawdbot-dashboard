import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

export interface Session {
  sessionKey: string;
  agentId: string;
  kind: string;
  createdAtMs: number;
  lastMessageAtMs: number;
  messageCount: number;
  model?: string;
  status?: string;
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

export function useSessions(autoRefresh = true) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions/list`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return { sessions, loading, error, refetch: fetchSessions };
}

export function useCronJobs(autoRefresh = true) {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/cron/list`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cron jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await fetch(`${API_BASE}/cron/update/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to toggle job:', err);
    }
  };

  const runJob = async (jobId: string) => {
    try {
      await fetch(`${API_BASE}/cron/run/${jobId}`, {
        method: 'POST'
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to run job:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (autoRefresh) {
      const interval = setInterval(fetchJobs, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return { jobs, loading, error, refetch: fetchJobs, toggleJob, runJob };
}

export function useSystemStatus(autoRefresh = true) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/status`);
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return { status, loading, error, refetch: fetchStatus };
}
