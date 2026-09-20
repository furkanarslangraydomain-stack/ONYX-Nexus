import { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  FileCode,
  Users,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'agent' | 'file' | 'database' | 'memory' | 'concept';
  x: number;
  y: number;
  connections: string[];
  description: string;
  meta: string;
}

const INITIAL_NODES: GraphNode[] = [
  // Agents
  { id: 'agent-router', label: 'Nexus Router', type: 'agent', x: 200, y: 150, connections: ['agent-architect', 'agent-sentinel', 'fts5-memory'], description: 'Gelen istemleri analiz edip uygun ajana yönlendirir', meta: 'Model: DeepSeek-V3' },
  { id: 'agent-architect', label: 'Master Architect', type: 'agent', x: 380, y: 120, connections: ['agent-polyglot', 'agent-qa', 'core-topology'], description: 'SOLID ve Clean mimari standartlarını denetler', meta: 'Konsensüs Payı: %35' },
  { id: 'agent-polyglot', label: 'Polyglot Dev', type: 'agent', x: 550, y: 180, connections: ['agent-qa', 'colab-daemon', 'file-server'], description: 'TypeScript, Python ve C++ kod üretim motoru', meta: 'Konsensüs Payı: %30' },
  { id: 'agent-sentinel', label: 'Sentinel Security', type: 'agent', x: 230, y: 280, connections: ['agent-router', 'zk-shield', 'file-security'], description: 'Zero-Knowledge maskeleme ve prompt enjeksiyon kalkanı', meta: 'SHA-256 HMAC' },
  { id: 'agent-qa', label: 'QA Test Runner', type: 'agent', x: 420, y: 300, connections: ['agent-polyglot', 'github-cicd', 'fts5-memory'], description: 'Birim testleri ve konsensüs doğrulama motoru', meta: 'Konsensüs Payı: %35' },
  { id: 'agent-devops', label: 'DevOps & Git', type: 'agent', x: 620, y: 320, connections: ['github-cicd', 'colab-daemon'], description: 'Otomatik Git commit, PR ve deploy yöneticisi', meta: 'CI/CD Pipeline' },

  // System Files & Core
  { id: 'core-topology', label: 'Topology Engine', type: 'file', x: 380, y: 40, connections: ['agent-architect'], description: '5 katmanlı sistem topolojisi ve yönlendirme şeması', meta: 'src/TopologyDiagram.tsx' },
  { id: 'file-server', label: 'Colab SSH Bridge', type: 'file', x: 700, y: 180, connections: ['colab-daemon', 'agent-polyglot'], description: 'Port 8000 gömülü istemci ve tmate tünel arayüzü', meta: 'src/ColabSshServerView.tsx' },
  { id: 'zk-shield', label: 'ZK Privacy Shield', type: 'file', x: 120, y: 380, connections: ['agent-sentinel'], description: 'Client-side veri anonimleştirme ve maskeleme modülü', meta: 'src/SecurityShieldView.tsx' },
  { id: 'github-cicd', label: 'GitHub Auto-Deploy', type: 'file', x: 600, y: 440, connections: ['agent-devops', 'agent-qa'], description: 'Git push, pull request ve CI/CD otomasyonu', meta: 'src/GithubCiCdView.tsx' },

  // Database & Memory
  { id: 'fts5-memory', label: 'SQLite FTS5 WAL', type: 'database', x: 340, y: 440, connections: ['agent-qa', 'agent-router', 'memory-embeddings'], description: 'Lock-Free eşzamanlı tam metin arama ve semantik hafıza', meta: 'FTS5 Full-Text Search' },
  { id: 'memory-embeddings', label: 'Semantic Vectors', type: 'memory', x: 220, y: 490, connections: ['fts5-memory'], description: 'Kod parçacıkları ve ajan diyaloglarının 1536-boyutlu vektörleri', meta: 'Cos-Sim ≥ 0.88' },
  { id: 'colab-daemon', label: 'Colab T4 Daemon', type: 'concept', x: 740, y: 290, connections: ['file-server', 'agent-devops'], description: 'NVIDIA Tesla T4 GPU üzerinde çalışan FastAPI servisi', meta: 'CUDA 12.2 • 15.8GB' }
];

export function KnowledgeGraphView() {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [zoom, setZoom] = useState(1);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || n.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [nodes, searchQuery, filterType]);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'agent': return { bg: '#6366f1', border: '#818cf8', text: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.4)' };
      case 'file': return { bg: '#06b6d4', border: '#22d3ee', text: '#cffafe', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'database': return { bg: '#10b981', border: '#34d399', text: '#d1fae5', glow: 'rgba(16, 185, 129, 0.4)' };
      case 'memory': return { bg: '#a855f7', border: '#c084fc', text: '#f3e8ff', glow: 'rgba(168, 85, 247, 0.4)' };
      case 'concept': return { bg: '#f59e0b', border: '#fbbf24', text: '#fef3c7', glow: 'rgba(245, 158, 11, 0.4)' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">
                  SQLite FTS5 Anlamsal Bilgi Grafiği & Bellek
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Canlı Vektör Ağı
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                9 Ajan, kaynak dosyalar, SQLite WAL hafızası ve Colab GPU arasındaki anlamsal bağıntılar
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              13 Düğüm Aktif
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              FTS5: 18 Bağıntı
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Düğüm, dosya veya ajan ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'agent', label: 'Ajanlar' },
              { id: 'file', label: 'Kaynak Kod' },
              { id: 'database', label: 'Veritabanı' },
              { id: 'memory', label: 'Vektörler' },
              { id: 'concept', label: 'Donanım/GPU' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  filterType === t.id
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Uzaklaş"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Yakınlaş"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Sıfırla"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Stage */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800/90 rounded-2xl relative overflow-hidden h-[540px] shadow-2xl flex flex-col">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            viewBox="0 0 900 600"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
          >
            {/* Draw Connections */}
            <g className="connections">
              {nodes.map(node =>
                node.connections.map(targetId => {
                  const target = nodes.find(n => n.id === targetId);
                  if (!target) return null;
                  const isHighlighted = selectedNode && (selectedNode.id === node.id || selectedNode.id === target.id);

                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#818cf8' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      strokeDasharray={isHighlighted ? '4,4' : undefined}
                      className={isHighlighted ? 'animate-pulse' : ''}
                    />
                  );
                })
              )}
            </g>

            {/* Draw Nodes */}
            <g className="nodes">
              {nodes.map(node => {
                const colors = getNodeColor(node.type);
                const isSelected = selectedNode?.id === node.id;
                const isFilteredOut = !filteredNodes.some(fn => fn.id === node.id);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isFilteredOut ? 0.25 : 1}
                  >
                    {/* Outer Glow Halo if selected */}
                    {isSelected && (
                      <circle
                        r="32"
                        fill="none"
                        stroke={colors.border}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    {/* Node Body Circle */}
                    <circle
                      r={isSelected ? '24' : '20'}
                      fill={colors.bg}
                      stroke={isSelected ? '#ffffff' : colors.border}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
                      className="transition-all"
                    />

                    {/* Node Text Label */}
                    <text
                      y="36"
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : '500'}
                      className="select-none pointer-events-none"
                    >
                      {node.label}
                    </text>

                    {/* Sub meta label */}
                    <text
                      y="48"
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      className="select-none pointer-events-none"
                    >
                      {node.type.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend in canvas */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 text-[10px] font-mono backdrop-blur-md">
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Ajan
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Kaynak Dosya
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> SQLite WAL
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Vektör
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> GPU/Donanım
            </span>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
                  <span>DÜĞÜM DETAYLARI</span>
                  <span className="text-indigo-400">{selectedNode.type}</span>
                </div>
                <h3 className="text-base font-bold font-mono text-white mt-1">
                  {selectedNode.label}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedNode.meta}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {selectedNode.description}
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-2">
                  Bağlantılı Varlıklar ({selectedNode.connections.length}):
                </span>
                <div className="space-y-1.5">
                  {selectedNode.connections.map(targetId => {
                    const target = nodes.find(n => n.id === targetId);
                    if (!target) return null;
                    return (
                      <button
                        key={targetId}
                        onClick={() => setSelectedNode(target)}
                        className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 flex items-center justify-between transition group"
                      >
                        <span className="truncate group-hover:text-indigo-300">{target.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
                <div>FTS5 Index: OK (BM25 Skor: 0.94)</div>
                <div>Bellek Bellek İmzası: SHA-256</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              İncelemek için bir düğüme tıklayın
            </div>
          )}

          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-slate-400 font-mono flex items-start gap-2 mt-4">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>FTS5 tam metin indeksleyicisi, her kod değişikliğinde düğüm ağırlıklarını ve benzerlik matrisini anlık günceller.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
