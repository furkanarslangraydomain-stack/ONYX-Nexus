import { useState } from 'react';
import { SWARM_AGENTS_DATA } from '../data/architectureData';
import { SwarmAgent } from '../types';
import {
  Compass,
  Building2,
  Code,
  ShieldAlert,
  CheckCircle2,
  GraduationCap,
  Coins,
  GitBranch,
  FileText,
  Sliders,
  Copy,
  Check,
  Zap,
  Terminal
} from 'lucide-react';

export function AgentSwarmView() {
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent>(SWARM_AGENTS_DATA[0]);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Consensus Simulator state
  const [architectScore, setArchitectScore] = useState<number>(34); // out of 35
  const [coderScore, setCoderScore] = useState<number>(28); // out of 30
  const [qaScore, setQaScore] = useState<number>(32); // out of 35

  const totalConsensusScore = architectScore + coderScore + qaScore;
  const isConsensusPassed = totalConsensusScore >= 85;

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'Code': return <Code className="w-4 h-4 text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-blue-400" />;
      case 'Coins': return <Coins className="w-4 h-4 text-amber-400" />;
      case 'GitBranch': return <GitBranch className="w-4 h-4 text-orange-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-sky-400" />;
      default: return <Compass className="w-4 h-4 text-cyan-400" />;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Consensus Matrix Simulator */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                3-Ajanlı Swarm Konsensüs Karar Matrisi
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Eşik: ≥ %85
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mimar, Geliştirici ve QA/Güvenlik ajanlarının ağırlıklı oylaması ile otomatik onay motoru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400">Ortak Konsensüs Skoru</div>
              <div className={`text-xl font-mono font-black ${isConsensusPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                %{totalConsensusScore} / %100
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
              isConsensusPassed 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-lg shadow-rose-500/10'
            }`}>
              {isConsensusPassed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  KONSENSÜS ONAYLANDI (GIT PUSH)
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  REDDEDİLDİ (AUTO-REPAIR GEREKLİ)
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Master Architect (%35)
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {architectScore} / 35
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              value={architectScore}
              onChange={(e) => setArchitectScore(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>SOLID Uyumsuz</span>
              <span>Kusursuz Blueprint</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                Polyglot Coder (%30)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {coderScore} / 30
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={coderScore}
              onChange={(e) => setCoderScore(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Sözdizim Hatası</span>
              <span>Tip Güvenli Kod</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                QA & Güvenlik (%35)
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {qaScore} / 35
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              value={qaScore}
              onChange={(e) => setQaScore(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Kritik Zaafiyet</span>
              <span>Birim Testler %100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Agent Master Directory & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Agent Selector List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider mb-2">
            9 Uzman Ajan Listesi (Tıkla ve İncele)
          </div>

          <div className="space-y-2">
            {SWARM_AGENTS_DATA.map(agent => {
              const isSelected = selectedAgent.id === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {getAgentIcon(agent.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-200 truncate">
                          {agent.number}. {agent.name}
                        </span>
                        {agent.consensusWeight > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            %{agent.consensusWeight}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {agent.turkishTitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {agent.role.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Agent Detailed Inspector */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sticky top-4 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {getAgentIcon(selectedAgent.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-mono text-slate-100">
                      {selectedAgent.name}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Ajan #{selectedAgent.number}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedAgent.turkishTitle} • {selectedAgent.role}
                  </div>
                </div>
              </div>

              {selectedAgent.consensusWeight > 0 && (
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Konsensüs Payı</div>
                  <div className="text-sm font-bold font-mono text-indigo-400">
                    %{selectedAgent.consensusWeight} Ağırlık
                  </div>
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Temel Sorumluluklar:
              </h4>
              <ul className="space-y-1.5">
                {selectedAgent.primaryResponsibilities.map((resp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Prompt Box with Copy */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Sistem Talimatı (System Prompt)
                </span>
                <button
                  onClick={() => copyToClipboard(selectedAgent.systemPrompt, selectedAgent.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1 transition"
                >
                  {copiedPromptId === selectedAgent.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      Kopyala
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedAgent.systemPrompt}
              </div>
            </div>

            {/* Sample Payload Flow */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Örnek Giriş ➔ Eylem ➔ Çıktı Örneği
              </span>
              <div className="text-xs font-mono">
                <span className="text-slate-500">Girdi: </span>
                <span className="text-slate-300">{selectedAgent.samplePayload.input}</span>
              </div>
              <div className="text-xs font-mono">
                <span className="text-cyan-400">Eylem: </span>
                <span className="text-slate-300">{selectedAgent.samplePayload.action}</span>
              </div>
              <div className="text-xs font-mono p-2 bg-slate-950 rounded border border-slate-800/80 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {selectedAgent.samplePayload.output}
              </div>
            </div>

            {/* Footer reference */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Kaynak Kod: <code className="text-slate-300">{selectedAgent.fileReference}</code></span>
              <span className="text-indigo-400">ONYX Swarm Engine v4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
