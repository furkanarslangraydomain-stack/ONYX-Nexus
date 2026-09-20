export type DeliverableTab =
  | 'agent_crew.py'
  | 'main.py'
  | 'colab_dashboard.py'
  | 'colab_runner.py'
  | 'onyx_nexus_colab.ipynb'
  | 'requirements.txt'
  | 'install.sh'
  | 'setup.sh'
  | 'integration_guide.md'
  | '.env.example';

export type MainTab =
  | 'deliverables'
  | 'colab-control'
  | 'cloud-deploy'
  | 'simulator'
  | 'openwebui-setup'
  | 'architecture'
  | '3d-studio';

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
