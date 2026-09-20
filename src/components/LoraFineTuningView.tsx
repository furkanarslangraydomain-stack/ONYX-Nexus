import { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Play,
  Square,
  Flame,
  Settings,
  Download,
  CheckCircle2,
  HardDrive,
  BarChart3,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export function LoraFineTuningView() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([2.84, 2.31, 1.87, 1.42, 1.05, 0.78, 0.54, 0.38]);
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-Coder-7B-Instruct');
  const [quantMode, setQuantMode] = useState<'4bit' | '8bit' | '16bit'>('4bit');
  const [loraRank, setLoraRank] = useState(16);
  const [learningRate, setLearningRate] = useState('2e-4');

  useEffect(() => {
    let interval: any;
    if (isTraining) {
      interval = setInterval(() => {
        setCurrentStep(s => {
          if (s >= 500) {
            setIsTraining(false);
            return 500;
          }
          const nextStep = s + 25;
          const nextLoss = Math.max(0.24, 2.8 - (nextStep / 500) * 2.5 + (Math.random() * 0.05 - 0.025));
          setLossHistory(prev => [...prev.slice(-15), parseFloat(nextLoss.toFixed(3))]);
          setCurrentEpoch(Math.min(3, Math.floor((nextStep / 500) * 3) + 1));
          return nextStep;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleToggleTraining = () => {
    if (isTraining) {
      setIsTraining(false);
    } else {
      setCurrentStep(0);
      setCurrentEpoch(1);
      setLossHistory([2.84]);
      setIsTraining(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">
                  Tesla T4 GPU LoRA / QLoRA Eğitim Stüdyosu
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  T4 GPU 15.8GB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Colab hücresindeki NVIDIA Tesla T4 GPU üzerinde açık kaynaklı kodlama modellerini özelleştirin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTraining}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition shadow-lg ${
                isTraining
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isTraining ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Eğitimi Durdur</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>LoRA Eğitimini Başlat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Hardware Telemetry */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">GPU VRAM Kullanımı</div>
            <div className="text-amber-400 font-bold text-sm mt-0.5">
              {isTraining ? '8.4 GB' : '1.8 GB'} / 15.8 GB
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: isTraining ? '53%' : '11%' }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Sıcaklık & Güç</div>
            <div className="text-slate-200 font-bold text-sm mt-0.5">
              {isTraining ? '64°C • 68W' : '46°C • 24W'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Fan Hızı: %42</div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Eğitim İlerlemesi</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5">
              Adım: {currentStep} / 500
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Epoch: {currentEpoch} / 3</div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Anlık Kayıp (Loss)</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">
              {lossHistory[lossHistory.length - 1]}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Hedef: &lt; 0.40</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hyperparameters & Loss Curves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Training Loss Curve Visualization */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  Kayıp Eğrisi (Training Loss Curve)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Cross-Entropy Loss (Adım Başına)
              </span>
            </div>

            {/* Simple visual loss chart */}
            <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-end justify-between gap-1">
              {lossHistory.map((val, idx) => {
                const heightPercent = Math.min(100, Math.max(10, (val / 3.0) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">
                      {val}
                    </div>
                    <div
                      className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-emerald-600 to-cyan-400 group-hover:from-emerald-400 group-hover:to-cyan-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="text-[8px] font-mono text-slate-600">
                      #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Selection & Quantization */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-white">
                Model & Kuantizasyon Yapılandırması
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1.5">Temel Model (Base Model):</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Qwen/Qwen2.5-Coder-7B-Instruct">Qwen 2.5 Coder 7B Instruct</option>
                  <option value="meta-llama/Llama-3.1-8B-Instruct">Llama 3.1 8B Instruct</option>
                  <option value="deepseek-ai/deepseek-coder-6.7b-instruct">DeepSeek Coder 6.7B</option>
                  <option value="mistralai/Mistral-7B-Instruct-v0.3">Mistral 7B Instruct</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5">Kuantizasyon (Quantization):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '4bit', label: '4-bit (NF4)', desc: 'QLoRA (~6GB VRAM)' },
                    { id: '8bit', label: '8-bit', desc: 'BitsAndBytes' },
                    { id: '16bit', label: '16-bit', desc: 'BFloat16' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setQuantMode(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition ${
                        quantMode === m.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5">LoRA Derecesi (Rank - r):</label>
                <select
                  value={loraRank}
                  onChange={(e) => setLoraRank(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={8}>r = 8 (Hafif adaptör - 14MB)</option>
                  <option value={16}>r = 16 (Önerilen - 28MB)</option>
                  <option value={32}>r = 32 (Yüksek kapasite - 56MB)</option>
                  <option value={64}>r = 64 (Maksimum hassasiyet - 112MB)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5">Öğrenme Oranı (Learning Rate):</label>
                <input
                  type="text"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Dataset & Export Weights */}
        <div className="space-y-6">
          {/* Dataset Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold font-mono text-white">
                Eğitim Veri Seti
              </h3>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-200 font-bold">
                onyx_instruct_v4.jsonl
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                4,200 adet ONYX-Nexus TypeScript, Python ve ZK-Privacy talimat-çifti.
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span>Format: Alpaca / ShareGPT</span>
                <span className="text-purple-400">14.2 MB</span>
              </div>
            </div>
          </div>

          {/* Export Adapters Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold font-mono text-white">
                Model Ağırlıklarını Dışa Aktar
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono mb-4">
              Eğitilen LoRA adaptörlerini ana modelle birleştirin veya GGUF formatında yerel Ollama/vLLM için indirin.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <button
                onClick={() => alert("LoRA adaptörleri Colab dosya sistemine kaydedildi: /content/onyx-lora-adapter")}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>LoRA Adaptörünü İndir (.safetensors)</span>
              </button>

              <button
                onClick={() => alert("Model GGUF Q4_K_M formatına dönüştürülüyor...")}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>GGUF Q4_K_M Olarak Dönüştür</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
