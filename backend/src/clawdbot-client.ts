import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const execAsync = promisify(exec);

// Use environment variable or find in PATH
const CLAWDBOT_BIN = process.env.CLAWDBOT_BIN || 'clawdbot';
const CLAWDBOT_CONFIG_DIR = process.env.CLAWDBOT_CONFIG_DIR || join(homedir(), '.clawdbot');

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
      // Try using clawdbot gateway status first
      const { stdout } = await execAsync(`${CLAWDBOT_BIN} gateway status --json 2>/dev/null`, { timeout: 5000 });
      const result = extractJSON(stdout);
      if (result) {
        return {
          gateway: {
            running: result.running ?? true,
            pid: result.pid,
            uptime: result.uptime
          }
        };
      }
    } catch {
      // Fallback to ps
    }
    
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
    } catch {
      // Gateway not running
    }
    
    return {
      gateway: {
        running: false
      }
    };
  }

  async getAgentsOverview(): Promise<AgentsOverview> {
    try {
      // Read clawdbot.json config directly
      const configPath = join(CLAWDBOT_CONFIG_DIR, 'clawdbot.json');
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      const agents: AgentConfig[] = [];
      const bindings: AgentBinding[] = [];
      
      // Parse agents.list
      if (config.agents?.list) {
        for (const agentConfig of config.agents.list) {
          const agent: AgentConfig = {
            id: agentConfig.id,
            name: agentConfig.name || agentConfig.id,
            model: agentConfig.model?.primary || config.agents.defaults?.model?.primary,
            thinkingLevel: agentConfig.thinkingLevel,
            maxTurns: agentConfig.maxTurns,
            subagents: agentConfig.subagents,
            bindings: []
          };
          agents.push(agent);
        }
      }
      
      // Parse bindings
      if (config.bindings) {
        for (const binding of config.bindings) {
          const bindingObj: AgentBinding = {
            channel: binding.match?.channel || 'unknown',
            agent: binding.agentId || 'unknown',
            pattern: binding.match?.pattern
          };
          bindings.push(bindingObj);
          
          // Add to agent's bindings
          const agent = agents.find(a => a.id === bindingObj.agent);
          if (agent) {
            agent.bindings = agent.bindings || [];
            agent.bindings.push(bindingObj);
          }
        }
      }
      
      return { agents, bindings };
    } catch (error) {
      console.error('Failed to get agents overview:', error);
      return { agents: [], bindings: [] };
    }
  }
}

export const clawdbotClient = new ClawdbotClient();
