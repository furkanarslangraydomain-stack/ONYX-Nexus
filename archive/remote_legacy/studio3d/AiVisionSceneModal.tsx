import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  X, 
  Layers, 
  Sun, 
  Cpu, 
  Sliders, 
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';
import { AI_VISION_PRESETS } from './defaultScenes';
import { SceneObject, SceneEnvironment } from './types';

interface AiVisionSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedScene: (data: {
    sceneTitle: string;
    environment: SceneEnvironment;
    objects: SceneObject[];
    detectedStyle: string;
    aiAnalysis: string;
  }) => void;
}

export const AiVisionSceneModal: React.FC<AiVisionSceneModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedScene
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cyberpunk-monolith');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setSelectedPresetId('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/vision-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset_id: selectedPresetId,
          image_data: customImage,
          prompt: customPrompt
        })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('AI Vision error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!analysisResult) return;
    onApplyGeneratedScene({
      sceneTitle: analysisResult.scene_title,
      environment: analysisResult.environment,
      objects: analysisResult.objects,
      detectedStyle: analysisResult.detected_style,
      aiAnalysis: analysisResult.ai_analysis
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                Görselden AI Sahne Oluşturucu
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Multimodal Vision 3D
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Bir görsel yükleyin veya konsept referansı seçin; yapay zeka derinlik, PBR malzeme ve 3D nesneleri otomatik inşa etsin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Preset Selection Strip */}
          <div>
            <label className="font-semibold text-slate-300 font-mono text-[11px] block mb-2">
              1. Referans Görsel veya Konsept Seçin:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AI_VISION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomImage(null);
                    }}
                    className={`rounded-xl border p-2 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-20 rounded-lg overflow-hidden relative mb-2 bg-slate-950">
                      <img
                        src={preset.thumbnail}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-[9px] font-mono px-1 rounded bg-slate-900/90 text-purple-300">
                        {preset.style}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 text-[11px] truncate">
                      {preset.title}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {preset.dominantColors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Or Upload Custom Image */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 font-mono text-[11px]">
                2. Veya Kendi Görselinizi Yükleyin:
              </span>
              {customImage && (
                <button
                  onClick={() => setCustomImage(null)}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Görseli Temizle
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-4 cursor-pointer transition bg-slate-900/40">
                <Upload className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-[11px] text-slate-300 font-medium">Görsel Seç veya Sürükle Bırak</span>
                <span className="text-[9px] text-slate-500">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {customImage && (
                <div className="w-24 h-20 rounded-xl border border-purple-500/60 overflow-hidden relative shrink-0">
                  <img src={customImage} alt="Uploaded" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded">
                    Hazır
                  </span>
                </div>
              )}
            </div>

            {/* Optional text prompt */}
            <div>
              <label className="text-[10px] text-slate-400 font-mono block mb-1">
                İlave Sahne Yönergesi / Prompt (Opsiyonel):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Örn: Havada asılı duran mor kristal piramitler ve koyu yeşil plazma halkaları..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Görseli Analiz Ediyor & 3D Geometrileri Oluşturuyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Görseli Analiz Et & 3D Sahneyi Üret</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/40 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <div>
                  <div className="text-[10px] font-mono text-purple-400 uppercase">Tespit Edilen Sahne</div>
                  <div className="text-sm font-bold text-slate-100">{analysisResult.scene_title}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {analysisResult.detected_style}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-purple-400 font-mono">Derinlik & Renk Analizi: </span>
                {analysisResult.ai_analysis}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Üretilen Nesneler:</span>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {analysisResult.objects?.length || 4} Geometri
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">PBR Işıklandırma:</span>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    Key & Fill Dual Rig
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Animasyon:</span>
                  <div className="text-xs font-bold text-cyan-400 mt-0.5">
                    Harmonik Salınım
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Volumetrik Sis:</span>
                  <div className="text-xs font-bold text-purple-400 mt-0.5">
                    Aktif
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Bu Sahneyi 3D Tuvale Yükle & Başlat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
