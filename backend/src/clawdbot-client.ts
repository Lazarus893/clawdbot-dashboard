import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CLAWDBOT_BIN = '/Users/tonyye/.npm-global/bin/clawdbot';

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

export class ClawdbotClient {
  async listSessions(): Promise<Session[]> {
    try {
      const { stdout } = await execAsync(
        `${CLAWDBOT_BIN} sessions list --json`
      );
      const result = JSON.parse(stdout);
      return result.sessions || [];
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  async listCronJobs(): Promise<CronJob[]> {
    try {
      const { stdout } = await execAsync(`${CLAWDBOT_BIN} cron list --json`);
      const result = JSON.parse(stdout);
      return result.jobs || [];
    } catch (error) {
      console.error('Failed to list cron jobs:', error);
      return [];
    }
  }

  async updateCronJob(jobId: string, patch: any): Promise<boolean> {
    try {
      const patchJson = JSON.stringify(patch);
      await execAsync(
        `${CLAWDBOT_BIN} cron update ${jobId} '${patchJson}'`
      );
      return true;
    } catch (error) {
      console.error('Failed to update cron job:', error);
      return false;
    }
  }

  async runCronJob(jobId: string): Promise<boolean> {
    try {
      await execAsync(`${CLAWDBOT_BIN} cron run ${jobId}`);
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
