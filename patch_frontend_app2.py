content = """import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-3">
          <button className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Plus className="w-4 h-4" /> Yeni Sohbet
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2">Kayıtlı İşlemler</div>
          <div className="px-2 text-[10px] text-slate-600">Geçmiş sqlite'dan yükleniyor...</div>
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
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Mega MCP</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden relative">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}
"""

with open("src/App.tsx", "w") as f:
    f.write(content)
