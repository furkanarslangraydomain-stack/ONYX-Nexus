import { useState } from 'react';
import {
  Code2,
  Terminal,
  Play,
  GitBranch,
  CheckCircle2,
  Sparkles,
  Users,
  Cpu,
  FolderTree,
  FileCode,
  Folder,
  Send,
  Mic,
  MicOff,
  Maximize2,
  RotateCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Server
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
}

const SAMPLE_FILES: FileItem[] = [
  {
    id: 'colab_daemon',
    name: 'colab_daemon.py',
    path: 'src/colab/colab_daemon.py',
    language: 'python',
    content: `# ONYX-Nexus Tek Hücre Colab Daemon (Port 8000 & tmate SSH)
import asyncio
from fastapi import FastAPI, WebSocket
import uvicorn
import torch

app = FastAPI(title="ONYX-Nexus Colab GPU Daemon", version="4.0.0")

@app.get("/api/health")
async def health_check():
    gpu_ok = torch.cuda.is_available()
    vram_free, vram_total = 0, 0
    if gpu_ok:
        vram_free, vram_total = torch.cuda.mem_get_info()
    return {
        "status": "ONLINE",
        "node": "single-cell-colab",
        "port": 8000,
        "gpu": torch.cuda.get_device_name(0) if gpu_ok else "CPU Fallback",
        "vram_allocated_mb": (vram_total - vram_free) // (1024 * 1024),
        "keep_alive": True
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
  },
  {
    id: 'swarm_router',
    name: 'nexus_router.ts',
    path: 'src/agents/nexus_router.ts',
    language: 'typescript',
    content: `// ONYX-Nexus Swarm Engine: 9-Agent Router & Consensus
import { SwarmMessage, AgentRole } from '../types';

export class NexusRouter {
  private consensusThreshold = 0.85; // %85 Otonom Onay Eşiği

  async routeTask(intent: string): Promise<{ targetAgent: AgentRole; priority: number }> {
    console.log(\`[Nexus-Router] İstek sınıflandırılıyor: \${intent}\`);
    if (intent.includes('architecture') || intent.includes('refactor')) {
      return { targetAgent: 'Master Architect', priority: 1 };
    }
    if (intent.includes('security') || intent.includes('token')) {
      return { targetAgent: 'Sentinel Security', priority: 1 };
    }
    return { targetAgent: 'Polyglot Developer', priority: 2 };
  }
}
`
  },
  {
    id: 'fts5_memory',
    name: 'sqlite_fts5_wal.ts',
    path: 'src/memory/sqlite_fts5_wal.ts',
    language: 'typescript',
    content: `// SQLite Lock-Free Eşzamanlı FTS5 Tam Metin & Vektör Belleği
export interface MemoryRecord {
  id: string;
  source: string;
  embeddingVector: number[];
  bm25Rank: number;
}

export function searchSemanticMemory(query: string): MemoryRecord[] {
  // Lock-Free WAL (Write-Ahead-Logging) modu ile 0ms bloklanma
  return [
    { id: 'mem-001', source: 'Colab SSH Config', embeddingVector: [0.12, 0.94, -0.44], bm25Rank: 0.98 },
    { id: 'mem-002', source: 'Consensus Threshold Logic', embeddingVector: [0.44, 0.12, 0.81], bm25Rank: 0.92 }
  ];
}
`
  }
];

export function WorkspaceIdeView() {
  const [selectedFile, setSelectedFile] = useState<FileItem>(SAMPLE_FILES[0]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string; color: string }>>([
    { sender: 'Nexus Router', role: 'Router', text: 'Tek Hücre Colab SSH & Daemon başlatıldı (Port 8000). Görevler dinleniyor.', time: '14:02', color: '#6366f1' },
    { sender: 'Master Architect', role: 'Architect', text: 'Kod tabanı incelendi. Colab Mesh referansları temizlendi, sade mimari onaylandı.', time: '14:03', color: '#06b6d4' },
    { sender: 'Sentinel Security', role: 'Security', text: 'ZK Maskeleme devrede. Gizli anahtar ve PII sızıntısı tespit edilmedi.', time: '14:04', color: '#10b981' },
    { sender: 'DevOps Master', role: 'DevOps', text: 'Git commit hazırlandı: main dalı senkronize edildi. GitHub CI/CD aktif.', time: '14:05', color: '#a855f7' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ONYX-Nexus Kernel v4.0.0 [x86_64-linux-gnu]',
    '[System] Bağlantı: Gömülü Port 8000 (http://localhost:8000) -> OK',
    '[Daemon] FastAPI Uvicorn dinleniyor: host=0.0.0.0 port=8000',
    '[GPU] NVIDIA Tesla T4 15.8GB (CUDA 12.2) tespit edildi.',
    '[Swarm] 9 Uzman Ajan aktif. Konsensüs eşiği: %85',
    'onyx@nexus:~$ _'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [
      ...prev,
      { sender: 'Kullanıcı (Admin)', role: 'User', text: userText, time: 'Şimdi', color: '#f59e0b' }
    ]);

    // Simulated Swarm Response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'Polyglot Developer',
          role: 'Developer',
          text: `"${userText}" görevi için kod optimize edildi. QA testleri ve ZK güvenlik denetimi çalıştırılıyor.`,
          time: 'Şimdi',
          color: '#38bdf8'
        },
        {
          sender: 'QA Test Runner',
          role: 'QA',
          text: 'Tüm testler başarılı (%100 Pass). Konsensüs oyu: %96.2 -> Otonom onay verildi!',
          time: 'Şimdi',
          color: '#4ade80'
        }
      ]);
    }, 900);
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTerminalLogs(prev => [
      ...prev,
      `onyx@nexus:~$ python3 ${selectedFile.name}`,
      `[Çalıştırılıyor] ${selectedFile.path}...`,
      `[GPU Info] Tesla T4: 1536 CUDA Cores allocated`,
      `[Başarılı] İşlem 0.42s içinde sıfır hata ile tamamlandı. Çıkış kodu: 0`,
      'onyx@nexus:~$ _'
    ]);
    setTimeout(() => setIsRunningCode(false), 800);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');

    let output = '';
    if (cmd === 'nvidia-smi') {
      output = `+-----------------------------------------------------------------------------+\n| NVIDIA-SMI 535.104.05   Driver Version: 535.104.05   CUDA Version: 12.2     |\n|-------------------------------+----------------------+----------------------+\n| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |\n| 0  Tesla T4            On   | 00000000:00:04.0 Off |                    0 |\n| 30%   46C    P8    24W /  70W |   1840MiB / 15360MiB |     12%      Default |\n+-------------------------------+----------------------+----------------------+`;
    } else if (cmd === 'status') {
      output = `[ONYX-Nexus OS v4.0.0]\nUptime: 4h 22m | Colab Daemon: Port 8000 [ALIVE]\nSwarm: 9/9 Agents Ready | Consensus: 94.2%\nMemory: SQLite FTS5 Lock-Free WAL (Active)`;
    } else if (cmd.includes('git')) {
      output = `On branch main\nYour branch is up to date with 'origin/main'.\nNothing to commit, working tree clean.`;
    } else {
      output = `Komut yürütüldü: ${cmd} (Çıkış kodu: 0)`;
    }

    setTerminalLogs(prev => [
      ...prev.slice(0, -1),
      `onyx@nexus:~$ ${cmd}`,
      output,
      'onyx@nexus:~$ _'
    ]);
  };

  const handleToggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setInputMessage("Sistem durumunu kontrol et ve konsensüsü çalıştır");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-white">
                ONYX-Nexus İşletim Sistemi Çalışma Alanı
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CANLI ÇALIŞIYOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              9-Ajanlı Swarm • Gömülü Port 8000 Colab SSH • FTS5 WAL Belleği
            </p>
          </div>
        </div>

        {/* Action Buttons & Voice Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition border ${
              isVoiceActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Sesli Komut Modu"
          >
            {isVoiceActive ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isVoiceActive ? 'Ses Dinleniyor...' : 'Sesli Komut'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunningCode}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {isRunningCode ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Kodu Çalıştır</span>
          </button>
        </div>
      </div>

      {/* 3-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1: File Explorer & Swarm Team (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* File Explorer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
                Proje Dosyaları
              </span>
              <span className="text-[10px] text-slate-500">v4.0.0</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              {SAMPLE_FILES.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
                    selectedFile.id === file.id
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active 9-Agent Swarm Team */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                9-Ajanlı Swarm Takımı
              </span>
              <span className="text-[10px] text-emerald-400">9/9 Hazır</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: '1. Nexus Router', role: 'Yönlendirici', status: 'ONLINE' },
                { name: '2. Master Architect', role: 'SOLID Tasarım', status: 'ONLINE' },
                { name: '3. Polyglot Dev', role: 'Kod Motoru', status: 'ONLINE' },
                { name: '4. Sentinel Security', role: 'ZK Gizlilik', status: 'ONLINE' },
                { name: '5. QA Test Runner', role: 'Test & Onay', status: 'ONLINE' },
                { name: '6. Deep Scholar', role: 'Arxiv & Literatür', status: 'ONLINE' },
                { name: '7. Web3 Analyst', role: 'Akıllı Sözleşme', status: 'ONLINE' },
                { name: '8. DevOps Master', role: 'Git & Deploy', status: 'ONLINE' },
                { name: '9. Doc Scribe', role: 'Şema & Doküman', status: 'ONLINE' }
              ].map((agent, i) => (
                <div
                  key={i}
                  className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px]"
                >
                  <div className="truncate text-slate-300">{agent.name}</div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Code Editor (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          {/* Editor Tab Bar */}
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-t bg-slate-950 text-cyan-300 border-t-2 border-cyan-400 font-medium">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {selectedFile.language.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedFile.content);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Kodu Kopyala"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Editor Body */}
          <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 min-h-[360px]">
            <pre className="font-mono">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex gap-4 hover:bg-slate-900/40 px-1 py-0.5 rounded">
                  <span className="text-slate-600 select-none w-6 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200">{line}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Editor Footer */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>UTF-8 • LF • Spaces: 2</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Sözdizimi Doğrulandı
            </span>
          </div>
        </div>

        {/* Col 3: Live Swarm Agent Chat & Consensus Stream (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold font-mono text-white">
                Canlı Swarm Ajan İletişimi
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
              Konsensüs: %94.2
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="p-3.5 space-y-2.5 overflow-y-auto max-h-[380px] min-h-[320px]">
            {chatMessages.map((msg, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold flex items-center gap-1" style={{ color: msg.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.color }} />
                    {msg.sender}
                  </span>
                  <span className="text-slate-500">{msg.time}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 flex gap-2">
            <input
              type="text"
              placeholder="9 Ajanlı Swarm'a görev veya talimat ver..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Pane: Web PTY Interactive Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-200 font-bold">ONYX-Nexus Web PTY Shell (Terminal & SSH)</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              colab@ssh.tmate.io:22
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Hızlı Komutlar:</span>
            {['nvidia-smi', 'status', 'git status'].map(cmd => (
              <button
                key={cmd}
                onClick={() => {
                  setTerminalInput(cmd);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Output */}
        <div className="p-4 font-mono text-xs text-slate-300 space-y-1 bg-slate-950 max-h-40 overflow-y-auto">
          {terminalLogs.map((log, i) => (
            <div key={i} className="text-slate-400 whitespace-pre-wrap">
              {log}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleTerminalSubmit} className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 select-none">onyx@nexus:~$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="Komut yazın (örn: nvidia-smi, status, git status, pytest)..."
            className="flex-1 bg-transparent border-none text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
          />
        </form>
      </div>
    </div>
  );
}
