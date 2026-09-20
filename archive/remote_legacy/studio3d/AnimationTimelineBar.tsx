import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Activity, 
  Sliders, 
  Sparkles, 
  Layers, 
  Flame, 
  Compass, 
  MousePointerClick
} from 'lucide-react';
import { AnimationTimelineState, GlobalAnimationMode, ClickInteractionType } from './types';

interface AnimationTimelineBarProps {
  timelineState: AnimationTimelineState;
  onUpdateTimelineState: (state: AnimationTimelineState) => void;
  onResetSceneTransforms: () => void;
}

export const AnimationTimelineBar: React.FC<AnimationTimelineBarProps> = ({
  timelineState,
  onUpdateTimelineState,
  onResetSceneTransforms
}) => {
  const modes: { id: GlobalAnimationMode; label: string; icon: any }[] = [
    { id: 'individual', label: 'Bireysel (Custom)', icon: Sliders },
    { id: 'float_all', label: 'Sıfır Yerçekimi (Float)', icon: Activity },
    { id: 'orbit_all', label: 'Kozmik Yörünge (Orbit)', icon: Compass },
    { id: 'pulse_all', label: 'Nabız (Pulse Wave)', icon: Zap },
    { id: 'wave_all', label: 'Sinüs Dalgası (Wave)', icon: Sparkles },
    { id: 'explode', label: 'Patlama / Dağılma (Explode)', icon: Flame }
  ];

  const clickResponses: { id: ClickInteractionType; label: string }[] = [
    { id: 'bounce', label: 'Zıpla (Bounce)' },
    { id: 'glow', label: 'Işılda (Glow)' },
    { id: 'spin', label: 'Dön (Spin)' },
    { id: 'select_only', label: 'Sadece Seç' }
  ];

  return (
    <div className="bg-slate-900/90 border-t border-slate-800 p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md z-20">
      
      {/* Left: Playback Controls & Speed */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateTimelineState({ ...timelineState, isPlaying: !timelineState.isPlaying })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
            timelineState.isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950'
          }`}
        >
          {timelineState.isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Durdur</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Oynat</span>
            </>
          )}
        </button>

        <button
          onClick={onResetSceneTransforms}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
          title="Pozisyonları Sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-mono text-[10px]">
          {[0.5, 1.0, 2.0, 3.0].map((s) => (
            <button
              key={s}
              onClick={() => onUpdateTimelineState({ ...timelineState, speed: s })}
              className={`px-1.5 py-0.5 rounded ${
                timelineState.speed === s
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center: Global Animation Modes */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = timelineState.globalMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onUpdateTimelineState({ ...timelineState, globalMode: m.id })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition whitespace-nowrap ${
                isSelected
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Explode Slider (if explode mode) or Click Interaction Selector */}
      <div className="flex items-center gap-3">
        {timelineState.globalMode === 'explode' ? (
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-rose-400 whitespace-nowrap">Dağılma Oranı:</span>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.05"
              value={timelineState.explosionFactor}
              onChange={(e) => onUpdateTimelineState({
                ...timelineState,
                explosionFactor: parseFloat(e.target.value) || 0
              })}
              className="w-24 accent-rose-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-300 w-8">
              {Math.round(timelineState.explosionFactor * 40)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">3D Tıklama Tepkisi:</span>
            <select
              value={timelineState.clickInteraction}
              onChange={(e) => onUpdateTimelineState({
                ...timelineState,
                clickInteraction: e.target.value as ClickInteractionType
              })}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] font-mono rounded px-2 py-1 outline-none"
            >
              {clickResponses.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

    </div>
  );
};
