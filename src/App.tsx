import React, { useState } from 'react';
import {
  MessageSquare,
  Network,
  Code2,
  Layers,
  Sparkles,
  Shield,
  Box,
  Github,
  Menu,
  X,
  Server,
  Wrench,
  ArrowLeft,
  ChevronRight,
  Plus,
  Compass,
  Cpu,
  Coins
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
import { CONFIGURED_AGENTS } from './config/agentsAndWorkflows';
import { MainTab } from './types';

type ToolSubTab = 'web3' | 'diag';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('chat');
  const [activeToolSubTab, setActiveToolSubTab] = useState<ToolSubTab>('web3');
  const [showAgentsSheet, setShowAgentsSheet] = useState(false);

  const studioItems = [
    {
      id: 'mesh' as MainTab,
      label: 'Colab Mesh Ağı',
      desc: '5 Düğümlü P2P Kümesi & Cloudflare Tünel',
      icon: Network,
      badge: '5 Node',
      color: 'text-cyan-400'
    },
    {
      id: 'studio3d' as MainTab,
      label: '3D Render Studio',
      desc: 'WebGL, PBR Işıklandırma, Sahne Motoru',
      icon: Box,
      badge: '3D Studio',
      color: 'text-blue-400'
    },
    {
      id: 'mcp' as MainTab,
      label: 'Universal MCP Hub',
      desc: 'Cursor, Claude, VSCode, Windsurf Entegrasyonu',
      icon: Server,
      badge: '8+ IDE',
      color: 'text-purple-400'
    },
    {
      id: 'autonomous' as MainTab,
      label: 'Model Havuzu & Konsensüs',
      desc: '3-Ajan Karar Matrisi & 145+ Model',
      icon: Sparkles,
      badge: '145+ Model',
      color: 'text-rose-400'
    },
    {
      id: 'sandbox' as MainTab,
      label: 'Çok Dilli Sandbox & QA',
      desc: 'Solidity, Rust, Go, Python, TypeScript',
      icon: Code2,
      badge: '6 Dil',
      color: 'text-amber-400'
    },
    {
      id: 'arch' as MainTab,
      label: 'Sistem Mimarisi',
      desc: 'İnteraktif Topoloji ve Karar Şeması',
      icon: Layers,
      badge: 'v3.0',
      color: 'text-indigo-400'
    },
    {
      id: 'tools' as MainTab,
      label: 'Web3 & Sistem Tanılama',
      desc: 'Akıllı Sözleşme & Ortam Bilgisi',
      icon: Shield,
      badge: 'Web3',
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0d14] text-slate-100 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* Gemini Minimalist Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } shrink-0 bg-[#0e121a]/95 border-r border-slate-800/80 transition-all duration-300 flex flex-col z-30 backdrop-blur-xl overflow-hidden`}
      >
        {/* Gemini Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-[1px] shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
                ONYX-NEXUS
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Gemini
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Otonom AI İşletim Sistemi
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition"
            title="Menüyü Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini "+ Yeni Sohbet" Action Button */}
        <div className="p-3 border-b border-slate-800/60">
          <button
            onClick={() => setActiveTab('chat')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/70 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-white shadow-sm transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Yeni Sohbet Başlat</span>
          </button>
        </div>

        {/* Navigation / Navigation Lists */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* Main Conversational Hub */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
              Birincil Arayüz
            </div>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/10 text-white font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeTab === 'chat' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/60 text-slate-400'
              }`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">Gemini Sohbet & Ajan</div>
                <div className="text-[10px] text-slate-500 truncate">Sıfır Maliyetli Model Havuzu</div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                Canlı
              </span>
            </button>
          </div>

          {/* Agents Quick List Trigger */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold flex items-center justify-between">
              <span>Uzman Ajanlar ({CONFIGURED_AGENTS.length})</span>
            </div>
            <div className="space-y-1">
              {CONFIGURED_AGENTS.slice(0, 5).map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition cursor-default"
                >
                  <span className="text-xs">{agent.avatar}</span>
                  <span className="truncate flex-1">{agent.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
              <button
                onClick={() => setShowAgentsSheet(!showAgentsSheet)}
                className="w-full text-center text-[10px] font-mono text-cyan-400 hover:text-cyan-300 py-1"
              >
                {showAgentsSheet ? 'Daha Az Göster' : 'Tüm 9 Ajanı Gör →'}
              </button>
              {showAgentsSheet && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  {CONFIGURED_AGENTS.slice(5).map(agent => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition cursor-default"
                    >
                      <span className="text-xs">{agent.avatar}</span>
                      <span className="truncate flex-1">{agent.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Studios & Tools */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
              Gelişmiş Stüdyolar
            </div>

            <div className="space-y-1">
              {studioItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                      isActive
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : 'text-slate-400'}`} />
                    <span className="text-xs truncate flex-1">{item.label}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Privacy & Repo */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>ZK-Privacy Shield</span>
            </span>
            <span className="text-emerald-400 font-semibold">%100 Kör</span>
          </div>

          <a
            href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white transition font-mono text-[10px]"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="truncate flex-1">ONYX-Nexus GitHub Deposu</span>
          </a>
        </div>
      </aside>

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Minimalist Top App Header */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/60 bg-[#0a0d14]/90 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
                title="Menüyü Aç"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {activeTab !== 'chat' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Gemini Sohbetine Dön</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {studioItems.find(s => s.id === activeTab)?.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">ONYX-Nexus</span>
                <span className="text-xs text-slate-500 font-mono">• Gemini 2.5 Flash / Pro Modu</span>
              </div>
            )}
          </div>

          {/* Quick Studio Launcher Pills */}
          <div className="flex items-center gap-2">
            {activeTab === 'chat' && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('studio3d')}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  🎨 3D Studio
                </button>
                <button
                  onClick={() => setActiveTab('mesh')}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  🌐 Colab Mesh
                </button>
                <button
                  onClick={() => setActiveTab('mcp')}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  🔌 MCP Hub
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sıfır Maliyet LLM</span>
            </div>
          </div>
        </header>

        {/* Tab Content Renderer */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'mesh' && <ColabMeshMonitor />}
          {activeTab === 'studio3d' && <ThreeDStudioPanel />}
          {activeTab === 'mcp' && <McpConnectHub />}
          {activeTab === 'autonomous' && <SystemAutonomousHub />}
          {activeTab === 'sandbox' && <PolyglotSandbox />}
          {activeTab === 'arch' && <ArchitectureVisualizer />}
          {activeTab === 'tools' && (
            <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
              <div className="h-12 border-b border-slate-800/80 px-6 flex items-center gap-4 bg-slate-900/60 shrink-0">
                <button
                  onClick={() => setActiveToolSubTab('web3')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    activeToolSubTab === 'web3'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Web3 & EVM Akıllı Sözleşme Denetimi
                </button>
                <button
                  onClick={() => setActiveToolSubTab('diag')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    activeToolSubTab === 'diag'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sistem & Ortam Tanılama
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeToolSubTab === 'web3' ? <Web3AuditorPanel /> : <DiagnosticPanel />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
