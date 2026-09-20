export type MainTab =
  | 'chat'
  | 'mesh'
  | 'studio3d'
  | 'mcp'
  | 'autonomous'
  | 'sandbox'
  | 'arch'
  | 'tools';

export interface MeshNodeState {
  node_id: number;
  name: string;
  port: number;
  role: string;
  status: 'ONLINE' | 'READY' | 'BUSY' | 'SYNCING';
  latency?: string;
  public_url?: string;
}

export interface AgentPhaseState {
  id: number;
  name: string;
  agent: string;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  target: string;
  output?: string;
  durationMs?: number;
  retries?: number;
}

export interface AgentBotConfig {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  status: 'ACTIVE' | 'STANDBY' | 'BUSY';
  capabilities: string[];
  color: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  steps: string[];
  estimatedDuration: string;
  recommendedFor: string;
  icon: string;
  activeAgents: string[];
}
