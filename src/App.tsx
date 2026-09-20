import React, { useState } from 'react';
import {
  MessageSquare,
  Network,
  Code2,
  Layers,
  Sparkles,
  Shield,
  Box,
  Activity,
  Github,
  ExternalLink,
  Cpu,
  Menu,
  X,
  Server,
  Wrench
} from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { ColabMeshMonitor } from './components/ColabMeshMonitor';
import { PolyglotSandbox } from './components/PolyglotSandbox';
import { SystemAutonomousHub } from './components/SystemAutonomousHub';
import { ArchitectureVisualizer } from './components/ArchitectureVisualizer';
import { Web3AuditorPanel } from './components/Web3AuditorPanel';
import { ThreeDStudioPanel } from './components/ThreeDStudioPanel';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { McpConnectHub } from './components/McpConnectHub';
import { MainTab } from './types';

type ToolSubTab = 'web3' | 'diag';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('chat');
  const [activeToolSubTab, setActiveToolSubTab] = useState<ToolSubTab>('web3');

  const navigationItems = [
    {
      id: 'chat' as MainTab,
      label: 'Ajan Terminali & Chat',
      desc: 'Otonom Asistan, Deep Research & Terminal',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'mesh' as MainTab,
      label: 'Colab Mesh Ağı & Telemetri',
      desc: '5 Düğümlü P2P Kümesi & Cloudflare Tünel',
      icon: Network,
      badge: '5 Node',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'studio3d' as MainTab,
      label: '3D Render Studio',
      desc: 'WebGL, PBR Işıklandırma, Clay & Sahne Motoru',
      icon: Box,
      badge: 'Studio',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'mcp' as MainTab,
      label: 'Universal MCP Hub (36+ Araç)',
      desc: 'Cursor, Claude, VSCode, Windsurf Entegrasyonu',
      icon: Server,
      badge: '8+ IDE',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      id: 'autonomous' as MainTab,
      label: 'Konsensüs & Free API (12+)',
      desc: '3-Ajan Karar Matrisi, SQL & 145+ Model',
      icon: Sparkles,
      badge: '145+ Model',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      id: 'sandbox' as MainTab,
      label: 'Çok Dilli Sandbox & QA',
      desc: 'Solidity, Rust, Go, C++, Python, TS',
      icon: Code2,
      badge: '6 Dil',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'arch' as MainTab,
      label: 'Sistem Mimarisi & Topoloji',
      desc: 'İnteraktif Mimari ve Karar Şeması',
      icon: Layers,
      badge: 'v3.0',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'tools' as MainTab,
      label: 'Web3 & Sistem Tanılama',
      desc: 'Sözleşme Denetimi & Ortam Bilgisi',
      icon: Shield,
      badge: 'Araçlar',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sleek Minimalist Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } shrink-0 bg-slate-900/90 border-r border-slate-800/80 transition-all duration-300 flex flex-col z-20 backdrop-blur-md overflow-hidden`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center font-mono font-black text-slate-950 text-sm shadow-md shadow-emerald-500/10">
              OX
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
                ONYX-NEXUS
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI OS
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Otonom Yazılım Ajanı
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
            Çekirdek Modüller
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-slate-100 font-medium shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div
                  className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate font-medium">{item.label}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info: One-click Colab & GitHub */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2 bg-slate-950/40">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Network className="w-3.5 h-3.5" /> Colab Mesh Düğümleri
              </span>
              <span className="text-[10px] font-mono text-emerald-400">5/5 Aktif</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              3D Studio & MCP Hub hazır.
            </div>
          </div>

          <a
            href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Deposu (main)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 min-w-0 overflow-hidden">
        
        {/* Sleek Top Navigation Bar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                title="Menüyü Aç"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold hidden sm:inline">ONYX-Nexus</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-emerald-400 font-medium">3D Render Studio</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-purple-400 hidden sm:inline">Universal MCP Hub</span>
            </div>
          </div>

          {/* Quick Tab Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs font-medium overflow-x-auto max-w-full">
            {[
              { id: 'chat' as MainTab, label: 'Chat' },
              { id: 'mesh' as MainTab, label: 'Colab Mesh' },
              { id: 'studio3d' as MainTab, label: '3D Studio' },
              { id: 'mcp' as MainTab, label: 'MCP Hub' },
              { id: 'autonomous' as MainTab, label: 'Konsensüs' },
              { id: 'sandbox' as MainTab, label: 'Sandbox' },
              { id: 'arch' as MainTab, label: 'Mimari' },
              { id: 'tools' as MainTab, label: 'Tanılama' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] font-mono shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' && <ChatInterface />}

          {activeTab === 'mesh' && <ColabMeshMonitor />}

          {activeTab === 'studio3d' && (
            <div className="h-full overflow-y-auto w-full">
              <ThreeDStudioPanel />
            </div>
          )}

          {activeTab === 'mcp' && (
            <div className="h-full overflow-y-auto w-full">
              <McpConnectHub />
            </div>
          )}

          {activeTab === 'autonomous' && (
            <div className="h-full overflow-y-auto w-full">
              <SystemAutonomousHub />
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="h-full overflow-y-auto w-full">
              <PolyglotSandbox />
            </div>
          )}

          {activeTab === 'arch' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
              <ArchitectureVisualizer />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="h-full flex flex-col bg-slate-950">
              {/* Tool sub-navigation header */}
              <div className="h-12 border-b border-slate-800/80 px-6 flex items-center gap-2 bg-slate-900/40 shrink-0">
                <span className="text-xs text-slate-400 font-mono mr-2">Modül Seçin:</span>
                <button
                  onClick={() => setActiveToolSubTab('web3')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeToolSubTab === 'web3'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Web3 Denetçisi
                </button>
                <button
                  onClick={() => setActiveToolSubTab('diag')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeToolSubTab === 'diag'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> Sistem Tanılama & Env
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
                {activeToolSubTab === 'web3' && <Web3AuditorPanel />}
                {activeToolSubTab === 'diag' && <DiagnosticPanel />}
              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
