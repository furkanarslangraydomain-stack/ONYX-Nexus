import React, { useState, useEffect } from 'react';
import { Network, CheckCircle2, XCircle, AlertCircle, RefreshCw, Terminal, Copy, Check, Info, Server, ShieldCheck, ArrowRight } from 'lucide-react';

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

export function DiagnosticPanel() {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [showExportHelper, setShowExportHelper] = useState<boolean>(false);
  const [poolTestStatus, setPoolTestStatus] = useState<string | null>(null);

  // Local simulated state
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

  useEffect(() => {
    validateEnvironment();
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
      {/* Panel Header */}
      <div className="bg-slate-850 px-4 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                API Havuzu &amp; Uç Nokta Doğrulama Paneli
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                isPoolExported
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isPoolExported ? 'ÖZEL API HAVUZU AKTİF' : 'GÖMÜLÜ SIFIR-ANAHTAR HAVUZU AKTİF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Awesome-FreeLLM-APIs (Pollinations DeepSeek/OpenAI) gömülüdür; API girmeden doğrudan çalışır.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {lastChecked && (
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Son Kontrol: {lastChecked}
            </span>
          )}
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

      {/* Summary Footer */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {poolTestStatus || 'Doğrulamak için "Validate" butonuna basın.'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          OpenAI Compatible Gateway: <code className="text-cyan-400">/v1/chat/completions</code>
        </div>
      </div>
    </div>
  );
}
