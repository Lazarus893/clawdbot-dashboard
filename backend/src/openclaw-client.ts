import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir, cpus, totalmem, freemem, loadavg } from 'os';

const execAsync = promisify(exec);

// Use environment variable or default to global install path
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || 'openclaw';
const OPENCLAW_CONFIG_DIR = process.env.OPENCLAW_CONFIG_DIR || join(homedir(), '.openclaw');

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

export interface ResourceMetrics {
  cpuPercent: number;
  memoryPercent: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  loadAvg: number[];
  cpuCores: number;
}

export interface SystemStatus {
  gateway: {
    running: boolean;
    pid?: number;
    uptime?: string;
  };
  resources: ResourceMetrics;
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

export class OpenClawClient {
  async listSessions(): Promise<Session[]> {
    try {
      const { stdout } = await execAsync(
        `${OPENCLAW_BIN} sessions --json --all-agents`,
        { timeout: 15000 }
      );
      const result = extractJSON(stdout);
      if (!result || !result.sessions) return [];
      
      return result.sessions.map((s: any) => ({
        key: s.key,
        kind: s.kind,
        updatedAt: s.updatedAt,
        ageMs: s.ageMs,
        sessionId: s.sessionId,
        model: s.model,
        inputTokens: s.inputTokens,
        outputTokens: s.outputTokens,
        totalTokens: s.totalTokens,
        agentId: s.agentId,
        modelProvider: s.modelProvider,
        contextTokens: s.contextTokens,
      }));
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  async listCronJobs(): Promise<CronJob[]> {
    try {
      const { stdout } = await execAsync(
        `${OPENCLAW_BIN} cron list --json --all`,
        { timeout: 30000 }
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
      const safeId = jobId.replace(/[^a-zA-Z0-9_\-]/g, '');
      const cmd = patch.enabled
        ? `${OPENCLAW_BIN} cron enable "${safeId}"`
        : `${OPENCLAW_BIN} cron disable "${safeId}"`;
      await execAsync(cmd, { timeout: 30000 });
      return true;
    } catch (error) {
      console.error('Failed to update cron job:', error);
      return false;
    }
  }

  async runCronJob(jobId: string): Promise<boolean> {
    try {
      const safeId = jobId.replace(/[^a-zA-Z0-9_\-]/g, '');
      await execAsync(`${OPENCLAW_BIN} cron run "${safeId}"`, { timeout: 30000 });
      return true;
    } catch (error) {
      console.error('Failed to run cron job:', error);
      return false;
    }
  }

  private getResourceMetrics(): ResourceMetrics {
    const totalMem = totalmem();
    const freeMem = freemem();
    const usedMem = totalMem - freeMem;

    const cpuList = cpus();
    const cpuCount = cpuList.length;

    const load = loadavg();
    const cpuPercent = Math.min(100, Math.round((load[0] / cpuCount) * 100));

    return {
      cpuPercent,
      memoryPercent: Math.round((usedMem / totalMem) * 100),
      memoryUsedMB: Math.round(usedMem / 1024 / 1024),
      memoryTotalMB: Math.round(totalMem / 1024 / 1024),
      loadAvg: load.map(v => Math.round(v * 100) / 100),
      cpuCores: cpuCount,
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const resources = this.getResourceMetrics();

    try {
      const { stdout } = await execAsync(
        `${OPENCLAW_BIN} gateway status --json`,
        { timeout: 15000 }
      );
      const result = extractJSON(stdout);
      if (result) {
        // Parse the real CLI output structure:
        // result.port.listeners[] has pid/command info
        // result.port.status === 'busy' means gateway is running
        const portInfo = result.port;
        const isRunning = portInfo?.status === 'busy' && portInfo?.listeners?.length > 0;
        const listener = portInfo?.listeners?.[0];

        return {
          gateway: {
            running: isRunning,
            pid: listener?.pid,
            uptime: result.gateway?.port ? `port ${result.gateway.port}` : undefined,
          },
          resources,
        };
      }
    } catch {
      // CLI timed out or not available
    }

    return {
      gateway: { running: false },
      resources,
    };
  }

  async getSessionMessages(_sessionKey: string): Promise<any[]> {
    // The openclaw CLI does not expose a session message history command.
    // Session messages are stored internally and not accessible via CLI.
    return [];
  }

  async listModels(): Promise<any> {
    try {
      const { stdout } = await execAsync(
        `${OPENCLAW_BIN} models list --json`,
        { timeout: 120000 }
      );
      return extractJSON(stdout);
    } catch (error) {
      console.error('Failed to list models:', error);
      return { models: [] };
    }
  }

  async getModelStatus(): Promise<any> {
    try {
      const { stdout } = await execAsync(
        `${OPENCLAW_BIN} models status --json`,
        { timeout: 120000 }
      );
      return extractJSON(stdout);
    } catch (error) {
      console.error('Failed to get model status:', error);
      return null;
    }
  }

  async setModel(modelKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const safe = modelKey.replace(/[^a-zA-Z0-9_/.\-]/g, '');
      await execAsync(
        `${OPENCLAW_BIN} models set "${safe}"`,
        { timeout: 30000 }
      );
      return { success: true };
    } catch (error: any) {
      console.error('Failed to set model:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  async restartGateway(): Promise<{ success: boolean; error?: string }> {
    try {
      await execAsync(
        `${OPENCLAW_BIN} gateway restart`,
        { timeout: 30000 }
      );
      return { success: true };
    } catch (error: any) {
      console.error('Failed to restart gateway:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  async getAgentsOverview(): Promise<AgentsOverview> {
    try {
      // Read openclaw.json config directly
      const configPath = join(OPENCLAW_CONFIG_DIR, 'openclaw.json');
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

export const openclawClient = new OpenClawClient();

// --- Claude Code Provider Switcher (ccps) ---

const CCPS_BIN = process.env.CCPS_BIN || `${homedir()}/.local/bin/ccps`;
const CCPS_DB = process.env.CC_SWITCH_DB || join(homedir(), '.cc-switch', 'cc-switch.db');

export interface CcProvider {
  id: string;
  name: string;
  isCurrent: boolean;
  baseUrl: string;
}

export class CcpsClient {
  async listProviders(): Promise<CcProvider[]> {
    try {
      const { stdout } = await execAsync(
        `sqlite3 -json "${CCPS_DB}" "SELECT id, name, is_current, COALESCE(json_extract(settings_config,'$.env.ANTHROPIC_BASE_URL'), '') as base_url FROM providers WHERE app_type='claude' ORDER BY name"`,
        { timeout: 10000 }
      );
      const rows = JSON.parse(stdout.trim());
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        isCurrent: r.is_current === 1,
        baseUrl: r.base_url,
      }));
    } catch (error) {
      console.error('Failed to list ccps providers:', error);
      return [];
    }
  }

  async useProvider(nameOrId: string): Promise<{ success: boolean; name?: string; error?: string }> {
    try {
      const safe = nameOrId.replace(/"/g, '\\"');
      const { stdout } = await execAsync(
        `bash "${CCPS_BIN}" use "${safe}"`,
        { timeout: 120000 }
      );
      const match = stdout.match(/Switched to:\s*(.+?)\s*\(/);
      return { success: true, name: match?.[1] || nameOrId };
    } catch (error: any) {
      console.error('Failed to switch ccps provider:', error);
      return { success: false, error: error?.stderr || error?.message || 'Unknown error' };
    }
  }
}

export const ccpsClient = new CcpsClient();
