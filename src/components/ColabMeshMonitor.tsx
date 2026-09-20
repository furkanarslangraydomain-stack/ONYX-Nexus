import React, { useState, useEffect } from 'react';
import {
  Network,
  Cpu,
  Activity,
  Globe,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap,
  HardDrive,
  Github
} from 'lucide-react';

interface MeshNode {
  node_id: number;
  name: string;
  port: number;
  role: string;
  status: 'ONLINE' | 'READY' | 'BUSY' | 'SYNCING';
  latency?: string;
  public_url?: string;
}

export const ColabMeshMonitor: React.FC = () => {
  const [nodes, setNodes] = useState<MeshNode[]>([
    { node_id: 1, name: 'Master Orchestrator', port: 8000, role: 'Ana Koordinatör & API Ağ Geçidi', status: 'ONLINE', latency: '2ms' },
    { node_id: 2, name: 'Polyglot Compiler Sandbox', port: 8001, role: 'EVM/Solidity, Rust & Go Derleyici', status: 'READY', latency: '4ms' },
    { node_id: 3, name: 'Consensus Swarm Engine', port: 8002, role: '3-Ajan Karar & Araştırma Matrisi', status: 'READY', latency: '6ms' },
    { node_id: 4, name: '3D Render Studio Engine', port: 8003, role: 'WebGL & Three.js Sahne Motoru', status: 'ONLINE', latency: '3ms' },
    { node_id: 5, name: 'Vector DB & FTS5 Hub', port: 8004, role: 'SQLite WAL & Hafıza Veritabanı', status: 'ONLINE', latency: '1ms' }
  ]);

  const [colabUrl, setColabUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchMeshStatus = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/mesh/nodes');
      const data = await res.json();
      if (data && data.nodes) {
        setNodes(data.nodes);
      }
    } catch (e) {
      console.warn('Mesh telemetrisi yerel modda:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  useEffect(() => {
    fetchMeshStatus();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const ONE_CLICK_BASH = `curl -sSL https://raw.githubusercontent.com/furkanarslangraydomain-stack/ONYX-Nexus/main/setup_colab_mesh.sh | bash`;
  const COLAB_URL = `https://colab.research.google.com/github/furkanarslangraydomain-stack/ONYX-Nexus/blob/main/colab_mesh_setup.ipynb`;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              COLAB MESH AĞI & TELEMETRİ
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                5 Düğüm Aktif
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Google Colab ve bulut ortamları için tek tıkla dağıtık ajan kümesi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={COLAB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tek Tıkla Colab'da Başlat
          </a>

          <a
            href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub Deposu
          </a>

          <button
            onClick={fetchMeshStatus}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Düğümleri Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        
        {/* Quick Connect & One Click Setup Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs mb-1">
                <Zap className="w-4 h-4" />
                <span>Tek Tıkla Hızlı Kurulum & Başlatma</span>
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Google Colab veya Terminalden 5-Düğümlü Ağı Başlatın
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Kurulum dosyaları otomatik olarak GitHub deposuna taşınmıştır. Tek bir bash komutuyla tüm bağımlılıklar, mikroservisler ve Cloudflare tüneli otomatik ayağa kalkar.
              </p>
            </div>

            <a
              href={COLAB_URL}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold text-xs shadow-lg shadow-orange-500/20 hover:opacity-95 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Colab Notebook'u Aç
            </a>
          </div>

          {/* Code snippet */}
          <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 truncate mr-2">{ONE_CLICK_BASH}</span>
            <button
              onClick={() => handleCopy(ONE_CLICK_BASH, 'bash')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
            >
              {copiedKey === 'bash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'bash' ? 'Kopyalandı' : 'Kopyala'}
            </button>
          </div>
        </div>

        {/* 5 Mesh Nodes Topology Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Mesh Kümesi Düğümleri (5 Aktif Mikroservis)
            </h4>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Dağıtık Senkronizasyon Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.node_id}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      DÜĞÜM 0{node.node_id} • PORT {node.port}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {node.status}
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    {node.name}
                  </h5>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {node.role}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> Gecikme: {node.latency || '2ms'}
                  </span>
                  <span className="text-slate-500">127.0.0.1:{node.port}</span>
                </div>
              </div>
            ))}

            {/* Mesh Architecture Summary Card */}
            <div className="bg-gradient-to-br from-cyan-950/20 to-indigo-950/20 border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400">MİMARİ YETENEĞİ</span>
                <h5 className="text-sm font-semibold text-slate-100 mt-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Sıfır Maliyet & P2P Mesh
                </h5>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Colab oturumları arasında SQLite WAL kilit koruması ve Cloudflare Tüneli ile kesintisiz veri aktarımı sağlanır.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span>FTS5 Concurrency</span>
                <span>Aktif (WAL Modu)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remote Gateway Connector */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Harici Colab URL Bağlantısı</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Colab'daki Cloudflare tünel adresini buraya girerek web arayüzünü doğrudan Colab GPU'nuza bağlayın.
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={colabUrl}
                onChange={(e) => setColabUrl(e.target.value)}
                placeholder="https://xyz.trycloudflare.com"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full sm:w-64 font-mono"
              />
              <button
                onClick={() => {
                  if (colabUrl) {
                    localStorage.setItem('onyx_colab_url', colabUrl);
                    alert('Colab ağ geçidi kaydedildi: ' + colabUrl);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition shrink-0"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
