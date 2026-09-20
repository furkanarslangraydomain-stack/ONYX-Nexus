import { useState } from 'react';
import { MCP_TOOLS_LIST } from '../data/architectureData';
import {
  Wrench,
  Database,
  Terminal,
  ShieldAlert,
  GitBranch,
  Server,
  Copy,
  Check,
  Code2
} from 'lucide-react';

export function MegaMcpView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'Tüm Araçlar (36+)', icon: Wrench },
    { id: 'filesystem', label: 'Dosya Sistemi (fs)', icon: Code2 },
    { id: 'database', label: 'SQLite WAL (db)', icon: Database },
    { id: 'sandbox', label: 'Sandbox / Piston', icon: Terminal },
    { id: 'security', label: 'Güvenlik & ZK', icon: ShieldAlert },
    { id: 'git', label: 'Git & Sürüm', icon: GitBranch },
    { id: 'server', label: 'Colab Sunucu', icon: Server }
  ];

  const filteredTools = MCP_TOOLS_LIST.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  );

  const copyToolJson = (tool: typeof MCP_TOOLS_LIST[0], idx: number) => {
    const jsonRpcPayload = JSON.stringify({
      jsonrpc: "2.0",
      method: "mcp_call_tool",
      params: {
        name: tool.name,
        arguments: tool.inputParams.reduce((acc, curr) => {
          const key = curr.split(':')[0].trim();
          return { ...acc, [key]: "..." };
        }, {})
      },
      id: 1
    }, null, 2);

    navigator.clipboard.writeText(jsonRpcPayload);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  Universal Mega MCP Server (36+ Dahili Araç)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Model Context Protocol JSON-RPC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cursor, Claude Desktop, Windsurf ve VS Code gibi modern AI araçlarıyla tam uyumlu çalışan standart MCP uç noktası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Uygulama: <code className="text-amber-300">mega_mcp_server.py</code></span>
          </div>
        </div>

        {/* Client Compatibility Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Uyumlu İstemciler:</span>
          {['Cursor AI', 'Claude Desktop', 'Windsurf Editor', 'VS Code (Continue / Roo)', 'JetBrains'].map((client, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
              {client}
            </span>
          ))}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-md'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-amber-300">
                  {tool.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                  {tool.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {tool.description}
              </p>

              {/* Params */}
              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Parametreler:
                </span>
                {tool.inputParams.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {tool.inputParams.map((p, i) => (
                      <code key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {p}
                      </code>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">Parametresiz</span>
                )}
              </div>
            </div>

            {/* Footer return & copy action */}
            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500 truncate max-w-[170px]">
                Dönüş: <span className="text-slate-300">{tool.returnType}</span>
              </div>
              <button
                onClick={() => copyToolJson(tool, idx)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition shrink-0"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    JSON-RPC
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
