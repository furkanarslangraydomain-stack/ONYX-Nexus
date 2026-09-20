import { useState } from 'react';
import {
  MERMAID_SCHEMA_FULL,
  ASCII_TOPOLOGY_FULL,
  ARCHITECTURE_LAYERS,
  ARCHITECTURE_NODES,
  SWARM_AGENTS_DATA,
  COLAB_SERVER_CONFIG
} from '../data/architectureData';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  FileText,
  FileCode,
  Share2
} from 'lucide-react';

interface SchemaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchemaExportModal({ isOpen, onClose }: SchemaExportModalProps) {
  const [activeTab, setActiveTab] = useState<'mermaid' | 'ascii' | 'json' | 'markdown'>('mermaid');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const jsonExport = JSON.stringify(
    {
      projectName: "ONYX-Nexus",
      version: "4.0.0",
      architectureType: "Autonomous AI Operating System with 9-Agent Swarm & Single-Cell Colab SSH Server",
      layers: ARCHITECTURE_LAYERS,
      nodes: ARCHITECTURE_NODES,
      swarmAgents: SWARM_AGENTS_DATA,
      colabServer: COLAB_SERVER_CONFIG
    },
    null,
    2
  );

  const markdownExport = `# ONYX-Nexus Mimari Şeması (Architecture Schema)

> Otonom 9-Ajanlı Swarm, Tek Hücre Colab SSH Sunucusu ve Zero-Knowledge Gizlilik Kalkanına Sahip Yeni Nesil AI İşletim Sistemi.

## 1. Katmanlı Topoloji
1. **İstemci Katmanı (Client Layer)**: Vite + React 18 Web UI & Kotlin Jetpack Compose Android Client
2. **Güvenlik & ZK-Gizlilik Katmanı (Security & Privacy Shield)**: Sentinel ZK-Maskeleme, SHA-256 HMAC ve Heuristic Prompt Guard
3. **Orkestrasyon & Sürü Katmanı (Nexus Swarm Engine)**: 9 Uzman Ajan (%85 Konsensüs Eşiği ile Otonom Onay)
4. **Tek Hücre Colab SSH Sunucu Katmanı**: Gömülü Uç Nokta (Port 8000), OpenSSH + tmate Tüneli, NVIDIA Tesla T4 GPU
5. **Model Havuzu & Kalıcı Depolama (LLM Pool & SQLite WAL)**: 30+ Ücretsiz LLM, FTS5 Vektör Veritabanı ve Mega MCP Sunucusu (36+ Araç)

## 2. 9-Ajanlı Swarm Yapısı
- **Ajan 1 (Nexus Router)**: Görev sınıflandırma ve akıllı model seçimi
- **Ajan 2 (Master Architect)**: SOLID & Clean mimari tasarımı (Konsensüs payı: %35)
- **Ajan 3 (Polyglot Developer)**: Çok dilli kodlama (Konsensüs payı: %30)
- **Ajan 4 (Sentinel Security)**: ZK maskeleme ve zaafiyet denetimi
- **Ajan 5 (QA Test Runner)**: Birim & entegrasyon testleri (Konsensüs payı: %35)
- **Ajan 6 (Deep Scholar)**: Arxiv ve literatür taraması
- **Ajan 7 (Web3 Crypto Analyst)**: Akıllı sözleşme ve tokenomics analizi
- **Ajan 8 (DevOps & Git Master)**: Otomatik Git push ve CI/CD deploy
- **Ajan 9 (Doc & Schema Scribe)**: Otomatik dokümantasyon ve şema üretimi

## 3. Tek Hücre Colab SSH & Daemon Sunucusu
- **Gömülü Uç Nokta**: \`http://localhost:8000\` (Kullanıcıdan URL istemeden doğrudan kod üzerinden bağlanır)
- **Güvenli SSH Tüneli**: OpenSSH + tmate (\`ssh.tmate.io:22\`)
- **GPU Hızlandırma**: NVIDIA Tesla T4 (15.8GB VRAM - CUDA 12.2)
- **Daemon Süpervizörü**: FastAPI arka plan sürecini ve Keep-Alive döngüsünü yönetir
`;

  const getContent = () => {
    switch (activeTab) {
      case 'mermaid': return MERMAID_SCHEMA_FULL;
      case 'ascii': return ASCII_TOPOLOGY_FULL;
      case 'json': return jsonExport;
      case 'markdown': return markdownExport;
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      mermaid: 'mmd',
      ascii: 'txt',
      json: 'json',
      markdown: 'md'
    };
    const content = getContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onyx-nexus-architecture.${extensions[activeTab]}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-100">
                ONYX-Nexus Mimari Şeması Dışa Aktarımı
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mermaid, ASCII Topoloji, JSON ve Markdown formatlarında tek tıkla kopyalayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mermaid')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition border-b-2 ${
                activeTab === 'mermaid'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Mermaid.js Diyagramı (.mmd)
            </button>
            <button
              onClick={() => setActiveTab('ascii')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition border-b-2 ${
                activeTab === 'ascii'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ASCII Topoloji Şeması (.txt)
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition border-b-2 ${
                activeTab === 'json'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON Şeması (.json)
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition border-b-2 ${
                activeTab === 'markdown'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown Raporu (.md)
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Panoya Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-5 flex-1 overflow-auto bg-slate-950 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-200">
            {getContent()}
          </pre>
        </div>
      </div>
    </div>
  );
}
