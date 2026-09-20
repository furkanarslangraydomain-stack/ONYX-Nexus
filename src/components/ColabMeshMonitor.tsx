import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink, Server, Terminal } from 'lucide-react';

const SETUP_COMMAND = `!git clone --depth=1 https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git /content/ONYX-Nexus || true
%cd /content/ONYX-Nexus
!python3 colab_single_cell_setup.py`;

export function ColabMeshMonitor() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(SETUP_COMMAND);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-2xl border border-indigo-500/30 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-indigo-400" />
          <div>
            <h2 className="text-lg font-semibold">Tek Hücre Colab SSH Sunucusu</h2>
            <p className="text-sm text-slate-400">Beş düğümlü mesh yerine tek FastAPI daemon ve tmate SSH kullanılır.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-mono">
          <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">SSH: tmate</span>
          <span className="rounded bg-cyan-500/10 px-2 py-1 text-cyan-300">API: 127.0.0.1:8000</span>
          <span className="rounded bg-purple-500/10 px-2 py-1 text-purple-300">Mesh: kaldırıldı</span>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold"><Terminal className="h-4 w-4 text-cyan-400" /> Colab hücresi</div>
          <button onClick={copy} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs hover:bg-indigo-500">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
        <pre className="overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-emerald-300">{SETUP_COMMAND}</pre>
        <a className="mt-4 inline-flex items-center gap-1 text-xs text-cyan-400" href="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus/blob/main/colab_single_cell_setup.py" target="_blank" rel="noreferrer">
          Kurulum scriptini görüntüle <ExternalLink className="h-3 w-3" />
        </a>
      </section>
    </div>
  );
}
