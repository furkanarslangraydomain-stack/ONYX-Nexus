import React, { useState } from 'react';
import { 
  MessageSquare, 
  Cpu, 
  Layers, 
  Activity, 
  Code2, 
  BookOpen, 
  Plus,
  Terminal,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Wrench
} from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { SkillsHub } from './components/SkillsHub';
import { ColabControlCenter } from './components/ColabControlCenter';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { CodeViewer } from './components/CodeViewer';
import { CloudDeployGuide } from './components/CloudDeployGuide';
import { RenderStudio3D } from './components/RenderStudio3D';
import { PolyglotSandbox } from './components/PolyglotSandbox';
import { SystemAutonomousHub } from './components/SystemAutonomousHub';
import { DeliverableTab } from './types';

type ActiveTab = 'chat' | 'render3d' | 'polyglot' | 'consensus' | 'skills' | 'colab' | 'architecture' | 'diagnostic' | 'code' | 'deploy';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [activeFileKey, setActiveFileKey] = useState<DeliverableTab>('main.py');

  const navItems = [
    { id: 'chat' as ActiveTab, label: 'Ajan Sohbeti & MCP', icon: MessageSquare, badge: 'Aktif' },
    { id: 'render3d' as ActiveTab, label: '3D Render Studio', icon: Layers, badge: 'Three.js' },
    { id: 'polyglot' as ActiveTab, label: 'Çoklu Dil Sandbox', icon: Code2, badge: '6 Dil' },
    { id: 'consensus' as ActiveTab, label: 'Swarm & Sistem Hub', icon: ShieldCheck, badge: 'Swarm' },
    { id: 'skills' as ActiveTab, label: '36+ MCP Yetenekleri', icon: Wrench, badge: '36 Araç' },
    { id: 'colab' as ActiveTab, label: 'Colab 5-Mesh Merkezi', icon: Cpu, badge: '5 Düğüm' },
    { id: 'architecture' as ActiveTab, label: 'Swarm Ajan Mimarisi', icon: Layers },
    { id: 'diagnostic' as ActiveTab, label: 'Sistem Tanılama', icon: Activity },
    { id: 'code' as ActiveTab, label: 'Kaynak Kodları', icon: Code2 },
    { id: 'deploy' as ActiveTab, label: 'Kurulum & Dağıtım', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}>
        {/* Brand */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              Ω
            </div>
            <div>
              <div className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
                ONYX-NEXUS
              </div>
              <div className="text-[10px] text-emerald-400/80 font-mono">Otonom Ajan OS</div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button 
            onClick={() => setActiveTab('chat')}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 p-2.5 rounded-lg text-xs font-mono font-semibold transition-colors border border-emerald-500/30"
          >
            <Plus className="w-4 h-4" /> Yeni Görev / Sohbet
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 px-2 uppercase tracking-wider font-mono">
            Modüller & Araçlar
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all text-left ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 ml-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] font-semibold text-slate-400 mb-2 px-2 uppercase tracking-wider font-mono">
            Sistem Durumu
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Swarm Motoru:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Hazır
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Ajan Havuzu:</span>
              <span className="text-slate-200">5 Uzman Ajan</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Bellek:</span>
              <span className="text-slate-200">SQLite FTS5 (WAL)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Sandbox:</span>
              <span className="text-cyan-400">E2B / Colab / Piston</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ONYX v2.0
          </span>
          <span className="text-slate-600">Free/Zero-Cost</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition"
              title={sidebarOpen ? "Kenar Çubuğunu Kapat" : "Kenar Çubuğunu Aç"}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="font-mono font-bold text-slate-200 flex items-center gap-2">
              <span className="text-emerald-400">ONYX-Nexus</span> 
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-xs text-slate-300">
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> Mega MCP Aktif
            </span>
          </div>
        </header>

        {/* Dynamic Tab View */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'render3d' && <RenderStudio3D />}
          {activeTab === 'polyglot' && <PolyglotSandbox />}
          {activeTab === 'consensus' && <SystemAutonomousHub />}
          {activeTab === 'skills' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <SkillsHub />
            </div>
          )}
          {activeTab === 'colab' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <ColabControlCenter />
            </div>
          )}
          {activeTab === 'architecture' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <ArchitectureDiagram />
            </div>
          )}
          {activeTab === 'diagnostic' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <DiagnosticPanel />
            </div>
          )}
          {activeTab === 'code' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <CodeViewer activeFileKey={activeFileKey} onSelectFile={setActiveFileKey} />
            </div>
          )}
          {activeTab === 'deploy' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
              <CloudDeployGuide />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
