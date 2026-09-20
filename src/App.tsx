import { useState } from 'react';
import {
  Code2,
  Server,
  Users,
  BrainCircuit,
  GitBranch,
  Cpu,
  ShieldAlert,
  Wrench,
  Layers,
  Download,
  Github,
  Boxes
} from 'lucide-react';
import { WorkspaceIdeView } from './components/WorkspaceIdeView';
import { ColabSshServerView } from './components/ColabSshServerView';
import { AgentSwarmView } from './components/AgentSwarmView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { GithubCiCdView } from './components/GithubCiCdView';
import { LoraFineTuningView } from './components/LoraFineTuningView';
import { SecurityShieldView } from './components/SecurityShieldView';
import { MegaMcpView } from './components/MegaMcpView';
import { TopologyDiagram } from './components/TopologyDiagram';
import { WorkflowsView } from './components/WorkflowsView';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { SchemaExportModal } from './components/SchemaExportModal';
import { ArchitectureNode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'workspace' | 'server' | 'swarm' | 'graph' | 'cicd' | 'lora' | 'security' | 'mcp' | 'blueprint'
  >('workspace');
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Boxes className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                  ONYX-Nexus
                  <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                    / Mimari Şema Gezgini
                  </span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold hidden md:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MİMARİ ÇIKARILDI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                9-Ajanlı Swarm • Tek Hücre Colab SSH Sunucusu • Zero-Knowledge Gizlilik Kalkanı
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-medium flex items-center gap-2 transition"
              title="Mermaid ve ASCII şemasını dışa aktar"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Şemayı Dışa Aktar</span>
              <span className="sm:hidden">Şema</span>
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

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'workspace', label: '1. OS Çalışma Alanı (IDE)', icon: Code2, badge: 'Canlı Kod & Shell' },
            { id: 'server', label: '2. Colab SSH & GPU', icon: Server, badge: 'Gömülü Port 8000' },
            { id: 'swarm', label: '3. 9-Ajanlı Swarm', icon: Users, badge: 'Konsensüs ≥%85' },
            { id: 'graph', label: '4. Anlamsal Bilgi Grafiği', icon: BrainCircuit, badge: 'SQLite FTS5' },
            { id: 'cicd', label: '5. GitHub CI/CD & Deploy', icon: GitBranch, badge: 'Auto Push' },
            { id: 'lora', label: '6. Tesla T4 LoRA Stüdyosu', icon: Cpu, badge: 'QLoRA 4-bit' },
            { id: 'security', label: '7. ZK-Gizlilik Kalkanı', icon: ShieldAlert, badge: 'HMAC & Mask' },
            { id: 'mcp', label: '8. Mega MCP Sunucusu', icon: Wrench, badge: '36+ Araç' },
            { id: 'blueprint', label: '9. Mimari Şema', icon: Layers, badge: '5 Katman' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden xl:inline ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'workspace' && <WorkspaceIdeView />}

        {activeTab === 'server' && <ColabSshServerView />}

        {activeTab === 'swarm' && <AgentSwarmView />}

        {activeTab === 'graph' && <KnowledgeGraphView />}

        {activeTab === 'cicd' && <GithubCiCdView />}

        {activeTab === 'lora' && <LoraFineTuningView />}

        {activeTab === 'security' && <SecurityShieldView />}

        {activeTab === 'mcp' && <MegaMcpView />}

        {activeTab === 'blueprint' && (
          <TopologyDiagram
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </main>

      {/* Footer System Specs */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-8 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>ONYX-Nexus Autonomous AI Operating System v4.0.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>WAL Modu: Lock-Free Concurrency</span>
            <span>Cloudflare: Tunnel E2E</span>
            <span>Failover: &lt;2.5ms</span>
          </div>
        </div>
      </footer>

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
