import { useState } from 'react';
import { COLAB_SERVER_CONFIG, COLAB_CELL_PYTHON_SCRIPT } from '../data/architectureData';
import {
  Terminal,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Copy,
  Check,
  RefreshCw,
  Play,
  Trash2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Code2,
  GitBranch,
  Volume2,
  Layers,
  Box
} from 'lucide-react';

export function ColabSshServerView() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSsh, setCopiedSsh] = useState(false);
  const [copiedKeepAlive, setCopiedKeepAlive] = useState(false);
  const [serverState, setServerState] = useState<'RUNNING' | 'RESTARTING' | 'CLEANING'>('RUNNING');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Interactive Terminal State
  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd?: string; text: string; type: 'input' | 'output' | 'system' }>>([
    { text: '══ ONYX-Nexus Colab SSH & Daemon Interactive Shell v4.0.0 ══', type: 'system' },
    { text: 'Connected to Colab Node: colab-onyx-primary (CUDA 12.2 / NVIDIA T4)', type: 'system' },
    { text: 'Embedded Endpoint: http://localhost:8000 (Hardcoded & Zero-Config)', type: 'system' },
    { text: 'Type "help" or click quick commands below to test.', type: 'system' }
  ]);

  const copyToClipboard = (text: string, type: 'code' | 'ssh' | 'keepalive') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'ssh') {
      setCopiedSsh(true);
      setTimeout(() => setCopiedSsh(false), 2000);
    } else {
      setCopiedKeepAlive(true);
      setTimeout(() => setCopiedKeepAlive(false), 2000);
    }
  };

  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...terminalHistory, { cmd: trimmed, text: trimmed, type: 'input' as const }];

    if (trimmed === 'clear') {
      setTerminalHistory([
        { text: '══ Console Cleared - Colab Session Active ══', type: 'system' }
      ]);
      setCommandInput('');
      return;
    }

    let response = '';
    if (trimmed === 'help') {
      response = `Available commands:\n  nvidia-smi            - Check GPU VRAM and CUDA driver status\n  status                - View FastAPI daemon & agent status\n  ps aux | grep onyx   - Inspect running daemon & workers\n  free -h               - Display RAM & swap allocation\n  git status            - Check local repository branch and commits\n  python -c "..."       - Test PyTorch CUDA acceleration\n  clear                 - Clear terminal screen`;
    } else if (trimmed === 'nvidia-smi') {
      response = `+-----------------------------------------------------------------------------------------+\n| NVIDIA-SMI 535.104.05             Driver Version: 535.104.05   CUDA Version: 12.2       |\n|-----------------------------------------+------------------------+----------------------+\n| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |\n| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |\n|=========================================+========================+======================|\n|   0  Tesla T4                       Off |   00000000:00:04.0 Off |                    0 |\n| N/A   47C    P0             28W /  70W  |    2840MiB / 15360MiB  |     14%      Default |\n+-----------------------------------------+------------------------+----------------------+`;
    } else if (trimmed === 'status' || trimmed === 'systemctl status onyx') {
      response = `● onyx-daemon.service - ONYX-Nexus High-Performance FastAPI Backend\n   Loaded: loaded (/etc/systemd/system/onyx.service; enabled)\n   Active: active (running) since Sun 2026-09-20 00:26:17 UTC; 4h 18min ago\n   Main PID: 18492 (python3)\n   Tasks: 14 (limit: 4915)\n   Memory: 1.4G (limit: 12.0G)\n   CGroup: /system.slice/onyx.service\n           └─18492 python3 -m uvicorn server:app --host 0.0.0.0 --port 8000\n\nAgents Online: 9/9 | Consensus Engine: READY | ZK-Shield: ACTIVE`;
    } else if (trimmed.includes('ps aux')) {
      response = `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot       18492  4.2  8.6 3491204 1142012 ?     Sl   00:26   10:48 python3 -m uvicorn server:app\nroot       18504  0.1  0.2  24510   3140 ?       S    00:26   0:02 tmate -S /tmp/tmate.sock new-session\nroot       18512  1.8  5.2 1894000 684200 ?      Sl   00:27   4:32 python3 -m agent_crew`;
    } else if (trimmed === 'free -h') {
      response = `               total        used        free      shared  buff/cache   available\nMem:            12Gi       3.4Gi       6.2Gi        12Mi       2.4Gi       8.3Gi\nSwap:             0B          0B          0B`;
    } else if (trimmed.includes('git status')) {
      response = `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tnothing to commit, working tree clean`;
    } else if (trimmed.includes('torch.cuda')) {
      response = `PyTorch 2.2.1+cu121\nCUDA is available: True\nDevice Count: 1\nDevice 0: Tesla T4\nAllocated VRAM: 2.77 GB / 15.00 GB`;
    } else {
      response = `bash: ${trimmed}: command executed successfully with returncode 0.\n[Stdout piped to embedded REST bridge on port 8000]`;
    }

    setTerminalHistory([...newHistory, { text: response, type: 'output' }]);
    setCommandInput('');
  };

  const handleRestartDaemon = () => {
    setServerState('RESTARTING');
    setActionMessage('FastAPI Daemon ve tmate oturumu yeniden başlatılıyor...');
    setTimeout(() => {
      setServerState('RUNNING');
      setActionMessage('FastAPI Daemon (Port 8000) başarıyla yeniden başlatıldı.');
      setTerminalHistory(prev => [
        ...prev,
        { text: '[SYSTEM] Daemon restarted on port 8000. All 9 agents reconnected.', type: 'system' }
      ]);
      setTimeout(() => setActionMessage(null), 3000);
    }, 1800);
  };

  const handleClearVram = () => {
    setServerState('CLEANING');
    setActionMessage('PyTorch CUDA VRAM boşaltılıyor (`torch.cuda.empty_cache()`)...');
    setTimeout(() => {
      setServerState('RUNNING');
      setActionMessage('GPU VRAM temizlendi: 1.4 GB önbellek boşaltıldı.');
      setTerminalHistory(prev => [
        ...prev,
        { text: '[GPU] torch.cuda.empty_cache() executed. Freed 1420MB unreferenced tensors.', type: 'system' }
      ]);
      setTimeout(() => setActionMessage(null), 3000);
    }, 1200);
  };

  const directSshCommand = `ssh -p 22 onyx-admin@ssh.tmate.io -i ~/.ssh/id_rsa`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Single-Cell Colab SSH & Embedded Endpoint */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-wide">
                  Tek Hücre Colab SSH Sunucu Yönetimi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {serverState}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Colab üzerinde tek bir kod hücresiyle OpenSSH/tmate tüneli kurarak FastAPI orkestratörünü yönetir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartDaemon}
              disabled={serverState !== 'RUNNING'}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${serverState === 'RESTARTING' ? 'animate-spin' : ''}`} />
              <span>Daemon Yeniden Başlat</span>
            </button>

            <button
              onClick={handleClearVram}
              disabled={serverState !== 'RUNNING'}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>VRAM Temizle</span>
            </button>
          </div>
        </div>

        {/* Embedded Endpoint Notice - No input box requested */}
        <div className="mt-4 p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Gömülü Arka Uç Noktası:</strong>{' '}
              <code className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono border border-slate-700">
                http://localhost:8000
              </code>{' '}
              (Koda gömülüdür, kullanıcıdan hiçbir URL istenmez)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Tünel: <strong>tmate / OpenSSH</strong></span>
            <span>•</span>
            <span>Uptime: <strong className="text-slate-200">{COLAB_SERVER_CONFIG.uptime}</strong></span>
            <span>•</span>
            <span>Ajanlar: <strong className="text-emerald-400">9/9 Aktif</strong></span>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-3 p-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Live Hardware Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> GPU Hızlandırıcı
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">CUDA 12.2</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 font-mono truncate">
              {COLAB_SERVER_CONFIG.gpuType.split('(')[0]}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              VRAM: <strong className="text-cyan-400">2.8 GB</strong> / 15.8 GB (%18)
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Sistem RAM
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">12.7 GB Toplam</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 font-mono">
              {COLAB_SERVER_CONFIG.ramUsageGb} GB Kullanımda
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Boşta: <strong className="text-emerald-400">9.3 GB</strong> (%73 Boş)
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" /> SSD Disk
              </span>
              <span className="text-[10px] text-slate-400 font-mono">107.7 GB</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 font-mono">
              {COLAB_SERVER_CONFIG.diskUsageGb} GB Dolu
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Kalan: <strong className="text-slate-300">79.3 GB</strong>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> SSH Bağlantısı
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Port 22</span>
            </div>
            <div className="text-xs font-semibold text-emerald-300 font-mono truncate">
              {COLAB_SERVER_CONFIG.sshHost}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Protokol: <strong className="text-slate-300">OpenSSH v9.3</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: 1) Single-Cell Colab Code Generator, 2) Direct SSH & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Colab Python Starter Script (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Tek Tıkla Google Colab Hücre Kodu
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(COLAB_CELL_PYTHON_SCRIPT, 'code')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Kopyalandı!' : 'Hücre Kodunu Kopyala'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Google Colab'da boş bir Python hücresine yapıştırıp <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Shift + Enter</kbd> ile çalıştırın. Tünel ve FastAPI sunucusu tek seferde açılır.
            </p>

            <div className="relative mt-3 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[380px] no-scrollbar leading-relaxed">
              <pre>{COLAB_CELL_PYTHON_SCRIPT}</pre>
            </div>
          </div>

          {/* Quick Colab Anti-Disconnect Helper */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Colab Keep-Alive (Bağlantı Kopmasını Önleme)</span>
              </div>
              <button
                onClick={() => copyToClipboard(`function ConnectButton(){ console.log("Keeping Colab Active"); document.querySelector("#connect")?.click() }; setInterval(ConnectButton,60000);`, 'keepalive')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition"
              >
                {copiedKeepAlive ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKeepAlive ? 'Kopyalandı' : 'JS Konsol Kodunu Kopyala'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Colab sekmesinde F12 açıp Konsol'a yapıştırırsanız Google Colab oturumu boşta kalarak kapanmaz.
            </p>
          </div>
        </div>

        {/* Right Column: Direct SSH Access & Interactive Web Shell (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Direct SSH Command Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200">Doğrudan SSH Bağlantısı</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Tek Tıkla Bağlan
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between gap-2">
              <code className="text-cyan-300 truncate">{directSshCommand}</code>
              <button
                onClick={() => copyToClipboard(directSshCommand, 'ssh')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                title="SSH Komutunu Kopyala"
              >
                {copiedSsh ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kullanıcı Adı</span>
                <span className="text-slate-200 font-semibold">{COLAB_SERVER_CONFIG.sshUser}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Port & Host</span>
                <span className="text-slate-200 font-semibold">22 @ ssh.tmate.io</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Web Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-400 font-mono text-[11px] ml-1">onyx@colab-t4: ~</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">PTY Active</span>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 bg-slate-950 rounded-xl p-3 my-2 font-mono text-[11px] overflow-y-auto no-scrollbar space-y-1.5">
              {terminalHistory.map((item, idx) => (
                <div key={idx}>
                  {item.type === 'input' ? (
                    <div className="text-cyan-400 flex items-center gap-1.5">
                      <span className="text-emerald-400">onyx@colab:~$</span>
                      <span>{item.cmd}</span>
                    </div>
                  ) : item.type === 'system' ? (
                    <div className="text-purple-400 italic">{item.text}</div>
                  ) : (
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {item.text}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Command Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[10px] font-mono">
              {[
                { label: 'nvidia-smi', cmd: 'nvidia-smi' },
                { label: 'status', cmd: 'status' },
                { label: 'free -h', cmd: 'free -h' },
                { label: 'ps aux', cmd: 'ps aux | grep onyx' },
                { label: 'git status', cmd: 'git status' },
                { label: 'clear', cmd: 'clear' }
              ].map(q => (
                <button
                  key={q.label}
                  onClick={() => handleRunCommand(q.cmd)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 whitespace-nowrap transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunCommand(commandInput);
              }}
              className="mt-1 flex items-center gap-2 pt-2 border-t border-slate-800"
            >
              <span className="text-emerald-400 font-mono text-xs">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Komut yazın (örn: nvidia-smi, help)..."
                className="flex-1 bg-transparent text-slate-200 text-xs font-mono focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                title="Komutu Çalıştır"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Strategic Section: "Sisteme Neler Eklenebilir?" (What can be added to this system?) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              ONYX-Nexus Mimarisine Eklenebilecek Üst Düzey Geliştirmeler
            </h3>
            <p className="text-xs text-slate-400">
              Tek hücre Colab SSH sunucusu ve 9-Ajanlı Swarm üzerine inşa edilebilecek en stratejik yetenekler:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Item 1: Real-time Web PTY / xterm.js */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h4>1. Gömülü Web PTY (xterm.js)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Doğrudan tarayıcıda tam özellikli terminal (renkli bash, nano, htop) çalıştırmak için xterm.js ve WebSocket köprüsü entegre edilebilir.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Öncelik: Yüksek • Tam Etkileşim
            </span>
          </div>

          {/* Item 2: Automated GitHub CI/CD & Auto-Deploy */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-1.5">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <h4>2. Otonom GitHub CI/CD Botu</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              GitHub Token kullanarak ajanların ürettiği ve QA'den geçen kodları otomatik branch açıp repoya pushlayan ve PR oluşturan otonom dağıtım hattı.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Öncelik: Çok Yüksek • Otomatik Deploy
            </span>
          </div>

          {/* Item 3: Multimodal Voice & Audio Live Streaming */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition">
            <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold mb-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h4>3. Çok Modlu Canlı Ses & Dinleme</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Web Audio API ve Whisper / Gemini Live API ile sese dayalı gerçek zamanlı ajan yönlendirmesi ve sesli yanıt sentezi (TTS).
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Öncelik: Orta • Sesli Asistan
            </span>
          </div>

          {/* Item 4: Knowledge Graph on SQLite FTS5 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <h4>4. Anlamsal Bilgi Grafiği (Memory Graph)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SQLite FTS5 üzerinde konuşmaları salt metin yerine düğüm ve kenarlarla (entity-relationship) modelleyerek kalıcı uzun dönem hafıza oluşturma.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Öncelik: Yüksek • Sürekli Öğrenme
            </span>
          </div>

          {/* Item 5: Docker / Podman Sandbox Isolation */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition">
            <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold mb-1.5">
              <Box className="w-4 h-4 text-purple-400" />
              <h4>5. Docker / Podman İzolasyon Sandbox'ı</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ajanların çalıştırdığı kodları Colab'ın ana dosya sistemine dokunmadan mikro Docker container'larında sıfır risk ile izole test etme.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Öncelik: Orta • Üstün Güvenlik
            </span>
          </div>

          {/* Item 6: GPU LoRA / QLoRA Fine-Tuning */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-pink-500/40 transition">
            <div className="flex items-center gap-2 text-pink-300 text-sm font-semibold mb-1.5">
              <Cpu className="w-4 h-4 text-pink-400" />
              <h4>6. Otomatik Colab LoRA Fine-Tuning</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Boşta kalan Tesla T4 GPU'sunu kullanarak HuggingFace modellerini ONYX mimarisine ve kendi veri setlerinize özel ince ayar (fine-tuning) yapma.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
              Öncelik: İleri Düzey • Özel Model
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
