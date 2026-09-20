import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Box, 
  Circle, 
  Layers, 
  Move, 
  Maximize2, 
  RotateCw, 
  Sliders, 
  Sparkles, 
  Sun, 
  Palette,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { SceneObject, SceneEnvironment, PrimitiveType, ObjectAnimationType } from './types';

interface SceneDesignerPanelProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onAddObject: (type: PrimitiveType) => void;
  onUpdateObject: (updated: SceneObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  environment: SceneEnvironment;
  onUpdateEnvironment: (env: SceneEnvironment) => void;
}

export const SceneDesignerPanel: React.FC<SceneDesignerPanelProps> = ({
  objects,
  selectedId,
  onSelectObject,
  onAddObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  environment,
  onUpdateEnvironment
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'materials' | 'environment'>('hierarchy');
  const [primitiveMenuOpen, setPrimitiveMenuOpen] = useState(false);

  const selectedObject = objects.find(o => o.id === selectedId);

  const primitiveOptions: { type: PrimitiveType; label: string; icon: string }[] = [
    { type: 'box', label: 'Küp (Box)', icon: '◼' },
    { type: 'sphere', label: 'Küre (Sphere)', icon: '●' },
    { type: 'cylinder', label: 'Silindir (Cylinder)', icon: '⬬' },
    { type: 'torus', label: 'Torus Halkası', icon: '◎' },
    { type: 'torusKnot', label: 'Kuantum Düğümü', icon: '✦' },
    { type: 'cone', label: 'Koni / Piramit', icon: '▲' },
    { type: 'icosahedron', label: 'İkozahedron Kristal', icon: '◈' },
    { type: 'plane', label: 'Yansıtıcı Düzlem', icon: '▬' }
  ];

  const handleUpdatePosition = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedObject) return;
    const newPos = [...selectedObject.position] as [number, number, number];
    newPos[axis] = Number.isFinite(val) ? val : 0;
    onUpdateObject({ ...selectedObject, position: newPos });
  };

  const handleUpdateRotation = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedObject) return;
    const newRot = [...selectedObject.rotation] as [number, number, number];
    newRot[axis] = Number.isFinite(val) ? val : 0;
    onUpdateObject({ ...selectedObject, rotation: newRot });
  };

  const handleUpdateScale = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedObject) return;
    const newScale = [...selectedObject.scale] as [number, number, number];
    newScale[axis] = Number.isFinite(val) && val > 0 ? val : 1;
    onUpdateObject({ ...selectedObject, scale: newScale });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 border-l border-slate-800 text-slate-200 text-xs select-none">
      {/* Designer Top Tabs */}
      <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-2.5 py-1 rounded transition ${
              activeTab === 'hierarchy'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hiyerarşi ({objects.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-2.5 py-1 rounded transition ${
              activeTab === 'materials'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PBR Malzeme
          </button>
          <button
            onClick={() => setActiveTab('environment')}
            className={`px-2.5 py-1 rounded transition ${
              activeTab === 'environment'
                ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stüdyo Işık & Sis
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* Tab 1: Hierarchy / Outliner */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-3">
            {/* Add Primitive Button Bar */}
            <div className="relative">
              <button
                onClick={() => setPrimitiveMenuOpen(!primitiveMenuOpen)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-950/50 transition font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sahneye Yeni 3D Nesne Ekle</span>
                <ChevronDown className="w-3 h-3 ml-auto opacity-70" />
              </button>

              {primitiveMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 grid grid-cols-2 gap-1 backdrop-blur-md">
                  {primitiveOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        onAddObject(opt.type);
                        setPrimitiveMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 text-xs transition border border-transparent hover:border-slate-700 font-mono"
                    >
                      <span className="text-emerald-400 text-sm">{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Object List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {objects.map((obj) => {
                const isSelected = obj.id === selectedId;
                return (
                  <div
                    key={obj.id}
                    onClick={() => onSelectObject(obj.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/60 shadow-md text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: obj.material.color }}
                      />
                      <span className="font-mono text-xs truncate font-medium">{obj.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">({obj.type})</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDuplicateObject(obj.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                        title="Çoğalt (Clone)"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteObject(obj.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800"
                        title="Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Object Transform Controls */}
            {selectedObject && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Konum & Dönüşım (Transform)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{selectedObject.name}</span>
                </div>

                {/* Name edit */}
                <div>
                  <label className="text-[10px] text-slate-400 font-mono">Nesne Adı:</label>
                  <input
                    type="text"
                    value={selectedObject.name}
                    onChange={(e) => onUpdateObject({ ...selectedObject, name: e.target.value })}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Position X, Y, Z */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Pozisyon (X, Y, Z):</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                      <div key={axis} className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                        <span className="text-[9px] font-mono text-slate-500 mr-1">{axis}:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={Number(selectedObject.position[idx]).toFixed(1)}
                          onChange={(e) => handleUpdatePosition(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                          className="w-full bg-transparent text-xs text-slate-200 font-mono outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rotation X, Y, Z */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Rotasyon (Radyan):</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['RX', 'RY', 'RZ'] as const).map((axis, idx) => (
                      <div key={axis} className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                        <span className="text-[9px] font-mono text-slate-500 mr-1">{axis}:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={Number(selectedObject.rotation[idx]).toFixed(2)}
                          onChange={(e) => handleUpdateRotation(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                          className="w-full bg-transparent text-xs text-slate-200 font-mono outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scale X, Y, Z */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Ölçek (Boyut):</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['SX', 'SY', 'SZ'] as const).map((axis, idx) => (
                      <div key={axis} className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                        <span className="text-[9px] font-mono text-slate-500 mr-1">{axis}:</span>
                        <input
                          type="number"
                          step="0.2"
                          min="0.1"
                          value={Number(selectedObject.scale[idx]).toFixed(1)}
                          onChange={(e) => handleUpdateScale(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                          className="w-full bg-transparent text-xs text-slate-200 font-mono outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Object Animation Settings */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400">Nesne Animasyon Efekti:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedObject.animation.enabled}
                        onChange={(e) => onUpdateObject({
                          ...selectedObject,
                          animation: { ...selectedObject.animation, enabled: e.target.checked }
                        })}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-300">Aktif</span>
                    </label>
                  </div>

                  {selectedObject.animation.enabled && (
                    <div className="space-y-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Mod:</span>
                        <select
                          value={selectedObject.animation.type}
                          onChange={(e) => onUpdateObject({
                            ...selectedObject,
                            animation: { ...selectedObject.animation, type: e.target.value as ObjectAnimationType }
                          })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
                        >
                          <option value="spin">Sonsuz Dönüş (Spin)</option>
                          <option value="float">Havalanma (Float)</option>
                          <option value="pulse">Nabız (Pulse)</option>
                          <option value="wave">Dalga Salınımı (Wave)</option>
                          <option value="orbit">Yörünge (Orbit)</option>
                          <option value="bounce">Yaylanma (Bounce)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Hız:</span>
                          <span className="font-mono text-emerald-400">{selectedObject.animation.speed}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={selectedObject.animation.speed}
                          onChange={(e) => onUpdateObject({
                            ...selectedObject,
                            animation: { ...selectedObject.animation, speed: parseFloat(e.target.value) || 1 }
                          })}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PBR Materials */}
        {activeTab === 'materials' && (
          <div className="space-y-3">
            {selectedObject ? (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PBR Malzeme Ataması</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">{selectedObject.name}</span>
                </div>

                {/* Base Color Picker */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Yüzey Ana Rengi (Albedo):</span>
                    <span className="font-mono text-slate-200">{selectedObject.material.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.material.color}
                      onChange={(e) => onUpdateObject({
                        ...selectedObject,
                        material: { ...selectedObject.material, color: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <div className="grid grid-cols-6 gap-1 flex-1">
                      {['#10b981', '#38bdf8', '#a855f7', '#ec4899', '#f59e0b', '#ef4444'].map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateObject({
                            ...selectedObject,
                            material: { ...selectedObject.material, color: c }
                          })}
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metalness Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Metaliklik (Metalness):</span>
                    <span className="font-mono text-emerald-400">
                      {Number.isFinite(selectedObject.material.metalness) ? selectedObject.material.metalness : 0.7}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={Number.isFinite(selectedObject.material.metalness) ? selectedObject.material.metalness : 0.7}
                    onChange={(e) => onUpdateObject({
                      ...selectedObject,
                      material: { ...selectedObject.material, metalness: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Roughness Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Pürüzlülük (Roughness):</span>
                    <span className="font-mono text-emerald-400">
                      {Number.isFinite(selectedObject.material.roughness) ? selectedObject.material.roughness : 0.2}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={Number.isFinite(selectedObject.material.roughness) ? selectedObject.material.roughness : 0.2}
                    onChange={(e) => onUpdateObject({
                      ...selectedObject,
                      material: { ...selectedObject.material, roughness: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Neon Emissive */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Neon Işıma (Emissive):</span>
                    <span className="font-mono text-slate-200">
                      {Number.isFinite(selectedObject.material.emissiveIntensity) ? selectedObject.material.emissiveIntensity : 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.material.emissive}
                      onChange={(e) => onUpdateObject({
                        ...selectedObject,
                        material: { ...selectedObject.material, emissive: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2.0"
                      step="0.1"
                      value={Number.isFinite(selectedObject.material.emissiveIntensity) ? selectedObject.material.emissiveIntensity : 0}
                      onChange={(e) => onUpdateObject({
                        ...selectedObject,
                        material: { ...selectedObject.material, emissiveIntensity: parseFloat(e.target.value) || 0 }
                      })}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Wireframe & Transparency */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] text-slate-300">Tel Kafes (Wireframe):</span>
                    <input
                      type="checkbox"
                      checked={selectedObject.material.wireframe}
                      onChange={(e) => onUpdateObject({
                        ...selectedObject,
                        material: { ...selectedObject.material, wireframe: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] text-slate-300">Yarı Saydamlık (Transparent):</span>
                    <input
                      type="checkbox"
                      checked={selectedObject.material.transparent}
                      onChange={(e) => onUpdateObject({
                        ...selectedObject,
                        material: { ...selectedObject.material, transparent: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                  </label>

                  {selectedObject.material.transparent && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Opaklık (Opacity):</span>
                        <span className="font-mono text-cyan-400">{selectedObject.material.opacity}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedObject.material.opacity}
                        onChange={(e) => onUpdateObject({
                          ...selectedObject,
                          material: { ...selectedObject.material, opacity: parseFloat(e.target.value) || 1 }
                        })}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Lütfen malzeme özelliklerini düzenlemek için soldaki hiyerarşiden veya 3D tuvalden bir nesne seçin.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Environment & Studio Lights */}
        {activeTab === 'environment' && (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Stüdyo Atmosferi & Işık Teçhizatı</span>
            </div>

            {/* Background Color */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Arkaplan Rengi:</span>
                <span className="font-mono text-slate-200">{environment.bgColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={environment.bgColor}
                  onChange={(e) => onUpdateEnvironment({ ...environment, bgColor: e.target.value, fogColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {['#030712', '#0f172a', '#1e1b4b', '#064e3b'].map((bg) => (
                    <button
                      key={bg}
                      onClick={() => onUpdateEnvironment({ ...environment, bgColor: bg, fogColor: bg })}
                      className="py-1 px-1.5 text-[9px] font-mono rounded border border-slate-700 text-slate-300"
                      style={{ backgroundColor: bg }}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Light */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Ana Işık (Key Light):</span>
                <span className="font-mono text-amber-400">{environment.keyLightIntensity}x</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={environment.keyLightColor}
                  onChange={(e) => onUpdateEnvironment({ ...environment, keyLightColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min="0.2"
                  max="3.5"
                  step="0.1"
                  value={environment.keyLightIntensity}
                  onChange={(e) => onUpdateEnvironment({ ...environment, keyLightIntensity: parseFloat(e.target.value) || 1.5 })}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Fill Light */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Dolgu Işığı (Fill Light):</span>
                <span className="font-mono text-cyan-400">{environment.fillLightIntensity}x</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={environment.fillLightColor}
                  onChange={(e) => onUpdateEnvironment({ ...environment, fillLightColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={environment.fillLightIntensity}
                  onChange={(e) => onUpdateEnvironment({ ...environment, fillLightIntensity: parseFloat(e.target.value) || 1.0 })}
                  className="flex-1 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Floor & Grid Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Zemin Izgarası (Grid Floor):</span>
                <input
                  type="checkbox"
                  checked={environment.showGrid}
                  onChange={(e) => onUpdateEnvironment({ ...environment, showGrid: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Stüdyo Yansıtıcı Zemin:</span>
                <input
                  type="checkbox"
                  checked={environment.showFloor}
                  onChange={(e) => onUpdateEnvironment({ ...environment, showFloor: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Volumetrik Sis (Fog):</span>
                <input
                  type="checkbox"
                  checked={environment.fogEnabled}
                  onChange={(e) => onUpdateEnvironment({ ...environment, fogEnabled: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
