import { useState } from 'react';
import {
  ARCHITECTURE_LAYERS,
  ARCHITECTURE_NODES
} from '../data/architectureData';
import { ArchitectureLayerId, ArchitectureNode } from '../types';
import {
  Server,
  Smartphone,
  ShieldAlert,
  Lock,
  Compass,
  Building2,
  Code,
  CheckCircle2,
  GraduationCap,
  Coins,
  GitBranch,
  FileText,
  Terminal,
  Users,
  Box,
  Database,
  Cpu,
  Wrench,
  ArrowDown,
  Sparkles,
  ExternalLink,
  Layers,
  Search
} from 'lucide-react';

interface TopologyDiagramProps {
  onSelectNode: (node: ArchitectureNode) => void;
  selectedNodeId?: string;
}

export function TopologyDiagram({ onSelectNode, selectedNodeId }: TopologyDiagramProps) {
  const [selectedLayer, setSelectedLayer] = useState<ArchitectureLayerId | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'Lock': return <Lock className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Code': return <Code className="w-4 h-4" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Coins': return <Coins className="w-4 h-4" />;
      case 'GitBranch': return <GitBranch className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Server': return <Server className="w-4 h-4" />;
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Box': return <Box className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Wrench': return <Wrench className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const filteredLayers = ARCHITECTURE_LAYERS.filter(layer => 
    selectedLayer === 'all' || layer.id === selectedLayer
  );

  const isConnected = (nodeId: string) => {
    if (!hoveredNodeId && !selectedNodeId) return false;
    const activeId = hoveredNodeId || selectedNodeId;
    const activeNode = ARCHITECTURE_NODES.find(n => n.id === activeId);
    if (!activeNode) return false;
    return activeNode.connections.includes(nodeId) || 
      ARCHITECTURE_NODES.find(n => n.id === nodeId)?.connections.includes(activeId || '');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLayer('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedLayer === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tüm Katmanlar (5)
          </button>
          {ARCHITECTURE_LAYERS.map(layer => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap flex items-center gap-1.5 border ${
                selectedLayer === layer.id
                  ? 'bg-slate-800 text-white font-semibold border-cyan-400 shadow-md'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
              {layer.nameTr.split('.')[1]?.trim() || layer.nameTr}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Düğüm, port veya servis ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Layer Stack with Animated Connectors */}
      <div className="space-y-5">
        {filteredLayers.map((layer, index) => {
          const layerNodes = ARCHITECTURE_NODES.filter(
            n => n.layerId === layer.id &&
            (searchTerm === '' || 
              n.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              n.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
              n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (n.port && n.port.toString().includes(searchTerm)) ||
              n.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          );

          return (
            <div key={layer.id} className="relative">
              {/* Connector between layers */}
              {index > 0 && selectedLayer === 'all' && (
                <div className="flex items-center justify-center my-2">
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400">
                    <ArrowDown className="w-3 h-3 animate-bounce" />
                    <span>Gömülü REST / SSE & SSH Tünel Köprüsü</span>
                  </div>
                </div>
              )}

              {/* Layer Container */}
              <div 
                className={`rounded-2xl border ${layer.borderColor} bg-slate-900/40 p-5 backdrop-blur transition-all duration-300 relative overflow-hidden`}
              >
                {/* Background ambient gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${layer.bgGradient} opacity-40 pointer-events-none`} />

                {/* Layer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                      style={{ backgroundColor: `${layer.color}20`, color: layer.color, border: `1px solid ${layer.color}40` }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                          {layer.nameTr}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                          {layer.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-3xl">
                        {layer.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {layerNodes.length} Bileşen / Düğüm
                  </span>
                </div>

                {/* Nodes Grid */}
                {layerNodes.length === 0 ? (
                  <div className="py-6 text-center text-xs font-mono text-slate-500">
                    Arama kriterine uyan bileşen bulunamadı.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
                    {layerNodes.map(node => {
                      const isSelected = selectedNodeId === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const highlighted = isConnected(node.id);

                      return (
                        <div
                          key={node.id}
                          onClick={() => onSelectNode(node)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`group cursor-pointer rounded-xl p-3.5 transition-all duration-200 border text-left relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                              : highlighted
                              ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50'
                              : isHovered
                              ? 'bg-slate-800/80 border-slate-700 shadow-md'
                              : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          {/* Header */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${layer.color}15`, color: layer.color }}
                                >
                                  {getIcon(node.iconName)}
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300 transition">
                                  {node.name}
                                </span>
                              </div>

                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                                node.status === 'ONLINE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : node.status === 'ACTIVE'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}>
                                {node.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                              {node.summary}
                            </p>
                          </div>

                          {/* Footer details */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span className="truncate">
                              {node.port ? `Port: ${node.port}` : node.techStack[0]}
                            </span>
                            <span className="text-cyan-400 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition shrink-0">
                              İncele <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>

                          {/* Connected indicator tag */}
                          {highlighted && (
                            <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[9px] font-mono font-bold shadow">
                              Bağlı
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Highlights Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Toplam Katman</div>
          <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">5 Katmanlı Topoloji</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kullanıcıdan FTS5 WAL'a</div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Sürü Ajanları</div>
          <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">9 Uzman Ajan</div>
          <div className="text-[10px] text-slate-400 mt-0.5">%85 Konsensüs Eşiği</div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Colab SSH Sunucusu</div>
          <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">Tek Hücre & Gömülü</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Port 8000 & tmate SSH</div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Model ve MCP</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">30+ LLM & 36+ Araç</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&lt; 2.5ms Dinamik Failover</div>
        </div>
      </div>
    </div>
  );
}
