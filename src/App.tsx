import { useState } from 'react';
import {
  MessageSquare,
  Box,
  Code2,
  Users,
  GitBranch,
  Cpu,
  ShieldAlert,
  Wrench,
  Layers,
  Download,
  Github,
  Boxes,
  Activity,
  Sparkles,
  Server,
  Network,
  Coins,
  BrainCircuit,
  Stethoscope,
  Terminal,
  Volume2
} from 'lucide-react';

// Core restored and new views
import { ChatInterface } from './components/ChatInterface';
import { RenderStudio3D } from './components/RenderStudio3D';
import { WorkspaceIdeView } from './components/WorkspaceIdeView';
import { AgentSwarmView } from './components/AgentSwarmView';
import { WorkflowsView } from './components/WorkflowsView';
import { SystemAutonomousHub } from './components/SystemAutonomousHub';
import { PolyglotSandbox } from './components/PolyglotSandbox';
import { ColabMeshMonitor } from './components/ColabMeshMonitor';
import { ColabSshServerView } from './components/ColabSshServerView';
import { Web3AuditorPanel } from './components/Web3AuditorPanel';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { GithubCiCdView } from './components/GithubCiCdView';
import { LoraFineTuningView } from './components/LoraFineTuningView';
import { SecurityShieldView } from './components/SecurityShieldView';
import { MegaMcpView } from './components/MegaMcpView';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { TopologyDiagram } from './components/TopologyDiagram';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { SchemaExportModal } from './components/SchemaExportModal';
import { ArchitectureNode } from './types';

export type AppTab =
  | 'chat'
  | 'studio3d'
  | 'workspace'
  | 'swarm'
  | 'workflows'
  | 'models'
  | 'sandbox'
  | 'mesh'
  | 'server'
  | 'web3'
  | 'graph'
  | 'cicd'
  | 'lora'
  | 'security'
  | 'mcp'
  | 'tools'
  | 'blueprint';

interface TabItem {
  id: AppTab;
  label: string;
  category: 'core' | 'ai' | 'execution' | 'infra';
  icon: any;
  badge?: string;
  color: string;
}

const TABS: TabItem[] = [
  // Core Interfaces
  {
    id: 'chat',
    label: 'Gemini Sohbet & TTS',
    category: 'core',
    icon: MessageSquare,
    badge: 'TTS & 9-Ajan',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  },
  {
    id: 'studio3d',
    label: '3D Render Stüdyosu',
    category: 'core',
    icon: Box,
    badge: 'Three.js WebGL',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  },
  {
    id: 'workspace',
    label: 'OS Çalışma Alanı (IDE)',
    category: 'core',
    icon: Code2,
    badge: 'Canlı Shell & Kod',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },

  // Swarm & AI
  {
    id: 'swarm',
    label: '9-Ajanlı Swarm',
    category: 'ai',
    icon: Users,
    badge: 'Konsensüs ≥%85',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'workflows',
    label: 'Otonom İş Akışları',
    category: 'ai',
    icon: Activity,
    badge: '5 Pipeline',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 'models',
    label: 'Model Havuzu & Telemetri',
    category: 'ai',
    icon: Sparkles,
    badge: '145+ Model',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  },

  // Execution & Cloud
  {
    id: 'sandbox',
    label: 'Çok Dilli Sandbox',
    category: 'execution',
    icon: Terminal,
    badge: '6 Dil QA',
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10'
  },
  {
    id: 'mesh',
    label: 'Colab 5-Node Mesh',
    category: 'execution',
    icon: Network,
    badge: '5 Düğüm P2P',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
  },
  {
    id: 'server',
    label: 'Colab SSH & GPU',
    category: 'execution',
    icon: Server,
    badge: 'Tesla T4',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  {
    id: 'web3',
    label: 'Web3 Güvenlik Denetimi',
    category: 'execution',
    icon: Coins,
    badge: 'Slither EVM',
    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
  },

  // Infrastructure & Security
  {
    id: 'security',
    label: 'ZK-Gizlilik Kalkanı',
    category: 'infra',
    icon: ShieldAlert,
    badge: 'HMAC Masking',
    color: 'text-red-400 border-red-500/30 bg-red-500/10'
  },
  {
    id: 'graph',
    label: 'Anlamsal Bilgi Grafiği',
    category: 'infra',
    icon: BrainCircuit,
    badge: 'SQLite FTS5',
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/10'
  },
  {
    id: 'cicd',
    label: 'GitHub CI/CD & Deploy',
    category: 'infra',
    icon: GitBranch,
    badge: 'Auto Git',
    color: 'text-green-400 border-green-500/30 bg-green-500/10'
  },
  {
    id: 'lora',
    label: 'Tesla T4 LoRA Stüdyosu',
    category: 'infra',
    icon: Cpu,
    badge: 'QLoRA 4-bit',
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10'
  },
  {
    id: 'mcp',
    label: 'Mega MCP Sunucusu',
    category: 'infra',
    icon: Wrench,
    badge: '36+ Araç',
    color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10'
  },
  {
    id: 'tools',
    label: 'Sistem Tanılama',
    category: 'infra',
    icon: Stethoscope,
    badge: 'Sağlık Testi',
    color: 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  },
  {
    id: 'blueprint',
    label: 'Sistem Mimarisi',
    category: 'infra',
    icon: Layers,
    badge: '5 Katman',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'ai' | 'execution' | 'infra'>('all');
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filteredTabs = activeCategory === 'all'
    ? TABS
    : TABS.filter(t => t.category === activeCategory);

  const isFullHeightView = activeTab === 'chat' || activeTab === 'studio3d';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#090d15]/90 backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Boxes className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                  ONYX-Nexus
                  <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                    / Otonom AI OS v4.0
                  </span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold hidden md:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SİSTEM ÇEVRİMİÇİ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Gemini UI & TTS • 3D Render Stüdyosu • 9-Ajanlı Swarm • Colab SSH • ZK-Shield
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Quick Jump Buttons */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Gemini Sohbet & Sesli TTS"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sohbet & TTS</span>
            </button>

            <button
              onClick={() => setActiveTab('studio3d')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                activeTab === 'studio3d'
                  ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="3D Render Stüdyosu"
            >
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">3D Stüdyo</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-medium flex items-center gap-2 transition"
              title="Mermaid ve ASCII şemasını dışa aktar"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Şema</span>
            </button>

            <a
              href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="GitHub Reposuna Git"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Sub-Header Category Filter Bar */}
        <div className="border-t border-slate-800/60 bg-[#06080d]/90 px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'all', label: 'Tümü (17)' },
                { id: 'core', label: '🎨 Arayüz & Stüdyo' },
                { id: 'ai', label: '🤖 Ajan & Model' },
                { id: 'execution', label: '⚡ Sandbox & Mesh' },
                { id: 'infra', label: '🛡️ Güvenlik & Sistem' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition ${
                    activeCategory === cat.id
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status indicators */}
            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Zero-Knowledge Mask: %100</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>WAL Concurrency: 2200+ IOPS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Navigation Scrollbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
          {filteredTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden sm:inline ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main
        className={`flex-1 w-full ${
          isFullHeightView
            ? 'h-[calc(100vh-8.5rem)] p-0 overflow-hidden'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
        }`}
      >
        {/* Core Interfaces */}
        {activeTab === 'chat' && <ChatInterface />}

        {activeTab === 'studio3d' && (
          <div className="w-full h-full">
            <RenderStudio3D />
          </div>
        )}

        {activeTab === 'workspace' && <WorkspaceIdeView />}

        {/* Swarm & AI */}
        {activeTab === 'swarm' && <AgentSwarmView />}

        {activeTab === 'workflows' && <WorkflowsView />}

        {activeTab === 'models' && <SystemAutonomousHub />}

        {/* Execution & Cloud */}
        {activeTab === 'sandbox' && <PolyglotSandbox />}

        {activeTab === 'mesh' && <ColabMeshMonitor />}

        {activeTab === 'server' && <ColabSshServerView />}

        {activeTab === 'web3' && <Web3AuditorPanel />}

        {/* Infrastructure & Security */}
        {activeTab === 'security' && <SecurityShieldView />}

        {activeTab === 'graph' && <KnowledgeGraphView />}

        {activeTab === 'cicd' && <GithubCiCdView />}

        {activeTab === 'lora' && <LoraFineTuningView />}

        {activeTab === 'mcp' && <MegaMcpView />}

        {activeTab === 'tools' && <DiagnosticPanel />}

        {activeTab === 'blueprint' && (
          <TopologyDiagram
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </main>

      {/* Footer System Specs (shown in standard views, hidden in full-height 3D/chat) */}
      {!isFullHeightView && (
        <footer className="border-t border-slate-900 bg-[#06080d] py-4 mt-8 text-slate-500 text-xs font-mono shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>ONYX-Nexus Autonomous AI Operating System v4.0.0</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>WAL Modu: Lock-Free Concurrency</span>
              <span>Cloudflare: Tunnel E2E</span>
              <span>Failover: &lt;2.5ms</span>
              <span>3D WebGL: Three.js PBR Engine</span>
            </div>
          </div>
        </footer>
      )}

      {/* Slide-in Node Detail Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(node) => setSelectedNode(node)}
      />

      {/* Export Modal */}
      <SchemaExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
