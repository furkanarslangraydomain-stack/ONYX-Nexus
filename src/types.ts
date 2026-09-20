export type ArchitectureLayerId = 'client' | 'security' | 'swarm' | 'server' | 'storage';

export interface ArchitectureLayer {
  id: ArchitectureLayerId;
  name: string;
  nameTr: string;
  badge: string;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}

export interface ArchitectureNode {
  id: string;
  layerId: ArchitectureLayerId;
  name: string;
  role: string;
  iconName: string;
  port?: number;
  status: 'ONLINE' | 'ACTIVE' | 'STANDBY' | 'READY';
  summary: string;
  description?: string;
  responsibilities: string[];
  techStack: string[];
  inputs: string[];
  outputs: string[];
  connections: string[];
  fileReference?: string;
  codeSnippet?: string;
}

export interface SwarmAgent {
  id: string;
  number: number;
  name: string;
  turkishTitle: string;
  role: string;
  iconName: string;
  consensusWeight: number; // e.g. 35 for 35%
  systemPrompt: string;
  primaryResponsibilities: string[];
  inputs: string[];
  outputs: string[];
  safetyAndGuardrails: string;
  samplePayload: {
    input: string;
    action: string;
    output: string;
  };
  fileReference: string;
}

export interface WorkflowStep {
  step: number;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  durationAvg: string;
  status: 'pending' | 'running' | 'completed';
  artifact: string;
}

export interface AutonomousWorkflow {
  id: string;
  name: string;
  nameTr: string;
  badge: string;
  description: string;
  durationAvg: string;
  accuracyOrSuccess: string;
  participatingAgents: string[];
  steps: WorkflowStep[];
  diagramAscii: string;
}

export interface ColabServerDetail {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'INITIALIZING';
  tunnelMethod: 'tmate' | 'cloudflared' | 'ngrok';
  embeddedEndpoint: string;
  sshHost: string;
  sshPort: number;
  sshUser: string;
  gpuType: string;
  ramUsageGb: number;
  ramTotalGb: number;
  diskUsageGb: number;
  diskTotalGb: number;
  uptime: string;
  activeAgentsCount: number;
}

export interface McpToolItem {
  name: string;
  category: 'filesystem' | 'database' | 'sandbox' | 'git' | 'security' | 'server';
  description: string;
  inputParams: string[];
  returnType: string;
}
