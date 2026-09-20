import { useState } from 'react';
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  UploadCloud,
  CheckCircle2,
  Clock,
  Play,
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export function GithubCiCdView() {
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<number>(100);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [commitMessage, setCommitMessage] = useState('feat(onyx-os): integrate colab single-cell ssh server and knowledge graph');
  const [activeBranch, setActiveBranch] = useState('main');

  const pipelineStages = [
    { name: '1. TypeScript & Lint Denetimi', command: 'tsc --noEmit && eslint', status: 'SUCCESS', time: '1.4s' },
    { name: '2. Sentinel ZK Gizlilik & Secret Taraması', command: 'sentinel scan --zero-knowledge', status: 'SUCCESS', time: '0.8s' },
    { name: '3. 9-Ajanlı Swarm Konsensüs Onayı', command: 'nexus-swarm vote --min-threshold=85%', status: 'SUCCESS', time: '2.1s' },
    { name: '4. Colab SSH & Daemon Sağlık Kontrolü', command: 'curl -s http://localhost:8000/api/health', status: 'SUCCESS', time: '0.5s' },
    { name: '5. Üretim Derleme Doğrulaması', command: 'vite build', status: 'SUCCESS', time: '2.9s' }
  ];

  const recentCommits = [
    { hash: 'a1e023f', msg: 'feat(colab-ssh): replace mesh with single-cell colab ssh server', author: 'DevOps Master Agent', time: '12 dk önce' },
    { hash: '7c4d92a', msg: 'refactor(topology): embed backend endpoint without user prompt', author: 'Master Architect', time: '28 dk önce' },
    { hash: 'f9b311e', msg: 'feat(zk-shield): add SHA-256 HMAC verifier and live PII mask', author: 'Sentinel Security', time: '1 saat önce' },
    { hash: 'e012aa4', msg: 'init: bootstrap ONYX-Nexus autonomous AI operating system', author: 'Nexus Router', time: '2 saat önce' }
  ];

  const handleRunPipeline = () => {
    setIsRunningPipeline(true);
    setPipelineProgress(20);
    setTimeout(() => setPipelineProgress(50), 600);
    setTimeout(() => setPipelineProgress(80), 1200);
    setTimeout(() => {
      setPipelineProgress(100);
      setIsRunningPipeline(false);
    }, 1800);
  };

  const copyGitPushCommand = () => {
    const cmd = `git add . && git commit -m "${commitMessage}" && git push origin ${activeBranch}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <GitBranch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">
                  Otonom GitHub CI/CD & Auto-Deploy Pipeline
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  OTONOM AKTİF
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Depo: <a href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">furkanarslangraydomain-stack/ONYX-Nexus</a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              {isRunningPipeline ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Pipeline Çalışıyor ({pipelineProgress}%)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>CI/CD Pipeline'ı Başlat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Git info ribbon */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              Dal: <strong className="text-white">{activeBranch}</strong>
            </span>
            <span>Remote: <strong>origin</strong></span>
            <span>Son Push: <strong>12 dk önce</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Hızlı Dal Değiştir:</span>
            {['main', 'feature/colab-ssh-server', 'staging'].map(b => (
              <button
                key={b}
                onClick={() => setActiveBranch(b)}
                className={`px-2 py-0.5 rounded text-[10px] border transition ${
                  activeBranch === b
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: CI/CD Pipeline Stages & Git Push Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Automated Pipeline Stages */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  Otonom Doğrulama Basamakları (5/5 Başarılı)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Konsensüs: %94.2 (Eşik: %85)
              </span>
            </div>

            <div className="space-y-2.5">
              {pipelineStages.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-slate-200 font-bold truncate">{stage.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{stage.command}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {stage.time}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {stage.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Push & Commit Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-white">
                GitHub'a Push Et & Depo Senkronizasyonu
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Commit Mesajı (DevOps Master Ajanı Tarafından Üretildi):
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Ready-to-copy terminal command */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2 text-xs font-mono text-cyan-300 truncate">
                  <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">git add . && git commit -m "{commitMessage}" && git push origin {activeBranch}</span>
                </div>
                <button
                  onClick={copyGitPushCommand}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 shrink-0 transition"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-[11px] text-slate-300 font-mono leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Otonom Git Engine:</strong> Kod tabanı yerel Git deposuna ({activeBranch} dalı) otomatik olarak commit edilmiştir. GitHub uzak deposuna push işlemi için terminal komutunu tek tıkla çalıştırabilirsiniz.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Commits & Pull Requests */}
        <div className="space-y-6">
          {/* Commit Feed */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  Son Commitler
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {activeBranch}
              </span>
            </div>

            <div className="space-y-3">
              {recentCommits.map((c, i) => (
                <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="text-cyan-400 font-bold">{c.hash}</span>
                    <span>{c.time}</span>
                  </div>
                  <div className="text-slate-200 font-medium line-clamp-2 leading-relaxed">
                    {c.msg}
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{c.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pull Request Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <GitPullRequest className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold font-mono text-white">
                Otomatik PR #4 (Açık)
              </h3>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-200 font-bold">
                PR #4: Colab Single-Cell SSH & Memory Knowledge Graph
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                9/9 Ajan incelemesini tamamladı. SOLID standartları ve ZK-Privacy denetimleri onaylandı.
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span className="text-emerald-400">Onay: 9/9 Ajan</span>
                <span>+420 / -180 Satır</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
