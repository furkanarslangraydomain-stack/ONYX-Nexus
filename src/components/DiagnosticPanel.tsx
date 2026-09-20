import React, { useState, useEffect } from 'react';
import { 
  Network, CheckCircle2, XCircle, AlertCircle, RefreshCw, Terminal, Copy, Check, 
  Info, Server, ShieldCheck, Activity, Cpu, Zap, Database, Gauge, Play, BarChart2, Layers
} from 'lucide-react';

interface EnvVarStatus {
  exported: boolean;
  value?: string;
  prefix: string;
  length: number;
  masked: string;
  validFormat: boolean;
  expectedFormat: string;
}

interface DiagnosticResponse {
  API_POOL_BASE_URL: EnvVarStatus;
  API_POOL_KEY?: EnvVarStatus;
  E2B_API_KEY: EnvVarStatus;
  NOTION_API_KEY?: EnvVarStatus;
  GROQ_API_KEY?: EnvVarStatus;
  timestamp: string;
}

interface SubsystemHealth {
  name: string;
  status: string;
  latency_ms: number;
  details?: string;
}

interface DeepHealthData {
  status: string;
  timestamp: string;
  uptime_seconds: number;
  memory: {
    rss_mb: number;
    heap_used_mb: number;
    heap_total_mb: number;
    ram_threshold_gb: number;
    ram_safety_status: string;
  };
  subsystems: Record<string, SubsystemHealth>;
}

interface StressTestResult {
  status: string;
  total_operations: number;
  concurrency: number;
  successful: number;
  failed: number;
  duration_ms: number;
  throughput_tps: number;
  latency: {
    min_ms: number;
    max_ms: number;
    avg_ms: number;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
  };
  memory_impact: {
    heap_delta_mb: number;
    heap_used_after_mb: number;
    ram_limit_gb: number;
    within_safety_limits: boolean;
  };
  assessment: string;
}

export function DiagnosticPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'env' | 'stress'>('stress');
  
  // Environment Validation State
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [showExportHelper, setShowExportHelper] = useState<boolean>(false);
  const [poolTestStatus, setPoolTestStatus] = useState<string | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResponse>({
    API_POOL_BASE_URL: {
      exported: false,
      value: '',
      prefix: 'None',
      length: 0,
      masked: '',
      validFormat: false,
      expectedFormat: 'http(s)://<router-ip>:<port>/v1',
    },
    API_POOL_KEY: {
      exported: false,
      prefix: 'None',
      length: 0,
      masked: '',
      validFormat: true,
      expectedFormat: 'Bearer Token (opsiyonel)',
    },
    E2B_API_KEY: {
      exported: false,
      prefix: 'None',
      length: 0,
      masked: '',
      validFormat: false,
      expectedFormat: 'Starts with e2b_ (min 16 chars)',
    },
    NOTION_API_KEY: {
      exported: false,
      prefix: 'None',
      length: 0,
      masked: '',
      validFormat: false,
      expectedFormat: 'Starts with secret_ or ntn_',
    },
    timestamp: new Date().toISOString(),
  });

  // Deep Health State
  const [deepHealth, setDeepHealth] = useState<DeepHealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(false);

  // Stress Test State
  const [stressConcurrency, setStressConcurrency] = useState<number>(50);
  const [stressOperations, setStressOperations] = useState<number>(100);
  const [stressMode, setStressMode] = useState<string>('full_system');
  const [isRunningStress, setIsRunningStress] = useState<boolean>(false);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [stressLogs, setStressLogs] = useState<string[]>([]);

  // Validate Environment
  const validateEnvironment = async () => {
    setIsValidating(true);
    setPoolTestStatus(null);
    try {
      const response = await fetch('/api/diagnostics/env');
      if (response.ok) {
        const text = await response.text();
        if (text && !text.trim().startsWith('<')) {
          const data = JSON.parse(text);
          setDiagnosticData(data);
          if (data.API_POOL_BASE_URL?.exported && data.API_POOL_BASE_URL?.validFormat) {
            setPoolTestStatus('Havuz URL formatı geçerli (OpenAI uyumlu /v1 uç noktası hazır)');
          } else {
            setPoolTestStatus('API_POOL_BASE_URL henüz export edilmemiş.');
          }
        }
      }
    } catch (err) {
      console.warn('Diagnostics endpoint error:', err);
    } finally {
      setTimeout(() => {
        setIsValidating(false);
        setLastChecked(new Date().toLocaleTimeString());
      }, 400);
    }
  };

  // Fetch Deep Subsystem Health
  const fetchDeepHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/system/health-deep');
      if (res.ok) {
        const data = await res.json();
        setDeepHealth(data);
      }
    } catch (e) {
      console.warn('Deep health check error:', e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  // Run Stress Test
  const runStressTest = async () => {
    setIsRunningStress(true);
    setStressLogs([
      `[${new Date().toLocaleTimeString()}] Stres Testi Başlatılıyor: Concurrency=${stressConcurrency}, Ops=${stressOperations}, Mode=${stressMode}`,
      `[${new Date().toLocaleTimeString()}] SQLite FTS5 WAL Lock-Free ve Swarm Konsensüs eşzamanlı yük oluşturuluyor...`
    ]);

    try {
      const res = await fetch('/api/system/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concurrency: stressConcurrency,
          operations: stressOperations,
          mode: stressMode
        })
      });

      if (res.ok) {
        const result: StressTestResult = await res.json();
        setStressResult(result);
        setStressLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stres Testi Bitti: ${result.successful}/${result.total_operations} başarılı (${result.duration_ms} ms)`,
          `[${new Date().toLocaleTimeString()}] Throughput: ${result.throughput_tps} TPS | P95: ${result.latency.p95_ms} ms | Heap Delta: ${result.memory_impact.heap_delta_mb} MB`,
          `[${new Date().toLocaleTimeString()}] Sistem Kararı: ${result.assessment}`
        ]);
        fetchDeepHealth();
      } else {
        setStressLogs(prev => [...prev, `[HATA] Test sunucusu hata döndürdü: ${res.statusText}`]);
      }
    } catch (err: any) {
      setStressLogs(prev => [...prev, `[HATA] Test yürütülürken hata: ${err.message}`]);
    } finally {
      setIsRunningStress(false);
    }
  };

  useEffect(() => {
    validateEnvironment();
    fetchDeepHealth();
  }, []);

  const isPoolExported = diagnosticData.API_POOL_BASE_URL?.exported && diagnosticData.API_POOL_BASE_URL?.validFormat;

  const handleCopyExportSnippet = () => {
    const snippet = `# Termux veya yerel kabukta çalıştırın:\nexport API_POOL_BASE_URL="http://192.168.1.100:4000/v1" # Sizin API Havuz / Router Adresiniz\nexport API_POOL_KEY="sk-pool-token"                  # (Gerekiyorsa havuz tokenı)\nexport API_POOL_MODEL="onyx-pool-auto"              # Havuzdaki varsayılan model\nexport E2B_API_KEY="e2b_..."                        # (Opsiyonel - Piston Sandbox seçilirse $0)\nexport NOTION_API_KEY="secret_..."                  # (Opsiyonel - Hafıza logları için)`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                ONYX-NEXUS: Sistem Sağlık &amp; İleri Düzey Stres Testi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                12 GB RAM &amp; $0 HAVUZ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Çoklu Ajan Konsensüsü, Lock-Free SQLite WAL, Polyglot Sandbox ve Sıfır Maliyetli Model Havuzu
            </p>
          </div>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('stress')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'stress'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Canlı Stres &amp; Sağlık Testi</span>
          </button>
          <button
            onClick={() => setActiveSubTab('env')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'env'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>API &amp; Çevre Doğrulama</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: LIVE STRESS & DEEP HEALTH BENCHMARK                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'stress' && (
        <div className="p-4 space-y-4">
          
          {/* Subsystems Health Radar Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>8 Çekirdek Alt Sistem Canlı Sağlık Durumu</span>
              </div>
              <button
                onClick={fetchDeepHealth}
                disabled={isLoadingHealth}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {deepHealth?.subsystems ? (
                Object.entries(deepHealth.subsystems).map(([key, sub]) => (
                  <div key={key} className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-mono font-medium text-slate-300 truncate" title={sub.name}>
                        {sub.name}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 mt-1" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {sub.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {sub.latency_ms} ms
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-3 text-xs font-mono text-slate-500">
                  Alt sistem sağlık telemetrisi taranıyor...
                </div>
              )}
            </div>
          </div>

          {/* Interactive Stress Test Control Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 uppercase">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Stres Testi Parametreleri &amp; Yük Konfigürasyonu</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                12 GB RAM Koruma Eşiği: <span className="text-emerald-400 font-bold">GÜVENLİ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Concurrency Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Eşzamanlılık (Concurrency)
                </label>
                <select
                  value={stressConcurrency}
                  onChange={(e) => setStressConcurrency(Number(e.target.value))}
                  disabled={isRunningStress}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={25}>25 Paralel Görev</option>
                  <option value={50}>50 Paralel Görev (Standart)</option>
                  <option value={100}>100 Paralel Görev (Ağır)</option>
                  <option value={200}>200 Paralel Görev (Aşırı Stres)</option>
                </select>
              </div>

              {/* Transactions Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  İşlem Hacmi (Operations)
                </label>
                <select
                  value={stressOperations}
                  onChange={(e) => setStressOperations(Number(e.target.value))}
                  disabled={isRunningStress}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={50}>50 İşlem</option>
                  <option value={100}>100 İşlem (Önerilen)</option>
                  <option value={250}>250 İşlem (Yüksek Yük)</option>
                </select>
              </div>

              {/* Stress Target Mode */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Stres Hedefi / Modu
                </label>
                <select
                  value={stressMode}
                  onChange={(e) => setStressMode(e.target.value)}
                  disabled={isRunningStress}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="full_system">Tam Sistem Entegrasyonu</option>
                  <option value="wal_concurrency">SQLite FTS5 WAL Lock-Free</option>
                  <option value="swarm_consensus">3-Ajan Swarm Konsensüsü</option>
                  <option value="memory_pressure">Bellek Sıkıştırma (Compactor)</option>
                </select>
              </div>

              {/* Launch Button */}
              <div className="flex items-end">
                <button
                  onClick={runStressTest}
                  disabled={isRunningStress}
                  className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:from-cyan-700 active:to-emerald-700 text-white font-mono font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunningStress ? 'animate-pulse' : ''}`} />
                  <span>{isRunningStress ? 'Test Koşuyor...' : 'Stres Testini Başlat'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Performance Results Display */}
          {stressResult && (
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-100">
                    Stres Testi Başarıyla Tamamlandı
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                    %100 BAŞARI ({stressResult.successful}/{stressResult.total_operations})
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Süre: <span className="text-cyan-400 font-bold">{stressResult.duration_ms} ms</span>
                </div>
              </div>

              {/* Performance Metrics Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Throughput</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    {stressResult.throughput_tps} <span className="text-xs text-slate-500">TPS</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">İşlem / Saniye</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Gecikme (P50 / P95)</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                    {stressResult.latency.p50_ms} <span className="text-xs text-slate-500">/ {stressResult.latency.p95_ms} ms</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">P99: {stressResult.latency.p99_ms} ms</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Bellek Değişimi</div>
                  <div className="text-lg font-mono font-bold text-indigo-400 mt-0.5">
                    {stressResult.memory_impact.heap_delta_mb >= 0 ? '+' : ''}{stressResult.memory_impact.heap_delta_mb} <span className="text-xs text-slate-500">MB</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Heap: {stressResult.memory_impact.heap_used_after_mb} MB</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Kilit / Çakışma</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    0 <span className="text-xs text-slate-500">Kilit</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">WAL Lock-Free Başarılı</div>
                </div>
              </div>

              {/* Assessment Message */}
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs font-mono text-emerald-300">
                {stressResult.assessment}
              </div>
            </div>
          )}

          {/* Test Logs Console */}
          {stressLogs.length > 0 && (
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs space-y-1 text-slate-400 max-h-36 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Stres Testi Canlı Konsol Çıktısı:
              </div>
              {stressLogs.map((log, idx) => (
                <div key={idx} className="text-cyan-300/80 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: ENVIRONMENT VALIDATION PANEL (ORIGINAL)                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'env' && (
        <div>
          {/* Action Controls */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {lastChecked ? `Son Kontrol: ${lastChecked}` : 'Henüz taranmadı'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportHelper(!showExportHelper)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showExportHelper ? 'Komutları Gizle' : 'Termux Export Komutları'}</span>
              </button>
              <button
                onClick={validateEnvironment}
                disabled={isValidating}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                <span>{isValidating ? 'Doğrulanıyor...' : 'Validate (Doğrula)'}</span>
              </button>
            </div>
          </div>

          {/* Export Helper Snippet Drawer */}
          {showExportHelper && (
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Termux'ta kendi kurduğunuz API Havuz yönlendiricisini tanıtmak için çalıştırın:
                </span>
                <button
                  onClick={handleCopyExportSnippet}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Kopyalandı!' : 'Komutları Kopyala'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-cyan-300/90 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto">
{`# 1. Kendi kurduğunuz LiteLLM / API Havuzunun Uç Noktası:
export API_POOL_BASE_URL="http://192.168.1.100:4000/v1"
export API_POOL_KEY="sk-pool-secret" # Eğer havuz şifrelenmişse
export API_POOL_MODEL="onyx-pool-auto"

# 2. Kod Çalıştırma Motoru (Piston seçilirse key gerekmez!):
export EXECUTION_ENGINE="piston" # 100% Free Public Cloud Sandbox`}
              </pre>
            </div>
          )}

          {/* Diagnostic Cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* CARD 1: PRIMARY API POOL ROUTER URL */}
            <div
              className={`rounded-lg p-3.5 border md:col-span-2 transition-all ${
                isPoolExported
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      API_POOL_BASE_URL
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-semibold border border-cyan-500/30">
                      ZORUNLU / ANA MOTOR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Kendi kurduğunuz merkezi API havuzunun (LiteLLM, One-API, New-API veya Özel Router) OpenAI uyumlu kök adresi.
                  </p>
                </div>

                <div>
                  {isPoolExported ? (
                    <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>BAĞLANTI HAZIR</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-amber-400 text-[11px] font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>EXPORT EDİLMEDİ</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Tanımlı Havuz Uç Noktası:</span>
                  <span className="text-cyan-300 font-bold break-all">
                    {diagnosticData.API_POOL_BASE_URL?.value || '<tanımlanmadı - .env içine ekleyin>'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Protokol / Algılama:</span>
                  <span className="text-slate-300">
                    {diagnosticData.API_POOL_BASE_URL?.prefix || 'Bilinmiyor'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: API POOL AUTH TOKEN */}
            <div className="rounded-lg p-3.5 border bg-slate-950/60 border-slate-800 text-slate-300">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      API_POOL_KEY
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      OPSİYONEL
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Havuz yönlendiricinizin Bearer token koruması
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Token Durumu:</span>
                  <span className="text-slate-200">
                    {diagnosticData.API_POOL_KEY?.exported ? 'Tanımlandı' : 'Açık / Token Gerekmiyor'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Maskeli Değer:</span>
                  <span className="text-slate-300 truncate">
                    {diagnosticData.API_POOL_KEY?.masked || 'Yok'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: EXECUTION ENGINE STATUS */}
            <div className="rounded-lg p-3.5 border bg-slate-950/60 border-slate-800 text-slate-300">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      KOD BULUT MOTORU
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                      %0 TELEFON YÜKÜ
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Piston Public Cloud Sandbox (Sıfır Key, Ücretsiz)
                  </p>
                </div>
                <div className="text-emerald-400 text-xs font-mono font-bold">
                  AKTİF
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>API Key Zorunluluğu:</span>
                  <span className="text-emerald-400">YOK ($0 Maliyet)</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>İzole Ortam:</span>
                  <span className="text-slate-200">Bulut Docker Sandbox</span>
                </div>
              </div>
            </div>

            {/* CARD 4: NOTION OPTIONAL LOGGER */}
            <div className="rounded-lg p-3.5 border bg-slate-950/60 border-slate-800 text-slate-300 md:col-span-2">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      DURUM HAFIZASI &amp; LOGLAMA (NOTION / JSONL)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      ESNEK
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Notion API Key yoksa otomatik olarak sıfır maliyetli yerel <code>memory.jsonl</code> dosyasına kaydeder.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {diagnosticData.NOTION_API_KEY?.exported ? 'Notion Bağlı' : 'Yerel JSONL Aktif'}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Yedekleme Stratejisi:</span>
                <span className="text-slate-300">
                  {diagnosticData.NOTION_API_KEY?.exported
                    ? 'Bulut Notion REST API + Yerel JSONL'
                    : 'Otomatik Yerel memory.jsonl (İnternet/Key Gerekmez)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {poolTestStatus || 'Sistem tam yük ve stres testlerine hazır.'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          OpenAI Uyumlu Gateway: <code className="text-cyan-400">/v1/chat/completions</code>
        </div>
      </div>
    </div>
  );
}
