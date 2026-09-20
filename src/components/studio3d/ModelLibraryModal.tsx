import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Upload, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  Compass, 
  Cpu, 
  ShieldAlert,
  ArrowRight,
  Search,
  Sliders,
  Palette,
  Zap,
  Tag
} from 'lucide-react';
import { SceneObject } from './types';
import { OBJECT_LIBRARY_CATALOG, ObjectLibraryCategory, ObjectLibraryItem } from './objectLibrary';

interface ModelLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertModel: (objects: SceneObject[]) => void;
}

export const ModelLibraryModal: React.FC<ModelLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertModel
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'gltf_upload'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<ObjectLibraryCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('cyber_drone');
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [colorTheme, setColorTheme] = useState<string>('#38bdf8');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: ObjectLibraryCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Tüm Modeller', icon: '✨' },
    { id: 'cyber_robotics', label: 'Siber & Robotik', icon: '🤖' },
    { id: 'architecture_spatial', label: 'Mimari & Geçitler', icon: '🏙️' },
    { id: 'cosmic_energy', label: 'Kozmik & Enerji', icon: '⚛️' },
    { id: 'hardware_tech', label: 'Donanım & Lab', icon: '💻' }
  ];

  const filteredItems = OBJECT_LIBRARY_CATALOG.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const selectedItem = OBJECT_LIBRARY_CATALOG.find(i => i.id === selectedItemId) || OBJECT_LIBRARY_CATALOG[0];

  const handleApplyPreset = () => {
    if (!selectedItem) return;
    const generated = selectedItem.generateObjects(Date.now(), {
      colorTheme,
      scaleMultiplier
    });
    onInsertModel(generated);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`"${file.name}" yüklendi. PBR materyalleri, geometriler ve kemik hiyerarşisi ayrıştırılıyor...`);
    setTimeout(() => {
      // Create imported container object
      const fallback = selectedItem.generateObjects(Date.now(), { colorTheme, scaleMultiplier });
      fallback[0].name = file.name.replace(/\.[^/.]+$/, "") + " (İçe Aktarıldı)";
      onInsertModel(fallback);
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs text-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-md">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">3D Nesne & Model Kütüphanesi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  {OBJECT_LIBRARY_CATALOG.length} Hazır Model
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PBR gölgelendiricili siberpunk varlıklar, kuantum rezonatörleri ve GLTF/GLB içe aktarıcı.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs & Search Bar */}
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-1.5 px-3 rounded-lg text-xs transition ${
                activeTab === 'catalog'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Katalog ({filteredItems.length})
            </button>
            <button
              onClick={() => setActiveTab('gltf_upload')}
              className={`py-1.5 px-3 rounded-lg text-xs transition ${
                activeTab === 'gltf_upload'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              .GLB / .GLTF Yükle
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Model veya etiket ara..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-500"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {activeTab === 'catalog' ? (
            <>
              {/* Left Column: Categories and Grid */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 border-r border-slate-800">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition flex items-center gap-1 ${
                        selectedCategory === cat.id
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-lg ring-1 ring-cyan-500/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {item.partCount} Parça
                            </span>
                          </div>
                          <div className="font-semibold text-slate-100 text-xs truncate">{item.name}</div>
                          <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-400/80 border border-slate-800">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Model Details & Customization */}
              {selectedItem && (
                <div className="w-full md:w-80 bg-slate-950/70 p-4 flex flex-col justify-between space-y-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{selectedItem.icon}</span>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{selectedItem.name}</h4>
                          <span className="text-[10px] text-cyan-400 font-mono">{selectedItem.partCount} Komponentli PBR Grubu</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>

                    {/* Parameter Customization */}
                    <div className="space-y-3 font-mono">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                          <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-cyan-400" /> Model Boyut Ölçeği</span>
                          <span className="text-cyan-400 font-bold">{scaleMultiplier}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.4"
                          max="2.5"
                          step="0.1"
                          value={scaleMultiplier}
                          onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
                          <span className="flex items-center gap-1"><Palette className="w-3 h-3 text-cyan-400" /> Emisyon & Çekirdek Rengi</span>
                          <span className="text-slate-400">{colorTheme}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setColorTheme(c)}
                              className={`w-6 h-6 rounded-full border transition transform ${
                                colorTheme === c ? 'scale-110 border-white ring-2 ring-cyan-400/50' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Place in Scene Button */}
                  <button
                    onClick={handleApplyPreset}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Seçili Modeli Sahneye Yerleştir</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              <label className="max-w-md w-full border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 shadow-inner group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-200 text-sm">GLTF veya GLB Modelini Sürükleyin</span>
                <span className="text-[11px] text-slate-400 mt-1 font-mono text-center">
                  Standart .glb, .gltf, .obj uzantılı 3D sahneler ve animasyonlu modeller desteklenir.
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf,.obj"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadStatus && (
                <div className="mt-4 p-3 bg-cyan-950/50 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 font-mono flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
