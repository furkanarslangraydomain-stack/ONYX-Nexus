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

export interface PipelineSimulationResult {
  prompt: string;
  blueprint: string;
  generatedCode: string;
  terminalOutput: string;
  retryAttempts: number;
  notionPageId: string;
  openaiPayload: any;
  status: 'SUCCESS' | 'FAILED';
  totalDurationMs: number;
}
