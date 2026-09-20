import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  Activity,
  Check,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
  HardDrive,
  Globe,
  Layers,
  CheckCircle2,
  AlertCircle,
  Download,
  Folder,
  FileText,
  ArrowLeft
} from 'lucide-react';

export const ColabControlCenter: React.FC = () => {
  const [colabUrl, setColabUrl] = useState('http://localhost:8000');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Playground state
  const [prompt, setPrompt] = useState('100e kadar olan asal sayıları bulan ve yazdıran bir Python kodu hazırla.');
  const [selectedModel, setSelectedModel] = useState('onyx-nexus-agent');
  const [isRunning, setIsRunning] = useState(false);
  const [thoughtOutput, setThoughtOutput] = useState('');
  const [finalReport, setFinalReport] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [memoryEntries, setMemoryEntries] = useState<any[]>([]);
  const [fsPath, setFsPath] = useState('.');
  const [fsEntries, setFsEntries] = useState<any[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadFs = async (targetPath = fsPath) => {
    const cleanUrl = colabUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(`${cleanUrl}/api/fs/explorer?path=${encodeURIComponent(targetPath)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === 'directory') {
          setFsEntries(data.entries || []);
          setFsPath(data.path);
          setSelectedFileContent(null);
        } else if (data.type === 'file') {
          setSelectedFileContent(data.content || '');
        }
      }
    } catch {}
  };

  const downloadBackup = async () => {
    setIsExporting(true);
    const cleanUrl = colabUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(`${cleanUrl}/api/export/backup`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onyx_nexus_backup_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (e) {
      alert('Yedek dışa aktarılamadı: ' + e);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const checkConnection = async (targetUrl = colabUrl) => {
    setIsChecking(true);
    try {
      const cleanUrl = targetUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/api/status`, { mode: 'cors' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setSystemStats(data);
        setIsConnected(true);
        loadMemory(cleanUrl);
        loadFs('.');
      } else {
        // Fallback to /health check
        const healthRes = await fetch(`${cleanUrl}/health`, { mode: 'cors' }).catch(() => null);
        if (healthRes && healthRes.ok) {
          const hData = await healthRes.json();
          setSystemStats({
            ram: { total_gb: hData.total_ram_gb || 20.0, percent: 8.0, used_gb: 1.5, available_gb: 18.5 },
            engine: hData.execution_engine || 'colab',
            cloudflare_url: hData.cloudflare_tunnel || cleanUrl,
            providers: hData.free_llm_providers || ['Pollinations DeepSeek', 'Pollinations OpenAI'],
            gpu: 'Colab T4 / CPU',
            cpu_cores: 2,
          });
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const loadMemory = async (cleanUrl = colabUrl.replace(/\/+$/, '')) => {
    try {
      const res = await fetch(`${cleanUrl}/api/memory`).catch(() => null);
      if (res && res.ok) {
        const list = await res.json();
        setMemoryEntries(list);
      }
    } catch {}
  };

  const clearMemory = async () => {
    if (!confirm('SQLite FTS5 hafızasındaki tüm kayıtları temizlemek istiyor musunuz?')) return;
    const cleanUrl = colabUrl.replace(/\/+$/, '');
    try {
      await fetch(`${cleanUrl}/api/memory/clear`, { method: 'POST' });
      loadMemory(cleanUrl);
    } catch {}
  };

  const runAgentTask = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setThoughtOutput('Google Colab (20GB RAM) üzerinde ajan başlatılıyor...\nAwesome-FreeLLM havuzu taranıyor...');
    setFinalReport('');

    const cleanUrl = colabUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(`${cleanUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const json = JSON.parse(line.slice(6));
                const delta = json.choices[0]?.delta?.content || '';
                fullText += delta;

                if (fullText.includes('<thought>') && !fullText.includes('</thought>')) {
                  const tStart = fullText.indexOf('<thought>') + 9;
                  setThoughtOutput(fullText.substring(tStart));
                } else if (fullText.includes('</thought>')) {
                  const tStart = fullText.indexOf('<thought>') + 9;
                  const tEnd = fullText.indexOf('</thought>');
                  setThoughtOutput(fullText.substring(tStart, tEnd));
                  setFinalReport(fullText.substring(tEnd + 10).trim());
                } else {
                  setFinalReport(fullText);
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      setFinalReport(`Bağlantı hatası: ${err.message}. Lütfen Colab tünel adresinizi kontrol edin.`);
    } finally {
      setIsRunning(false);
      loadMemory(cleanUrl);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const openWebUIBaseUrl = `${colabUrl.replace(/\/+$/, '')}/v1`;

  return (
    <div className="space-y-6">
      {/* 1. Üst Bağlantı Çubuğu & Tünel Durumu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Google Colab &amp; Cloudflare Tüneli
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                20 GB RAM Donanım
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Colab &amp; Cloudflare Yönetim Paneli
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Colab üzerinde çalışan FastAPI sunucunuzu canlı yönetin, 20GB RAM durumunu inceleyin ve ajanları doğrudan test edin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={colabUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
            >
              <span>Yönetim Arayüzünü Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tünel URL Girişi & Canlı Test */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="text-xs font-mono text-slate-400 block mb-1">
              Colab Cloudflare Tünel Adresi (veya Yerel Adres):
            </label>
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-700 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <Globe className="w-4 h-4 text-slate-500 ml-3 shrink-0" />
              <input
                type="text"
                value={colabUrl}
                onChange={(e) => setColabUrl(e.target.value)}
                placeholder="https://xxxx-xxxx.trycloudflare.com veya http://localhost:8000"
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-1 pt-5">
            <button
              onClick={() => checkConnection()}
              disabled={isChecking}
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {isChecking ? (
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : isConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isChecking ? 'Bağlanıyor...' : isConnected ? 'Bağlantı Aktif' : 'Bağlantıyı Test Et'}</span>
            </button>
          </div>
        </div>

        {/* Donanım İstatistikleri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">COLAB RAM BELLEĞİ</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {systemStats?.ram?.total_gb || 20.0} GB
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              %{systemStats?.ram?.percent || 8}% kullanımda
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">ÇALIŞTIRMA MOTORU</div>
            <div className="text-base font-bold font-mono text-white mt-0.5 uppercase">
              {systemStats?.engine || 'Colab Local'}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">0 ms gecikme</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">LLM HAVUZU (0 KEY)</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">Awesome-Free</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pollinations DeepSeek</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">İŞLEMCİ &amp; GPU</div>
            <div className="text-base font-bold font-mono text-indigo-300 mt-0.5 truncate">
              {systemStats?.gpu || 'Colab T4 / Xeon'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {systemStats?.cpu_cores || 2} Çekirdek
            </div>
          </div>
        </div>
      </div>

      {/* 2. Open WebUI Bağlantı Kutusu */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Open WebUI İçin Doğrudan Bağlantı Bilgileri
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bu bilgileri Open WebUI arayüzündeki OpenAI API bağlantı kutusuna yapıştırın.
            </p>
          </div>
          <button
            onClick={() =>
              copyToClipboard(
                `API Base URL: ${openWebUIBaseUrl}\nAPI Key: onyx-nexus-colab\nModel: ${selectedModel}`,
                'webui'
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm whitespace-nowrap"
          >
            {copiedKey === 'webui' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'webui' ? 'Kopyalandı!' : 'Bilgileri Kopyala'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">API BASE URL:</span>
            <span className="text-emerald-400 font-semibold select-all truncate block mt-0.5">
              {openWebUIBaseUrl}
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">API KEY:</span>
            <span className="text-amber-400 font-semibold select-all block mt-0.5">
              onyx-nexus-colab
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">MODEL SEÇİMİ:</span>
            <span className="text-cyan-400 font-semibold select-all block mt-0.5">
              onyx-nexus-agent
            </span>
          </div>
        </div>
      </div>

      {/* 3. Canlı Ajan Konsolu & Test Alanı */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Canlı Colab Ajan Konsolu
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              İstemi Colab tüneline gönderin, mimari tasarımı, kod sentezini ve derleme adımlarını canlı izleyin.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              <option value="onyx-nexus-agent">onyx-nexus-agent (Otomatik)</option>
              <option value="onyx-nexus-colab">onyx-nexus-colab (20GB RAM)</option>
              <option value="onyx-nexus-deepseek">onyx-nexus-deepseek (Reasoning)</option>
            </select>
          </div>
        </div>

        {/* Hızlı Şablon Butonları */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-500 self-center text-[11px]">Hızlı Görevler:</span>
          <button
            onClick={() => setPrompt('100e kadar olan asal sayıları bulan ve yazdıran bir Python kodu hazırla.')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          >
            🔢 Asal Sayılar (Python)
          </button>
          <button
            onClick={() => setPrompt('DuckDuckGo ile güncel yapay zeka haberlerini ara ve Python ile özetle.')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition"
          >
            🔍 Web Arama (DDG Ajanı)
          </button>
          <button
            onClick={() => setPrompt('İki büyük matrisi çarpan ve süresini ölçen C++ kodu yaz ve çalıştır.')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 transition"
          >
            ⚡ Matris Çarpımı (C++)
          </button>
          <button
            onClick={() => setPrompt('Linux üzerinde RAM ve disk kullanımını listeleyen bir Bash betiği hazırla.')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-300 transition"
          >
            🛡️ Sistem Durumu (Bash)
          </button>
        </div>

        {/* Metin Giriş Alanı */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            placeholder="Ajanlara bir görev verin..."
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Colab Yerel Sandbox ve DuckDuckGo sıfır maliyetle çalışır.
            </span>
            <button
              onClick={runAgentTask}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-lg disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Çalıştırılıyor...' : 'Ajanı Çalıştır'}</span>
            </button>
          </div>
        </div>

        {/* Canlı Akış Çıktısı */}
        {(thoughtOutput || finalReport) && (
          <div className="space-y-3 pt-2">
            {/* Canlı Düşünce Süreci (<thought>) */}
            {thoughtOutput && (
              <details open className="bg-slate-950 rounded-lg border border-purple-500/30 overflow-hidden">
                <summary className="px-4 py-2.5 bg-purple-950/30 text-purple-300 text-xs font-mono font-semibold cursor-pointer flex items-center justify-between select-none">
                  <span className="flex items-center space-x-2">
                    {isRunning && <RotateCcw className="w-3.5 h-3.5 animate-spin text-purple-400" />}
                    <span>Canlı Akıl Yürütme Süreci (&lt;thought&gt;)</span>
                  </span>
                  <span className="text-[10px] text-purple-400">Open WebUI Uyumlu</span>
                </summary>
                <div className="p-4 text-xs font-mono text-purple-200/90 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {thoughtOutput}
                </div>
              </details>
            )}

            {/* Nihai Rapor */}
            {finalReport && (
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Nihai Çıktı &amp; Doğrulama Raporu
                  </span>
                  <button
                    onClick={() => copyToClipboard(finalReport, 'final-report')}
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
                  >
                    {copiedKey === 'final-report' ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {finalReport}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. SQLite FTS5 Görev Hafızası & Colab Anti-Disconnect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                SQLite FTS5 Kalıcı Görev Hafızası
              </h4>
              <p className="text-[11px] text-slate-400">
                Colab yeniden başlasa dahi SQLite WAL modunda saklanan başarılı çözümler.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadMemory()}
                className="text-xs font-mono text-slate-300 hover:text-white px-2 py-1 bg-slate-950 rounded border border-slate-800 transition"
              >
                Yenile
              </button>
              <button
                onClick={clearMemory}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 px-2 py-1 bg-slate-950 rounded border border-slate-800 transition"
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {memoryEntries.length === 0 ? (
              <div className="text-xs font-mono text-slate-500 text-center py-6">
                Henüz kayıtlı hafıza girdisi bulunmuyor.
              </div>
            ) : (
              memoryEntries.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between gap-2"
                >
                  <div className="truncate max-w-[70%]">
                    <span
                      className={`font-bold mr-1.5 ${
                        item.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      [{item.status}]
                    </span>
                    <span className="text-slate-300">{item.prompt}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{item.engine}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Dışa Aktarma & Yedekleme (ZIP Backup Export) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              Colab Durumu & Hafıza Yedeğini İndir (ZIP)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Colab oturumu kapanmadan önce SQLite veritabanınızı, hafıza geçmişinizi, üretilen kodları ve API yapılandırmalarını tek tıkla ZIP olarak yedekleyin.
          </p>
          <button
            onClick={downloadBackup}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-semibold transition shadow-md"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Yedek Paketleniyor...' : 'Sistem ve Hafıza Yedeğini İndir (.ZIP)'}</span>
          </button>
        </div>

        {/* 6. Çift Yönlü Dosya Gezgini & Kod İnceleyici (File Explorer) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-400" />
              Colab Çalışma Alanı Dosya Gezgini
            </h4>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {fsPath}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {fsPath !== '.' && (
              <button
                onClick={() => {
                  const parent = fsPath.includes('/') ? fsPath.substring(0, fsPath.lastIndexOf('/')) || '.' : '.';
                  loadFs(parent);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded font-mono"
              >
                <ArrowLeft className="w-3 h-3" /> Üst Dizin
              </button>
            )}
            <button
              onClick={() => loadFs(fsPath)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Yenile
            </button>
          </div>

          {selectedFileContent !== null ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> {selectedFileName}
                </span>
                <button
                  onClick={() => setSelectedFileContent(null)}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  Geri Dön
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-60">
                {selectedFileContent}
              </pre>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {fsEntries.length === 0 ? (
                <div className="col-span-2 text-center text-xs font-mono text-slate-500 py-4">
                  Dizin boş veya sunucuya bağlı değil.
                </div>
              ) : (
                fsEntries.map((entry, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (entry.is_dir) {
                        loadFs(entry.path);
                      } else {
                        setSelectedFileName(entry.name);
                        loadFs(entry.path);
                      }
                    }}
                    className="flex items-center justify-between p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {entry.is_dir ? (
                        <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono text-slate-300 truncate">{entry.name}</span>
                    </div>
                    {!entry.is_dir && (
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">
                        {entry.size_bytes != null && Number.isFinite(Number(entry.size_bytes))
                          ? `${Math.round(Number(entry.size_bytes) / 1024)} KB`
                          : '0 KB'}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 7. Colab Oturumunu Açık Tutma İpucu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              Colab Kesilme Önleyici (Anti-Disconnect)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Google Colab sekmesinin arka planda uyumasını önlemek için tarayıcınızın Geliştirici Konsoluna (F12) yapıştırın:
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 select-all overflow-x-auto">
            {`function KeepAlive(){console.log("Colab canlı");document.querySelector("colab-connect-button")?.click()}setInterval(KeepAlive,60000)`}
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                `function KeepAlive(){console.log("Colab canlı");document.querySelector("colab-connect-button")?.click()}setInterval(KeepAlive,60000)`,
                'keep-alive'
              )
            }
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition border border-slate-700/80"
          >
            {copiedKey === 'keep-alive' ? 'Kopyalandı!' : 'Kodu Kopyala'}
          </button>

          <div className="text-[11px] text-slate-500 font-mono pt-1">
            Colab 20GB RAM oturumları arka planda 12 saate kadar kesintisiz çalışabilir.
          </div>
        </div>
      </div>
    </div>
  );
};
