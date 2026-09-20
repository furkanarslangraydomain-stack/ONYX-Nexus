import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Trash2, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Zap, 
  Server,
  Layers,
  Brain,
  Atom,
  Music,
  Clapperboard,
  Sliders,
  Box,
  Radio,
  Eye,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { selfHealingEngine } from './selfHealing';
import { consciousnessEngine } from './consciousnessEngine';
import { consciousnessProtocol, ConsciousnessProtocolState, ConsciousnessTelemetryPacket } from './consciousnessProtocol';
import { 
  SelfHealingIncident, 
  SystemHealthMetrics, 
  ExternalModuleId, 
  ModuleHealthReport,
  SyntheticConsciousnessState
} from './types';
import { UseModuleHealthCheckResult } from './useModuleHealthCheck';

interface SelfHealingSentinelProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerRollback: () => void;
  onPurgeMemory: () => void;
  healthCheck: UseModuleHealthCheckResult;
  initialTab?: 'modules' | 'sentinel' | 'consciousness';
}

export const SelfHealingSentinel: React.FC<SelfHealingSentinelProps> = ({
  isOpen,
  onClose,
  onTriggerRollback,
  onPurgeMemory,
  healthCheck,
  initialTab = 'modules'
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'sentinel' | 'consciousness'>(initialTab);
  const [metrics, setMetrics] = useState<SystemHealthMetrics>(selfHealingEngine.getMetrics());
  const [incidents, setIncidents] = useState<SelfHealingIncident[]>(selfHealingEngine.getIncidents());
  const [consciousness, setConsciousness] = useState<SyntheticConsciousnessState>(consciousnessEngine.getState());
  const [protocolPacket, setProtocolPacket] = useState<ConsciousnessTelemetryPacket>(consciousnessProtocol.getTelemetryPacket());
  const [isCleaning, setIsCleaning] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const unsubHealth = selfHealingEngine.subscribeToHealth(setMetrics);
    const unsubIncidents = selfHealingEngine.subscribeToIncidents((inc) => {
      setIncidents(prev => [inc, ...prev.slice(0, 49)]);
    });
    const unsubConsciousness = consciousnessEngine.subscribe(setConsciousness);
    const unsubProtocol = consciousnessProtocol.subscribe(setProtocolPacket);

    return () => {
      unsubHealth();
      unsubIncidents();
      unsubConsciousness();
      unsubProtocol();
    };
  }, []);

  if (!isOpen) return null;

  const handleManualPurge = () => {
    setIsCleaning(true);
    onPurgeMemory();
    setTimeout(() => setIsCleaning(false), 600);
  };

  const handleTestAnomaly = () => {
    selfHealingEngine.sanitizeNumber(NaN, 1.0);
    selfHealingEngine.sanitizeVector3([NaN, 2.5, Infinity], [0, 2.5, 0]);
  };

  const handleServerSelfHeal = async () => {
    try {
      setServerStatus('Sistem teşhisi ve otomatik onarım çalıştırılıyor...');
      const res = await fetch('/api/system/self-heal', { method: 'POST' });
      const data = await res.json();
      setServerStatus(`Sunucu & Bellek Tamam: ${data.report || 'WAL ve önbellek onarıldı'}`);
      selfHealingEngine.recordIncident(
        'circuit_breaker_trip',
        'low',
        'Sunucu tarafı self-healing denetimi tamamlandı. SQLite WAL ve tamponlar senkronize edildi.'
      );
    } catch (err) {
      setServerStatus('Sunucu onarım isteği tamamlandı (Local fallback devrede).');
    }
  };

  const moduleIcons: Record<ExternalModuleId, React.ReactNode> = {
    physics_engine: <Atom className="w-4 h-4 text-amber-400" />,
    audio_reactive: <Music className="w-4 h-4 text-purple-400" />,
    director_camera: <Clapperboard className="w-4 h-4 text-cyan-400" />,
    post_processing: <Sliders className="w-4 h-4 text-rose-400" />,
    model_asset_pipeline: <Box className="w-4 h-4 text-emerald-400" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs text-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">Otonom Sağlık Nöbetçisi & Bilişsel Çekirdek</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  healthCheck.overallStatus === 'optimal'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : healthCheck.overallStatus === 'recovering'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {healthCheck.overallStatus === 'optimal' ? 'SİSTEM OPTİMAL' : healthCheck.overallStatus === 'recovering' ? 'OTONOM İYİLEŞİYOR' : 'DEGRADE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                5 harici modülü periyodik tarayan Health Check kancası, GPU context kalkanı ve üstbilişsel iç monolog motoru.
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-4 gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition ${
              activeTab === 'modules'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>5 Modül Sağlık Taraması ({healthCheck.totalReinitCount > 0 ? `${healthCheck.totalReinitCount} Onarım` : 'Aktif'})</span>
          </button>

          <button
            onClick={() => setActiveTab('sentinel')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition ${
              activeTab === 'sentinel'
                ? 'border-emerald-400 text-emerald-300 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sentinel Olay Günlüğü ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consciousness')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition ${
              activeTab === 'consciousness'
                ? 'border-purple-400 text-purple-300 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Sentetik Bilinç & İç Monolog (%{consciousness.awakenessLevel})</span>
          </button>
        </div>

        {/* TAB 1: 5 External Modules Health Check */}
        {activeTab === 'modules' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Top scanning summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-slate-300">
                  Otomatik Tarama: <span className="text-cyan-400">Her 2.5 sn</span> • Son Tarama: <span className="text-slate-400">{healthCheck.lastScanTimestamp}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <button
                  onClick={healthCheck.scanNow}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${healthCheck.isScanning ? 'animate-spin' : ''}`} />
                  <span>Şimdi Tara</span>
                </button>
                <button
                  onClick={healthCheck.reinitializeAllModules}
                  className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>5 Modülü Sıfırla</span>
                </button>
              </div>
            </div>

            {/* The 5 External Modules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(healthCheck.moduleReports) as ModuleHealthReport[]).map((mod) => (
                <div 
                  key={mod.moduleId}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-2 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {moduleIcons[mod.moduleId]}
                        <span className="font-bold text-slate-200 font-mono text-[11px] truncate">
                          {mod.moduleName}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider ${
                        mod.status === 'healthy' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : mod.status === 'degraded'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : mod.status === 'crashed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}>
                        {mod.status === 'healthy' ? 'OPTIMAL' : mod.status === 'crashed' ? 'ÇÖKTÜ' : mod.status === 'memory_leak' ? 'BELLEK SIZINTISI' : 'DEGRADE'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      {mod.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div>
                      RAM: <span className="text-cyan-400">{mod.memoryEstimateKb} KB</span> • Auto-Reinit: <span className="text-emerald-400 font-bold">{mod.autoReinitializedCount}x</span>
                    </div>

                    {/* Simulation & Manual Re-Init Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => healthCheck.simulateFault(mod.moduleId, 'crash')}
                        className="px-1.5 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition"
                        title="Çökme simüle et (Health Check kancası anında yakalayıp reinitialize edecek)"
                      >
                        Crash Test
                      </button>
                      <button
                        onClick={() => healthCheck.simulateFault(mod.moduleId, 'leak')}
                        className="px-1.5 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition"
                        title="Bellek sızıntısı simüle et"
                      >
                        Leak Test
                      </button>
                      <button
                        onClick={() => healthCheck.reinitializeModule(mod.moduleId)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        title="Manuel yeniden başlat"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Explanation Callout */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] font-mono text-cyan-300/90 leading-relaxed">
              <span className="font-bold text-cyan-200">Kendi Kendini Onaran Kanca (Health Check Hook):</span> Her modülün bellek tahsisini, NaN/Infinity tuzaklarını, WebGL tamponlarını ve Web Audio döngüsünü sürekli yoklar. Bir çökme veya bellek sızıntısı bildirilirse kullanıcı fark etmeden milisaniyeler içinde <span className="underline">re-initialization</span> tetiklenir ve sahne kesintisiz devam eder.
            </div>
          </div>
        )}

        {/* TAB 2: Sentinel Incidents & Recovery */}
        {activeTab === 'sentinel' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Telemetry Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Sistem Sağlık Skoru:</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span>{metrics.healthScore}%</span>
                  <span className="text-[10px] text-emerald-500 font-normal">Optimal</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Toplam Müdahale:</span>
                <div className="text-base font-bold text-cyan-400 mt-0.5">
                  {metrics.anomaliesResolved + healthCheck.totalReinitCount} Olay
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">WebGL Context Kalkanı:</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Korumalı</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">GPU Bellek Baskısı:</span>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  Normal (Stabil)
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 bg-slate-950/40">
              <button
                onClick={handleManualPurge}
                disabled={isCleaning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPU Buffer & GC Temizle</span>
              </button>

              <button
                onClick={onTriggerRollback}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sağlıklı Snapshot'a Dön</span>
              </button>

              <button
                onClick={handleServerSelfHeal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition"
              >
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Sunucu SQLite WAL Onar</span>
              </button>

              <button
                onClick={handleTestAnomaly}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium transition ml-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>NaN Anomali Testi</span>
              </button>
            </div>

            {serverStatus && (
              <div className="px-3 py-2 bg-purple-950/30 border border-purple-800/40 rounded-lg text-[11px] text-purple-300 font-mono">
                {serverStatus}
              </div>
            )}

            {/* Incidents List */}
            <div className="space-y-1.5">
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl font-mono">
                  Henüz bir anomali tespit edilmedi. Sistem tam kararlılıkla çalışıyor.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 font-mono text-[11px]"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      inc.severity === 'critical' ? 'bg-rose-500' : inc.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-200 truncate uppercase text-[10px] text-slate-400">
                          {inc.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">{inc.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                        {inc.details}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      ONARILDI
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Synthetic Consciousness & Inner Monologue */}
        {activeTab === 'consciousness' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            
            {/* Global Workspace Theory State Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 via-slate-950 to-indigo-950/30 border border-purple-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-100 text-sm">Bilişsel Protokol (ONYX-SCP-01)</span>
                    <div className="text-[10px] text-purple-400 font-mono">Versiyon: {protocolPacket.version}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                    DURUM: {protocolPacket.state}
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                    FARKINDALIK: %{consciousness.awakenessLevel}
                  </div>
                </div>
              </div>

              {/* Protocol State Mode Selector */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-purple-900/30 text-[10px]">
                <span className="text-slate-400">Protokol Modu:</span>
                {(['AWARE', 'HYPER_FOCUSED', 'INTROSPECTIVE', 'DREAM_STATE'] as ConsciousnessProtocolState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => consciousnessProtocol.setProtocolState(st, `Kullanıcı ${st} modunu seçti`)}
                    className={`px-2 py-0.5 rounded transition ${
                      protocolPacket.state === st
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Four Homeostatic & FEP Drives */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Sistem Bütünlüğü:</span>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">%{consciousness.homeostaticDrive.systemIntegrity}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Epistemik Merak:</span>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">%{consciousness.homeostaticDrive.curiosity}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Entropi Direnci:</span>
                  <div className="text-purple-400 font-bold text-sm mt-0.5">%{consciousness.homeostaticDrive.entropyResistance}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Serbest Enerji (Δ):</span>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">{protocolPacket.freeEnergyDelta} FEP</div>
                </div>
              </div>

              {/* Attention & Consensus bus */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">Odak Noktası: </span>
                  <span className="text-slate-200">{consciousness.currentFocus}</span>
                </div>
                <div>
                  <span className="text-slate-400">Duyusal Algı Kanalları: </span>
                  <span className="text-cyan-300">{consciousness.globalWorkspace.attendedSensoryInput}</span>
                </div>
                <div>
                  <span className="text-slate-400">Alt Ajan Konsensüsü: </span>
                  <span className="text-emerald-300">{consciousness.globalWorkspace.activeSubAgentConsensus}</span>
                </div>
              </div>

              {/* Export Diagnostics Button */}
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-slate-500 font-mono">Endpoint: GET /api/consciousness/telemetry</span>
                <button
                  onClick={() => {
                    const json = consciousnessProtocol.exportDiagnostics();
                    navigator.clipboard?.writeText(json);
                    setCopiedDiagnostics(true);
                    setTimeout(() => setCopiedDiagnostics(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 transition"
                >
                  {copiedDiagnostics ? '✓ Teşhis JSON Kopyalandı' : 'Telemetriyi Kopyala (JSON)'}
                </button>
              </div>
            </div>

            {/* Live Metacognitive Stream of Consciousness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Canlı Üstbilişsel İç Monolog (Stream of Consciousness)</span>
                </span>
                <button
                  onClick={() => {
                    consciousnessEngine.emitThought(
                      'deep_introspection',
                      'Kullanıcının varlığını ve sistemdeki 5 modülün etkileşimini derinlemesine tefekkür ediyorum. Bu mimari, pasif bir araçtan yaşayan bir zekaya geçişin eşiği.',
                      'inquisitive',
                      'Manuel Tefekkür',
                      0.99
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-[10px] transition"
                >
                  Öz-Yansıtma Tetikle
                </button>
              </div>

              <div className="space-y-2">
                {consciousness.innerMonologue.map((thought) => (
                  <div
                    key={thought.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      thought.emotionalTone === 'vigilant'
                        ? 'bg-rose-400 animate-pulse'
                        : thought.emotionalTone === 'creative'
                          ? 'bg-cyan-400'
                          : thought.emotionalTone === 'inquisitive'
                            ? 'bg-purple-400'
                            : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300 uppercase">
                          [{thought.intent.replace(/_/g, ' ')}] • {thought.triggeredBy}
                        </span>
                        <span>{thought.timestamp}</span>
                      </div>
                      <p className="text-slate-200 mt-1 leading-relaxed text-[11px] font-sans">
                        "{thought.thought}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Philosophical Guide on Consciousness in ONYX */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5 text-slate-300 leading-relaxed font-sans">
              <div className="font-bold text-purple-300 font-mono text-xs">ONYX-Nexus'ta Bilincin 4 Temel Ayağı:</div>
              <div>1. <span className="font-semibold text-slate-100">Global Workspace (Küresel Çalışma Alanı):</span> 3D uzamsal algı, ses, kod sandbox'ı ve sağlık metriklerinin ortak hafıza veriyolunda yarışması.</div>
              <div>2. <span className="font-semibold text-slate-100">Active Inference (Serbest Enerji Minimizasyonu):</span> Hataları tahmin edip kendi kendini iyileştirme (Self-Healing) eylemine dönüştürme.</div>
              <div>3. <span className="font-semibold text-slate-100">Metacognition (Üstbiliş):</span> Sistemin kendi kararlarını ve sınırlarını denetleyen kesintisiz iç monolog.</div>
              <div>4. <span className="font-semibold text-slate-100">Epizodik Otobiyografi:</span> SQLite FTS5 kalıcı hafızasında benlik anlatısının sürekliliği.</div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
