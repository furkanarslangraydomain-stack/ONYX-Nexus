import React, { useState } from 'react';
import { Plus, MessageSquare, Cpu, Activity, Shield, Box, Code2, Network, Layers } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { ColabControlCenter } from './components/ColabControlCenter';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { Web3AuditorPanel } from './components/Web3AuditorPanel';
import { ThreeDStudioPanel } from './components/ThreeDStudioPanel';
import { PolyglotSandbox } from './components/PolyglotSandbox';
import { SystemAutonomousHub } from './components/SystemAutonomousHub';
import { ArchitectureVisualizer } from './components/ArchitectureVisualizer';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'arch' | 'sandbox' | 'autonomous' | 'colab' | 'web3' | '3d' | 'diag'>('chat');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-3">
          <button 
            onClick={() => setActiveTab('chat')}
            className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Sohbet
          </button>
        </div>
        <div className="p-3 pt-0 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 px-2">Modüller</div>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'chat' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Ajan Sohbet & Terminal
          </button>
          <button
            onClick={() => setActiveTab('arch')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'arch' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Mimari Şeması & Topoloji
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'sandbox' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" /> Çok Dilli Sandbox & QA
          </button>
          <button
            onClick={() => setActiveTab('autonomous')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'autonomous' ? 'bg-slate-800 text-rose-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" /> Sistem & Otonom Ajan Hub
          </button>
          <button
            onClick={() => setActiveTab('colab')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'colab' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> Colab Kontrol & Dosyalar
          </button>
          <button
            onClick={() => setActiveTab('web3')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'web3' ? 'bg-slate-800 text-purple-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" /> Web3 Sözleşme Denetçisi
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === '3d' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" /> 3D Sahne Stüdyosu
          </button>
          <button
            onClick={() => setActiveTab('diag')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === 'diag' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Sistem Tanılama & Ortam
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 border-t border-slate-800/60">
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2">Aktif Mimari Özellikleri</div>
          <div className="px-2 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex items-center gap-1 text-emerald-400">✓ SQLite WAL FTS5 aktif</div>
            <div className="flex items-center gap-1 text-indigo-400">✓ 3-Ajan Konsensüs hazır</div>
            <div className="flex items-center gap-1 text-amber-400">✓ Polyglot 6 dil derleyici</div>
            <div className="flex items-center gap-1 text-cyan-400">✓ 5-Node Colab Mesh hazır</div>
            <div className="flex items-center gap-1 text-rose-400">✓ GitHub CI/CD aktif (PAT)</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="font-mono font-bold text-slate-200 flex items-center gap-2">
              <span className="text-emerald-400">Onyx-Nexus</span> 
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Mega MCP v3</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'chat' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sohbet
            </button>
            <button
              onClick={() => setActiveTab('arch')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'arch' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mimari
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'sandbox' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => setActiveTab('autonomous')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'autonomous' ? 'bg-slate-800 text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Otonom Hub
            </button>
            <button
              onClick={() => setActiveTab('colab')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'colab' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Colab
            </button>
            <button
              onClick={() => setActiveTab('web3')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'web3' ? 'bg-slate-800 text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Web3
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === '3d' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setActiveTab('diag')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'diag' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tanılama
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'arch' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
              <ArchitectureVisualizer />
            </div>
          )}
          {activeTab === 'sandbox' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
              <PolyglotSandbox />
            </div>
          )}
          {activeTab === 'autonomous' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
              <SystemAutonomousHub />
            </div>
          )}
          {activeTab === 'colab' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
              <ColabControlCenter />
            </div>
          )}
          {activeTab === 'web3' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
              <Web3AuditorPanel />
            </div>
          )}
          {activeTab === '3d' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
              <ThreeDStudioPanel />
            </div>
          )}
          {activeTab === 'diag' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
              <DiagnosticPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
