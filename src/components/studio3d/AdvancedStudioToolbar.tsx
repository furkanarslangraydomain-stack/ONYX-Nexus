import React from 'react';
import { 
  Atom, 
  Music, 
  Clapperboard, 
  Compass, 
  Box, 
  ShieldCheck, 
  Film, 
  Eye,
  Glasses,
  Zap,
  Radio,
  Brain,
  HeartPulse
} from 'lucide-react';
import { 
  PhysicsWorldConfig, 
  AudioReactiveConfig, 
  PostProcessingConfig, 
  DirectorCameraShot, 
  WebXrViewMode 
} from './types';

interface AdvancedStudioToolbarProps {
  onOpenModelLibrary: () => void;
  onOpenSelfHealing: () => void;
  onOpenModulesHealth?: () => void;
  onOpenConsciousness?: () => void;
  onToggleKeyframeStudio: () => void;
  isKeyframeStudioOpen: boolean;
  physicsConfig: PhysicsWorldConfig;
  onUpdatePhysics: (cfg: Partial<PhysicsWorldConfig>) => void;
  onThrowSelected: () => void;
  hasSelectedObject: boolean;
  audioConfig: AudioReactiveConfig;
  onToggleAudio: (source: 'synth' | 'microphone' | 'none') => void;
  postProcessing: PostProcessingConfig;
  onUpdatePostProcessing: (cfg: Partial<PostProcessingConfig>) => void;
  cameraShot: DirectorCameraShot;
  onChangeCameraShot: (shot: DirectorCameraShot) => void;
  xrMode: WebXrViewMode;
  onChangeXrMode: (mode: WebXrViewMode) => void;
  healthScore: number;
  modulesHealthStatus?: 'optimal' | 'recovering' | 'degraded';
  totalReinitCount?: number;
}

export const AdvancedStudioToolbar: React.FC<AdvancedStudioToolbarProps> = ({
  onOpenModelLibrary,
  onOpenSelfHealing,
  onOpenModulesHealth,
  onOpenConsciousness,
  onToggleKeyframeStudio,
  isKeyframeStudioOpen,
  physicsConfig,
  onUpdatePhysics,
  onThrowSelected,
  hasSelectedObject,
  audioConfig,
  onToggleAudio,
  postProcessing,
  onUpdatePostProcessing,
  cameraShot,
  onChangeCameraShot,
  xrMode,
  onChangeXrMode,
  healthScore,
  modulesHealthStatus = 'optimal',
  totalReinitCount = 0
}) => {
  return (
    <div className="h-10 border-b border-slate-800 bg-slate-950/90 px-3 flex items-center justify-between overflow-x-auto gap-2 text-xs font-mono select-none">
      
      {/* Left: 5 Advanced Module Quick Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Module 1: 3D Model Library */}
        <button
          onClick={onOpenModelLibrary}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition shadow-sm"
          title="3D Model & GLTF/GLB Kütüphanesi"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Model / GLTF</span>
        </button>

        {/* Module 2: Physics Engine Toggle */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={() => onUpdatePhysics({ enabled: !physicsConfig.enabled })}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              physicsConfig.enabled 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="RigidBody Fizik Simülasyonu Aç/Kapat"
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Fizik: {physicsConfig.enabled ? 'Açık' : 'Kapalı'}</span>
          </button>
          {physicsConfig.enabled && hasSelectedObject && (
            <button
              onClick={onThrowSelected}
              className="px-1.5 py-0.5 text-[10px] bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 rounded ml-1 border border-amber-500/20"
              title="Seçili nesneye yukarı fırlatma darbesi ver"
            >
              Fırlat
            </button>
          )}
        </div>

        {/* Module 3: Audio-Reactive VJ Toggle */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={() => {
              if (audioConfig.source === 'none') {
                onToggleAudio('synth');
              } else if (audioConfig.source === 'synth') {
                onToggleAudio('microphone');
              } else {
                onToggleAudio('none');
              }
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              audioConfig.enabled 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold animate-pulse' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Müzik ve Ses Frekanslarına Duyarlı VJ Efektleri"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio VJ: {audioConfig.source === 'synth' ? 'Synthwave' : audioConfig.source === 'microphone' ? 'Mikrofon' : 'Kapalı'}</span>
          </button>
        </div>

        {/* Module 4: Cinematic Post-Processing Controls */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={() => onUpdatePostProcessing({ bloom: !postProcessing.bloom })}
            className={`px-1.5 py-0.5 rounded transition ${
              postProcessing.bloom ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Neon Bloom Işıltısı"
          >
            Bloom
          </button>
          <button
            onClick={() => onUpdatePostProcessing({ anamorphicBars: !postProcessing.anamorphicBars })}
            className={`px-1.5 py-0.5 rounded transition ${
              postProcessing.anamorphicBars ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="2.39:1 Sinematik Kapsam Barları"
          >
            2.39:1
          </button>
          <button
            onClick={() => onUpdatePostProcessing({ chromaticAberration: !postProcessing.chromaticAberration })}
            className={`px-1.5 py-0.5 rounded transition ${
              postProcessing.chromaticAberration ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Kromatik Sapma ve Siber Glitch"
          >
            Aberration
          </button>
        </div>

        {/* Module 5: Director Camera Shots */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 px-2 py-0.5 text-slate-300">
          <Clapperboard className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
          <select
            value={cameraShot}
            onChange={(e) => onChangeCameraShot(e.target.value as DirectorCameraShot)}
            className="bg-transparent text-xs text-cyan-300 focus:outline-none cursor-pointer"
          >
            <option value="free" className="bg-slate-900">Serbest Orbit Kamera</option>
            <option value="cinematic_orbit" className="bg-slate-900">360° Sinematik Pan</option>
            <option value="dolly_zoom" className="bg-slate-900">Hero Dolly Zoom (Vertigo)</option>
            <option value="drone_flyby" className="bg-slate-900">Drone Uçuşu (Flyby)</option>
            <option value="low_angle_hero" className="bg-slate-900">Düşük Açı (Hero Shot)</option>
            <option value="handheld_shake" className="bg-slate-900">El Kamerası Sarsıntısı</option>
          </select>
        </div>

        {/* WebXR AR/VR Mode */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={() => onChangeXrMode(xrMode === 'standard' ? 'ar_passthrough' : xrMode === 'ar_passthrough' ? 'vr_stereoscopic' : 'standard')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              xrMode !== 'standard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="WebXR AR Passthrough veya VR Stereoskopik Gözlük Modu"
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>XR: {xrMode === 'standard' ? 'Normal' : xrMode === 'ar_passthrough' ? 'AR HUD' : 'VR 3D'}</span>
          </button>
        </div>

      </div>

      {/* Right: Keyframe Studio, Health Check Badge & Synthetic Consciousness */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* 5 Modules Health Check Scanner Indicator */}
        <button
          onClick={onOpenModulesHealth || onOpenSelfHealing}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
            modulesHealthStatus === 'optimal'
              ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : modulesHealthStatus === 'recovering'
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 animate-pulse font-bold'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
          title="5 Harici Modül Periyodik Sağlık Taraması ve Otomatik Re-Initialization"
        >
          <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
          <span>5 Modül: {modulesHealthStatus === 'optimal' ? 'Optimal' : 'Kurtarılıyor'} {totalReinitCount > 0 ? `(${totalReinitCount}x)` : ''}</span>
        </button>

        {/* Synthetic Consciousness & Inner Monologue Button */}
        <button
          onClick={onOpenConsciousness || onOpenSelfHealing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition group"
          title="ONYX-Nexus Sentetik Bilinç, Global Workspace & İç Monolog"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
          <span>Bilinç Çekirdeği</span>
        </button>

        {/* Professional Keyframe Studio Button */}
        <button
          onClick={onToggleKeyframeStudio}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
            isKeyframeStudioOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>Keyframe</span>
        </button>

        {/* Self-Healing Sentinel Health Badge */}
        <button
          onClick={onOpenSelfHealing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition group"
          title="Otonom Self-Healing & WebGL Nöbetçisi"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
          <span>Sağlık: %{healthScore}</span>
        </button>
      </div>

    </div>
  );
};
