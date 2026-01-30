import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CLAWDBOT_BIN = '/Users/tonyye/.npm-global/bin/clawdbot';

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
  payload?: any;
}

export interface SystemStatus {
  gateway: {
    running: boolean;
    pid?: number;
    uptime?: string;
  };
  memory?: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
}

function extractJSON(output: string): any {
  // Find the first { and extract JSON from there
  const jsonStart = output.indexOf('{');
  if (jsonStart === -1) return null;
  
  try {
    return JSON.parse(output.substring(jsonStart));
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

export class ClawdbotClient {
  async listSessions(): Promise<Session[]> {
    try {
      const { stdout } = await execAsync(
        `${CLAWDBOT_BIN} sessions list --json 2>/dev/null`
      );
      const result = extractJSON(stdout);
      if (!result || !result.sessions) return [];
      
      // Transform to simpler format
      return result.sessions.map((s: any) => ({
        key: s.key,
        kind: s.kind,
        updatedAt: s.updatedAt,
        ageMs: s.ageMs,
        sessionId: s.sessionId,
        model: s.model,
        inputTokens: s.inputTokens,
        outputTokens: s.outputTokens,
        totalTokens: s.totalTokens
      }));
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  async listCronJobs(): Promise<CronJob[]> {
    try {
      const { stdout } = await execAsync(
        `${CLAWDBOT_BIN} cron list --json 2>/dev/null`
      );
      const result = extractJSON(stdout);
      return result?.jobs || [];
    } catch (error) {
      console.error('Failed to list cron jobs:', error);
      return [];
    }
  }

  async updateCronJob(jobId: string, patch: any): Promise<boolean> {
    try {
      const patchJson = JSON.stringify(patch).replace(/"/g, '\\"');
      await execAsync(
        `${CLAWDBOT_BIN} cron update ${jobId} "${patchJson}" 2>/dev/null`
      );
      return true;
    } catch (error) {
      console.error('Failed to update cron job:', error);
      return false;
    }
  }

  async runCronJob(jobId: string): Promise<boolean> {
    try {
      await execAsync(`${CLAWDBOT_BIN} cron run ${jobId} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Failed to run cron job:', error);
      return false;
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const { stdout } = await execAsync(`ps aux | grep clawdbot-gateway | grep -v grep`);
      const lines = stdout.trim().split('\n');
      
      if (lines.length > 0 && lines[0]) {
        const parts = lines[0].split(/\s+/);
        return {
          gateway: {
            running: true,
            pid: parseInt(parts[1]) || undefined,
            uptime: parts[9] || undefined
          }
        };
      }
      
      return {
        gateway: {
          running: false
        }
      };
    } catch (error) {
      return {
        gateway: {
          running: false
        }
      };
    }
  }
}

export const clawdbotClient = new ClawdbotClient();
