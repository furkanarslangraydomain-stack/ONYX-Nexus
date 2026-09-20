import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Code2, 
  Box, 
  Database, 
  GitBranch, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles,
  Network
} from 'lucide-react';

interface NodeDetail {
  id: string;
  name: string;
  category: 'core' | 'agents' | 'sandbox' | 'mesh' | 'storage';
  status: 'ONLINE' | 'ACTIVE' | 'READY';
  description: string;
  responsibilities: string[];
  techStack: string[];
  connections: string[];
}

const ARCHITECTURE_NODES: NodeDetail[] = [
  {
    id: 'frontend',
    name: 'React 18 + Vite Arayüzü',
    category: 'core',
    status: 'ONLINE',
    description: 'Kullanıcı etkileşimlerini yöneten, gerçek zamanlı WebSocket ve REST kanallarına sahip tek sayfa web arayüzü.',
    responsibilities: [
      'Canlı Ajan Sohbeti & Terminal Akışı',
      'Çok Dilli Kod Sandbox & Otomatik Test',
      'Web3 Güvenlik Denetim Arayüzü',
      'İnteraktif 3D Render & GLSL Stüdyosu',
      'Colab Kontrol & Mesh Ağı Yönetimi'
    ],
    techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Three.js'],
    connections: ['orchestrator', 'mesh_cluster']
  },
  {
    id: 'orchestrator',
    name: 'Onyx-Nexus Master Orchestrator',
    category: 'core',
    status: 'ONLINE',
    description: 'Tüm sistem isteklerini koordine eden, model yönlendirmesi yapan ve API uç noktalarını sunan merkezi FastAPI çekirdeği.',
    responsibilities: [
      'Gelen komut ve sorguları akıllı yönlendirme (Smart Model Router)',
      '5 Farklı Açık Kaynak API Havuzunu yük dengeleme',
      'WebSocket Canlı Terminal oturumları sağlama',
      'Mega MCP (36+ Araç) protokol aracılığı'
    ],
    techStack: ['Python 3.10+', 'FastAPI', 'Uvicorn', 'Httpx (HTTP/2 Connection Pooling)'],
    connections: ['swarm_engine', 'polyglot_sandbox', 'web3_auditor', 'db_storage', 'git_agent']
  },
  {
    id: 'swarm_engine',
    name: 'Akıllı Konsensüs Swarm (3-Ajan)',
    category: 'agents',
    status: 'ACTIVE',
    description: 'Yazılan kodları ve mimari kararları 3 aşamalı ortak karar matrisi ile doğrulayan sürü motoru.',
    responsibilities: [
      'Aşama 1: Baş Mimar (Lead Architect) modülerlik ve tasarım uyumu',
      'Aşama 2: Web3 & Sistem Güvenlik Uzmanı zaafiyet taraması',
      'Aşama 3: QA & Test Uzmanı (QA Tester) Foundry/PyTest doğrulama',
      'Konsensüs skoru hesaplama (%85 üzeri üretim onayı)'
    ],
    techStack: ['Swarm Engine v3', 'Multi-Agent Debate Protocol', 'JSON-RPC Decision Matrix'],
    connections: ['orchestrator', 'polyglot_sandbox', 'web3_auditor']
  },
  {
    id: 'polyglot_sandbox',
    name: 'Çok Dilli Sandbox & Test Jeneratörü',
    category: 'sandbox',
    status: 'READY',
    description: 'Solidity, Rust, Go, C++20, TypeScript ve Python kodlarını derleyen, AST denetleyen ve hata onaran motor.',
    responsibilities: [
      'Solidity solc & Hardhat EVM simülasyonu',
      'Rust Cargo / rustc borrow checker doğrulaması',
      'Go 1.22 Runtime ve C++20 derleme kontrolleri',
      'Ajan Otomatik Onarım Döngüsü (Auto-Repair Loop)',
      'Foundry (Contract.t.sol) ve PyTest birim test jeneratörü'
    ],
    techStack: ['solc 0.8.24', 'rustc 1.77', 'Go 1.22', 'g++-13', 'Node 20', 'CPython 3.10'],
    connections: ['swarm_engine', 'orchestrator']
  },
  {
    id: 'web3_auditor',
    name: 'Web3 Akıllı Sözleşme Denetçisi',
    category: 'sandbox',
    status: 'READY',
    description: 'EVM akıllı sözleşmelerindeki reentrancy, tx.origin, integer overflow ve gas optimizasyonu zaafiyetlerini tarayan uzman motor.',
    responsibilities: [
      'SWC-107 (Reentrancy) ve SWC-115 (tx.origin) tespiti',
      'Checks-Effects-Interactions (CEI) model doğrulaması',
      'Gas optimizasyonu ve depolama alanı düzenleme tavsiyeleri',
      'Otomatik düzeltilmiş güvenli kod üretimi'
    ],
    techStack: ['Solidity AST Analyzer', 'EVM Opcode Heuristics', 'Security Score Matrix'],
    connections: ['swarm_engine', 'orchestrator']
  },
  {
    id: 'threed_studio',
    name: 'Gelişmiş 3D & GLSL Render Stüdyosu',
    category: 'core',
    status: 'ONLINE',
    description: 'Tarayıcıda procedürel Three.js sahneleri, PBR materyalleri, GLSL fragment/vertex shader hesaplamaları yapan grafik motoru.',
    responsibilities: [
      'Prosedürel Three.js sahne ve geometri üretimi',
      'GLSL Shader düzenleme ve gerçek zamanlı önizleme',
      'Işıklandırma, gölgeler ve kamera animasyon kontrolü',
      'JSON/HTML sahne dışa aktarma'
    ],
    techStack: ['Three.js r128+', 'WebGL 2.0', 'GLSL 300 es', 'OrbitControls'],
    connections: ['frontend', 'orchestrator']
  },
  {
    id: 'mesh_cluster',
    name: '5-Node Dağıtık Colab Mesh Kümesi',
    category: 'mesh',
    status: 'ONLINE',
    description: 'İş yükünü 5 bağımsız düğüme paylaştıran, kesintisiz çalışan dağıtık Colab küme mimarisi.',
    responsibilities: [
      'Node 1: Master Orchestrator (Port 8000)',
      'Node 2: Polyglot Sandbox & AST Compiler (Port 8001)',
      'Node 3: Consensus Swarm & Deep Research (Port 8002)',
      'Node 4: 3D Render Studio Engine (Port 8003)',
      'Node 5: Distributed Vector DB & FTS5 Hub (Port 8004)'
    ],
    techStack: ['Colab Mesh Protocol', 'HTTP/2 IPC', 'Zero-Wait Failover'],
    connections: ['orchestrator', 'db_storage']
  },
  {
    id: 'db_storage',
    name: 'SQLite WAL + FTS5 & Vector DB Katmanı',
    category: 'storage',
    status: 'ONLINE',
    description: '12 GB RAM sınırına uygun, FTS5 tam metin arama ve hafif vektör bellek sıkıştırmasına sahip depolama.',
    responsibilities: [
      'SQLite Write-Ahead Logging (WAL) ile kilitsiz okuma/yazma',
      'FTS5 indeksleme ile anında sohbet ve kod araması',
      'Lightweight Vector DB ile 8K token bağlam sıkıştırması',
      'Notion Reporter ile dış raporlama entegrasyonu'
    ],
    techStack: ['SQLite 3.40+', 'WAL Mode', 'FTS5 Virtual Table', 'Context Compactor'],
    connections: ['orchestrator', 'swarm_engine']
  },
  {
    id: 'git_agent',
    name: 'GitHub CI/CD & Akıllı Commit Otomasyonu',
    category: 'core',
    status: 'ONLINE',
    description: 'Üretilen kodları ve mimari değişiklikleri semantic commit mesajlarıyla doğrudan GitHub reposuna push eden CI/CD ajanı.',
    responsibilities: [
      'Otomatik git add, commit ve push işlemleri',
      'Personal Access Token (PAT) güvenli kimlik doğrulama',
      'Conventional Commits (feat, fix, refactor) standardı',
      'Branch oluşturma ve kod senkronizasyonu'
    ],
    techStack: ['Git CLI', 'GitHub REST API v3', 'AutoGitAgent'],
    connections: ['orchestrator']
  }
];

export function ArchitectureVisualizer() {
  const [selectedNode, setSelectedNode] = useState<NodeDetail>(ARCHITECTURE_NODES[1]);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'core' | 'agents' | 'sandbox' | 'mesh' | 'storage'>('all');

  const filteredNodes = activeFilter === 'all' 
    ? ARCHITECTURE_NODES 
    : ARCHITECTURE_NODES.filter(n => n.category === activeFilter);

  const copyMarkdown = () => {
    const text = `# ONYX-Nexus Mimari Şeması
- Master Orchestrator: FastAPI (Port 8000)
- 3-Ajan Konsensüs: Baş Mimar, Güvenlik Denetçisi, QA Tester
- Polyglot Sandbox: Solidity, Rust, Go, C++20, TypeScript, Python
- 5-Node Mesh Kümesi: Dağıtık Colab İş Yükü
- Depolama: SQLite WAL + FTS5 & Hafif Vektör Bellek
- CI/CD: Doğrudan GitHub Push Otomasyonu (PAT)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
                  ONYX-Nexus Mimari Şeması & Topoloji
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-medium">
                    v3.0 Production Ready
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Swarm motoru, 3 aşamalı konsensüs karar matrisi, çok dilli derleyici ve dağıtık mesh kümesi mimarisi
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Kopyalandı' : 'Özeti Kopyala'}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-500 mr-1">Katman Filtresi:</span>
          {(['all', 'core', 'agents', 'sandbox', 'mesh', 'storage'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {filter === 'all' && 'Tüm Düğümler'}
              {filter === 'core' && 'Çekirdek Sistem'}
              {filter === 'agents' && 'Ajan Konsensüsü'}
              {filter === 'sandbox' && 'Sandbox & Web3'}
              {filter === 'mesh' && 'Colab Mesh Kümesi'}
              {filter === 'storage' && 'Veri & Bellek'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Topology on Left, Node Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Nodes Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold px-1 flex items-center justify-between">
            <span>Sistem Düğümleri ({filteredNodes.length})</span>
            <span className="text-slate-500 font-normal">Ayrıntıları görmek için düğüme tıklayın</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {node.category === 'core' && <Server className="w-4 h-4 text-cyan-400" />}
                      {node.category === 'agents' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {node.category === 'sandbox' && <Code2 className="w-4 h-4 text-amber-400" />}
                      {node.category === 'mesh' && <Network className="w-4 h-4 text-purple-400" />}
                      {node.category === 'storage' && <Database className="w-4 h-4 text-blue-400" />}
                      <span className="font-mono text-xs font-bold text-slate-200 truncate">
                        {node.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      node.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      node.status === 'ACTIVE' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {node.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                    <span>{node.techStack[0]}</span>
                    <span className="text-indigo-400 flex items-center gap-1">
                      İncele <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Consensus Swarm Decision Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3 Aşamalı Konsensüs Karar Matrisi Akışı
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">1. Aşama</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Baş Mimar</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">SOLID & Modülerlik</div>
                <div className="text-[10px] text-slate-400 mt-1">Mimari uygunluk onayı</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">2. Aşama</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Güvenlik Denetçisi</div>
                <div className="text-[11px] text-amber-400 font-mono mt-1">Reentrancy & Bellek</div>
                <div className="text-[10px] text-slate-400 mt-1">Zaafiyet ve sızıntı taraması</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">3. Aşama</div>
                <div className="text-xs font-bold text-slate-200 mt-1">QA Tester</div>
                <div className="text-[11px] text-purple-400 font-mono mt-1">Foundry / PyTest</div>
                <div className="text-[10px] text-slate-400 mt-1">Test invariant ve dayanıklılık</div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-emerald-500/5 rounded border border-emerald-500/20 text-center text-xs font-mono text-emerald-400">
              Ortak Konsensüs Eşiği: ≥ %85 Onay → Otomatik Git Push & Canlı Derleme
            </div>
          </div>
        </div>

        {/* Selected Node Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                  Düğüm Detay Analizi
                </span>
                <h2 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {selectedNode.name}
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedNode.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Responsibilities */}
            <div className="mt-4">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Temel Sorumluluklar & Yetenekler:
              </h4>
              <ul className="space-y-1.5">
                {selectedNode.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Teknoloji Yığını:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.techStack.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-mono border border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Bağlantılı Düğümler */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Bağlı Olduğu Düğümler:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connections.map((connId, idx) => {
                  const target = ARCHITECTURE_NODES.find(n => n.id === connId);
                  return (
                    <button
                      key={idx}
                      onClick={() => target && setSelectedNode(target)}
                      className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded text-xs font-mono border border-indigo-500/30 flex items-center gap-1 transition"
                    >
                      <Share2 className="w-3 h-3 text-indigo-400" />
                      {target?.name || connId}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Architecture Quick Link */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Dosya: <code className="text-slate-300">ARCHITECTURE.md</code></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Senkronize
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
