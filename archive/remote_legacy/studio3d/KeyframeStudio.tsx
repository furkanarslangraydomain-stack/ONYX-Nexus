import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Clock, 
  Layers, 
  Film, 
  Video, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Sparkles,
  Sliders,
  Check,
  Download
} from 'lucide-react';
import { SceneObject, ObjectKeyframeTrack, TransformKeyframe, InterpolationType } from './types';

interface KeyframeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  objects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  tracks: ObjectKeyframeTrack[];
  onAddKeyframe: (objectId: string, time: number) => void;
  onRemoveKeyframe: (objectId: string, keyframeId: string) => void;
  onApplyChoreography: (preset: 'cosmic' | 'helix' | 'mech') => void;
  onRecordVideo: () => void;
  isRecordingVideo: boolean;
}

export const KeyframeStudio: React.FC<KeyframeStudioProps> = ({
  isOpen,
  onClose,
  objects,
  selectedObjectId,
  onSelectObject,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  tracks,
  onAddKeyframe,
  onRemoveKeyframe,
  onApplyChoreography,
  onRecordVideo,
  isRecordingVideo
}) => {
  const [selectedKeyframe, setSelectedKeyframe] = useState<{ objectId: string; keyframe: TransformKeyframe } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Format time into mm:ss.ms
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onTimeChange(ratio * duration);
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 text-slate-200 text-xs flex flex-col h-72 shadow-2xl backdrop-blur-md select-none">
      
      {/* Top Studio Action Bar */}
      <div className="h-10 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Profesyonel Keyframe & Dope Sheet Stüdyosu</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Timecode display */}
          <div className="font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-semibold">
            {formatTimecode(currentTime)} / {formatTimecode(duration)} (60 FPS)
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTimeChange(0)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Başa Dön (00:00)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onTimeChange(Math.max(0, currentTime - 1 / 30))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="1 Kare Geri"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Durdur' : 'Oynat'}</span>
            </button>

            <button
              onClick={() => onTimeChange(Math.min(duration, currentTime + 1 / 30))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="1 Kare İleri"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Tools & Presets */}
        <div className="flex items-center gap-2">
          {/* Choreography Presets */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 px-1 font-mono">Koreografi:</span>
            <button
              onClick={() => onApplyChoreography('cosmic')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium transition"
            >
              Kozmik Dans
            </button>
            <button
              onClick={() => onApplyChoreography('helix')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition"
            >
              Sarmal Halka
            </button>
            <button
              onClick={() => onApplyChoreography('mech')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium transition"
            >
              Meka Kalkış
            </button>
          </div>

          {/* Add Keyframe to current selected */}
          <button
            onClick={() => {
              if (selectedObjectId) onAddKeyframe(selectedObjectId, currentTime);
            }}
            disabled={!selectedObjectId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium text-xs transition ${
              selectedObjectId
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
                : 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kare Ekle (◈)</span>
          </button>

          {/* Video Export button */}
          <button
            onClick={onRecordVideo}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium text-xs transition ${
              isRecordingVideo
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>{isRecordingVideo ? 'Kayıt Yapılıyor...' : 'Video MP4/WebM Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* Main Dope Sheet Tracks Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Object Track Headers */}
        <div className="w-56 border-r border-slate-800 bg-slate-950/60 overflow-y-auto shrink-0 divide-y divide-slate-800/40">
          <div className="p-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-900/60 flex items-center justify-between">
            <span>Katman / Nesne İzi</span>
            <span>{objects.length} İz</span>
          </div>

          {objects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelectObject(obj.id)}
              className={`px-3 py-2 flex items-center justify-between cursor-pointer transition text-xs ${
                selectedObjectId === obj.id
                  ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                  : 'hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: obj.material.color }}
                />
                <span className="truncate">{obj.name}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {obj.type}
              </span>
            </div>
          ))}
        </div>

        {/* Right Timeline Ruler & Tracks */}
        <div className="flex-1 flex flex-col bg-slate-950/30 overflow-x-auto relative">
          {/* Time Ruler */}
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="h-7 border-b border-slate-800 bg-slate-900/40 relative cursor-pointer select-none"
          >
            {/* Playhead Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 -ml-1 -mt-1 shadow-md shadow-rose-950" />
            </div>

            {/* Ruler Ticks */}
            {Array.from({ length: 11 }).map((_, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 border-l border-slate-800 text-[9px] font-mono text-slate-500 pl-1 pt-0.5"
                style={{ left: `${(idx / 10) * 100}%` }}
              >
                {idx}s
              </div>
            ))}
          </div>

          {/* Keyframe Track Lanes */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 relative">
            {/* Playhead vertical line passing through all tracks */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/60 z-10 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {objects.map((obj) => {
              const track = tracks.find(t => t.objectId === obj.id);
              const keyframes = track?.keyframes || [];

              return (
                <div
                  key={obj.id}
                  onClick={(e) => {
                    handleTimelineClick(e);
                    onSelectObject(obj.id);
                  }}
                  className={`h-9 relative cursor-pointer transition ${
                    selectedObjectId === obj.id ? 'bg-cyan-950/20' : 'hover:bg-slate-900/20'
                  }`}
                >
                  {/* Subtle track grid lines */}
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 border-l border-slate-900/60 pointer-events-none"
                      style={{ left: `${(idx / 10) * 100}%` }}
                    />
                  ))}

                  {/* Keyframe Diamond Icons ◈ */}
                  {keyframes.map((kf) => (
                    <button
                      key={kf.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedKeyframe({ objectId: obj.id, keyframe: kf });
                        onTimeChange(kf.time);
                        onSelectObject(obj.id);
                      }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-sm bg-amber-400 rotate-45 border border-amber-200 shadow-md shadow-amber-950 hover:scale-125 transition z-15 flex items-center justify-center cursor-pointer group"
                      style={{ left: `${(kf.time / duration) * 100}%` }}
                      title={`Keyframe @ ${kf.time.toFixed(2)}s (${kf.interpolation})`}
                    >
                      <span className="w-1 h-1 bg-amber-950 rounded-full" />
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
