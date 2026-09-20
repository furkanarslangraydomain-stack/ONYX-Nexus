import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  Activity, 
  Zap, 
  Layers, 
  RefreshCw, 
  Gauge, 
  CheckCircle2, 
  Cpu, 
  Clock, 
  BarChart3, 
  TrendingDown, 
  Coins 
} from 'lucide-react';

export interface ModelMetricData {
  time: string;
  timestamp: number;
  ttft: number; // Time To First Token in ms
  totalLatency: number; // Total latency in ms
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  tokensPerSec: number;
}

export interface ModelProfile {
  id: string;
  name: string;
  provider: string;
  tier: string;
  contextWindow: string;
  avgLatency: number;
  p95Latency: number;
  throughput: number;
  data: ModelMetricData[];
}

const INITIAL_MODELS: Record<string, ModelProfile> = {
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1 (Reasoning)',
    provider: 'OpenRouter Free / Awesome-FreeLLM',
    tier: 'Zero-Cost Free Tier',
    contextWindow: '128k',
    avgLatency: 380,
    p95Latency: 640,
    throughput: 42,
    data: [
      { time: '00:00', timestamp: 1, ttft: 210, totalLatency: 410, promptTokens: 420, completionTokens: 680, reasoningTokens: 340, tokensPerSec: 38 },
      { time: '00:05', timestamp: 2, ttft: 190, totalLatency: 390, promptTokens: 510, completionTokens: 720, reasoningTokens: 380, tokensPerSec: 41 },
      { time: '00:10', timestamp: 3, ttft: 240, totalLatency: 480, promptTokens: 780, completionTokens: 940, reasoningTokens: 520, tokensPerSec: 39 },
      { time: '00:15', timestamp: 4, ttft: 180, totalLatency: 350, promptTokens: 320, completionTokens: 540, reasoningTokens: 280, tokensPerSec: 45 },
      { time: '00:20', timestamp: 5, ttft: 200, totalLatency: 400, promptTokens: 610, completionTokens: 810, reasoningTokens: 410, tokensPerSec: 42 },
      { time: '00:25', timestamp: 6, ttft: 280, totalLatency: 540, promptTokens: 950, completionTokens: 1100, reasoningTokens: 620, tokensPerSec: 36 },
      { time: '00:30', timestamp: 7, ttft: 170, totalLatency: 340, promptTokens: 380, completionTokens: 610, reasoningTokens: 290, tokensPerSec: 46 },
      { time: '00:35', timestamp: 8, ttft: 195, totalLatency: 385, promptTokens: 540, completionTokens: 750, reasoningTokens: 370, tokensPerSec: 43 },
    ]
  },
  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'Llama-3.3-70B-Instruct',
    provider: 'OpenRouter Free Pool',
    tier: 'Zero-Cost Free Tier',
    contextWindow: '128k',
    avgLatency: 220,
    p95Latency: 340,
    throughput: 78,
    data: [
      { time: '00:00', timestamp: 1, ttft: 95, totalLatency: 230, promptTokens: 480, completionTokens: 520, reasoningTokens: 0, tokensPerSec: 74 },
      { time: '00:05', timestamp: 2, ttft: 88, totalLatency: 210, promptTokens: 390, completionTokens: 480, reasoningTokens: 0, tokensPerSec: 79 },
      { time: '00:10', timestamp: 3, ttft: 110, totalLatency: 260, promptTokens: 680, completionTokens: 710, reasoningTokens: 0, tokensPerSec: 72 },
      { time: '00:15', timestamp: 4, ttft: 82, totalLatency: 195, promptTokens: 290, completionTokens: 380, reasoningTokens: 0, tokensPerSec: 82 },
      { time: '00:20', timestamp: 5, ttft: 90, totalLatency: 215, promptTokens: 510, completionTokens: 560, reasoningTokens: 0, tokensPerSec: 77 },
      { time: '00:25', timestamp: 6, ttft: 125, totalLatency: 290, promptTokens: 820, completionTokens: 840, reasoningTokens: 0, tokensPerSec: 70 },
      { time: '00:30', timestamp: 7, ttft: 85, totalLatency: 200, promptTokens: 340, completionTokens: 420, reasoningTokens: 0, tokensPerSec: 81 },
      { time: '00:35', timestamp: 8, ttft: 92, totalLatency: 220, promptTokens: 460, completionTokens: 500, reasoningTokens: 0, tokensPerSec: 78 },
    ]
  },
  'qwen-coder-32b': {
    id: 'qwen-coder-32b',
    name: 'Qwen-2.5-Coder-32B',
    provider: 'Puter.js Zero-Key Gateway',
    tier: 'Zero-Key Unlimited',
    contextWindow: '64k',
    avgLatency: 185,
    p95Latency: 280,
    throughput: 88,
    data: [
      { time: '00:00', timestamp: 1, ttft: 75, totalLatency: 190, promptTokens: 620, completionTokens: 850, reasoningTokens: 0, tokensPerSec: 86 },
      { time: '00:05', timestamp: 2, ttft: 70, totalLatency: 175, promptTokens: 450, completionTokens: 690, reasoningTokens: 0, tokensPerSec: 91 },
      { time: '00:10', timestamp: 3, ttft: 90, totalLatency: 210, promptTokens: 790, completionTokens: 980, reasoningTokens: 0, tokensPerSec: 84 },
      { time: '00:15', timestamp: 4, ttft: 65, totalLatency: 165, promptTokens: 380, completionTokens: 540, reasoningTokens: 0, tokensPerSec: 94 },
      { time: '00:20', timestamp: 5, ttft: 72, totalLatency: 180, promptTokens: 530, completionTokens: 760, reasoningTokens: 0, tokensPerSec: 88 },
      { time: '00:25', timestamp: 6, ttft: 98, totalLatency: 235, promptTokens: 890, completionTokens: 1120, reasoningTokens: 0, tokensPerSec: 80 },
      { time: '00:30', timestamp: 7, ttft: 68, totalLatency: 170, promptTokens: 410, completionTokens: 630, reasoningTokens: 0, tokensPerSec: 92 },
      { time: '00:35', timestamp: 8, ttft: 74, totalLatency: 185, promptTokens: 570, completionTokens: 790, reasoningTokens: 0, tokensPerSec: 89 },
    ]
  },
  'gemini-flash': {
    id: 'gemini-flash',
    name: 'Gemini-2.0-Flash-Exp',
    provider: 'OpenRouter Free Tier / Google',
    tier: 'Experimental Free',
    contextWindow: '1M',
    avgLatency: 140,
    p95Latency: 210,
    throughput: 115,
    data: [
      { time: '00:00', timestamp: 1, ttft: 55, totalLatency: 145, promptTokens: 750, completionTokens: 680, reasoningTokens: 0, tokensPerSec: 112 },
      { time: '00:05', timestamp: 2, ttft: 50, totalLatency: 135, promptTokens: 520, completionTokens: 590, reasoningTokens: 0, tokensPerSec: 118 },
      { time: '00:10', timestamp: 3, ttft: 68, totalLatency: 160, promptTokens: 880, completionTokens: 810, reasoningTokens: 0, tokensPerSec: 108 },
      { time: '00:15', timestamp: 4, ttft: 48, totalLatency: 125, promptTokens: 410, completionTokens: 490, reasoningTokens: 0, tokensPerSec: 122 },
      { time: '00:20', timestamp: 5, ttft: 52, totalLatency: 138, promptTokens: 640, completionTokens: 670, reasoningTokens: 0, tokensPerSec: 114 },
      { time: '00:25', timestamp: 6, ttft: 72, totalLatency: 175, promptTokens: 1050, completionTokens: 920, reasoningTokens: 0, tokensPerSec: 104 },
      { time: '00:30', timestamp: 7, ttft: 49, totalLatency: 130, promptTokens: 470, completionTokens: 530, reasoningTokens: 0, tokensPerSec: 120 },
      { time: '00:35', timestamp: 8, ttft: 54, totalLatency: 140, promptTokens: 690, completionTokens: 710, reasoningTokens: 0, tokensPerSec: 116 },
    ]
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini (Relay)',
    provider: 'DuckDuckGo AI / Pollinations',
    tier: 'Zero-Key Shared',
    contextWindow: '128k',
    avgLatency: 260,
    p95Latency: 390,
    throughput: 65,
    data: [
      { time: '00:00', timestamp: 1, ttft: 110, totalLatency: 270, promptTokens: 380, completionTokens: 490, reasoningTokens: 0, tokensPerSec: 62 },
      { time: '00:05', timestamp: 2, ttft: 102, totalLatency: 250, promptTokens: 310, completionTokens: 430, reasoningTokens: 0, tokensPerSec: 67 },
      { time: '00:10', timestamp: 3, ttft: 130, totalLatency: 310, promptTokens: 550, completionTokens: 620, reasoningTokens: 0, tokensPerSec: 59 },
      { time: '00:15', timestamp: 4, ttft: 98, totalLatency: 240, promptTokens: 260, completionTokens: 370, reasoningTokens: 0, tokensPerSec: 69 },
      { time: '00:20', timestamp: 5, ttft: 105, totalLatency: 260, promptTokens: 420, completionTokens: 510, reasoningTokens: 0, tokensPerSec: 64 },
      { time: '00:25', timestamp: 6, ttft: 145, totalLatency: 340, promptTokens: 710, completionTokens: 740, reasoningTokens: 0, tokensPerSec: 56 },
      { time: '00:30', timestamp: 7, ttft: 100, totalLatency: 245, promptTokens: 290, completionTokens: 400, reasoningTokens: 0, tokensPerSec: 68 },
      { time: '00:35', timestamp: 8, ttft: 108, totalLatency: 265, promptTokens: 400, completionTokens: 500, reasoningTokens: 0, tokensPerSec: 65 },
    ]
  }
};

export function ModelTelemetryDashboard() {
  const [models, setModels] = useState<Record<string, ModelProfile>>(INITIAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>('deepseek-r1');
  const [isProbing, setIsProbing] = useState(false);
  const [chartView, setChartView] = useState<'all' | 'latency' | 'tokens'>('all');

  const selectedModel = models[selectedModelId] || models['deepseek-r1'];

  // Summary calculations
  const totalPromptTokens = useMemo(() => {
    return selectedModel.data.reduce((acc, curr) => acc + curr.promptTokens, 0);
  }, [selectedModel]);

  const totalCompletionTokens = useMemo(() => {
    return selectedModel.data.reduce((acc, curr) => acc + curr.completionTokens, 0);
  }, [selectedModel]);

  const totalReasoningTokens = useMemo(() => {
    return selectedModel.data.reduce((acc, curr) => acc + (curr.reasoningTokens || 0), 0);
  }, [selectedModel]);

  const grandTotalTokens = totalPromptTokens + totalCompletionTokens + totalReasoningTokens;

  // Real-time live probe simulation
  const handleProbeModel = () => {
    setIsProbing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const latencyVariance = Math.floor((Math.random() - 0.5) * 80);
      const newTotalLatency = Math.max(90, selectedModel.avgLatency + latencyVariance);
      const newTtft = Math.round(newTotalLatency * (selectedModel.id === 'deepseek-r1' ? 0.5 : 0.4));
      const promptTok = Math.floor(Math.random() * 400) + 300;
      const compTok = Math.floor(Math.random() * 600) + 400;
      const reasTok = selectedModel.id === 'deepseek-r1' ? Math.floor(compTok * 0.45) : 0;
      const throughputTokSec = Math.round((compTok / (newTotalLatency / 1000)));

      const newPoint: ModelMetricData = {
        time: timeStr,
        timestamp: Date.now(),
        ttft: newTtft,
        totalLatency: newTotalLatency,
        promptTokens: promptTok,
        completionTokens: compTok,
        reasoningTokens: reasTok,
        tokensPerSec: throughputTokSec
      };

      setModels(prev => {
        const current = prev[selectedModelId];
        const updatedData = [...current.data.slice(-9), newPoint];
        const newAvg = Math.round(updatedData.reduce((a, b) => a + b.totalLatency, 0) / updatedData.length);
        const newThroughput = Math.round(updatedData.reduce((a, b) => a + b.tokensPerSec, 0) / updatedData.length);
        return {
          ...prev,
          [selectedModelId]: {
            ...current,
            avgLatency: newAvg,
            throughput: newThroughput,
            data: updatedData
          }
        };
      });

      setIsProbing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Model Selection & Control Header */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Model Telemetrisi & Recharts Analitikleri</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                CANLI GÖZLEMLENEBİLİRLİK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Seçilen modelin gecikme eğilimleri (TTFT, E2E) ve token tüketim dinamikleri (Recharts ile modellenmiştir).
            </p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Model:</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {Object.values(models).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </select>

          {/* View Filter */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setChartView('all')}
              className={`px-2.5 py-1 rounded transition ${chartView === 'all' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => setChartView('latency')}
              className={`px-2.5 py-1 rounded transition ${chartView === 'latency' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Gecikme
            </button>
            <button
              onClick={() => setChartView('tokens')}
              className={`px-2.5 py-1 rounded transition ${chartView === 'tokens' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tokenlar
            </button>
          </div>

          <button
            onClick={handleProbeModel}
            disabled={isProbing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
            {isProbing ? 'Test Ediliyor...' : 'Canlı İstek Gönder (Ping)'}
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Ortalama Gecikme</span>
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono">
            {selectedModel.avgLatency} <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">TTFT ~{Math.round(selectedModel.avgLatency * 0.45)}ms</div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-amber-400" />
            <span>P95 Tavan Gecikme</span>
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            {selectedModel.p95Latency} <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Kararlı Yanıt Eşiği</div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>İşleme Hızı</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {selectedModel.throughput} <span className="text-xs text-slate-400">tok/s</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Üretim Verimi</div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Toplam Token</span>
          </div>
          <div className="text-lg font-bold text-indigo-300 font-mono">
            {(grandTotalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{totalPromptTokens} giriş / {totalCompletionTokens} çıkış</div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            <span>Tahmini Maliyet</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            $0.00
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">{selectedModel.tier}</div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            <span>Bağlam Penceresi</span>
          </div>
          <div className="text-lg font-bold text-purple-300 font-mono">
            {selectedModel.contextWindow}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{selectedModel.provider.split('/')[0]}</div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Latency Trends (LineChart / AreaChart) */}
        {(chartView === 'all' || chartView === 'latency') && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Gecikme Eğilimleri (Latency Trends - ms)
                </h4>
                <p className="text-[10px] text-slate-400">
                  İlk Token Süresi (TTFT) ve Uçtan Uca Toplam Yanıt Süresi
                </p>
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                P95 Sınırı: {selectedModel.p95Latency}ms
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedModel.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalLatencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="ttftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine y={selectedModel.p95Latency} label={{ value: 'P95 SLA', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="totalLatency" 
                    name="Toplam Gecikme (E2E)" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#totalLatencyGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ttft" 
                    name="İlk Token Süresi (TTFT)" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#ttftGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Token Consumption Breakdown (Stacked BarChart) */}
        {(chartView === 'all' || chartView === 'tokens') && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Token Tüketim Dağılımı (Token Consumption)
                </h4>
                <p className="text-[10px] text-slate-400">
                  Giriş (Prompt), Çıkış (Completion) ve Akıl Yürütme (Reasoning) Dağılımı
                </p>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                Verim: {selectedModel.throughput} tok/s
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedModel.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="promptTokens" name="Giriş (Prompt)" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="completionTokens" name="Çıkış (Completion)" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  {selectedModel.id === 'deepseek-r1' && (
                    <Bar dataKey="reasoningTokens" name="Düşünce (Reasoning)" fill="#f59e0b" stackId="a" radius={[3, 3, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 3: Generation Throughput & Velocity Trend (LineChart) */}
        {chartView === 'all' && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Üretim Hızı Eğrisi (Tokens Per Second - tok/s)
                </h4>
                <p className="text-[10px] text-slate-400">
                  Modelin yanıt üretme hızı dalgalanması ve akış performansı
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">
                Anlık: {selectedModel.data[selectedModel.data.length - 1]?.tokensPerSec || selectedModel.throughput} tok/s
              </span>
            </div>

            <div className="h-52 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedModel.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" t/s" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokensPerSec" 
                    name="Hız (Tokens/sec)" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', r: 3 }}
                    activeDot={{ r: 5, fill: '#fbbf24' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Model Spec Card */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div>
          <span className="text-slate-400">Aktif Model Bağlantısı: </span>
          <span className="text-cyan-400 font-bold">{selectedModel.name}</span>
          <span className="text-slate-500 ml-2">({selectedModel.provider})</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> %100 Hazır & Sıfır Maliyet
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Router: Smart Fallback Enabled</span>
        </div>
      </div>
    </div>
  );
}
