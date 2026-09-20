import { useState } from 'react';
import { AUTONOMOUS_WORKFLOWS } from '../data/architectureData';
import { AutonomousWorkflow } from '../types';
import {
  GitCommit,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  FileCode2,
  Sparkles,
  Layers
} from 'lucide-react';

export function WorkflowsView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutonomousWorkflow>(AUTONOMOUS_WORKFLOWS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState(false);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStepIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < selectedWorkflow.steps.length) {
        setActiveStepIndex(current);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setActiveStepIndex(-1);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AUTONOMOUS_WORKFLOWS.map((wf) => {
          const isSelected = selectedWorkflow.id === wf.id;
          return (
            <div
              key={wf.id}
              onClick={() => {
                setSelectedWorkflow(wf);
                setActiveStepIndex(-1);
                setIsSimulating(false);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-400 ring-1 ring-indigo-400/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 truncate">
                  {wf.badge}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {wf.durationAvg}
                </span>
              </div>
              <h4 className="text-xs font-bold font-mono text-slate-200 leading-snug line-clamp-1">
                {wf.nameTr}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {wf.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Workflow Execution Stage */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
        {/* Header with simulation controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100">
                {selectedWorkflow.nameTr}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedWorkflow.accuracyOrSuccess}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
              {selectedWorkflow.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
                isSimulating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSimulating ? 'Akış Yürütülüyor...' : 'Akışı Canlı Simüle Et'}
            </button>
            <button
              onClick={resetSimulation}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              title="Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Participating Agents Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500">Katılan Ajanlar:</span>
          {selectedWorkflow.participatingAgents.map((agent, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 text-cyan-300 border border-slate-700"
            >
              {agent}
            </span>
          ))}
        </div>

        {/* Interactive Steps Pipeline */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Adım Adım Otonom Pipeline ({selectedWorkflow.steps.length} Aşama)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedWorkflow.steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = activeStepIndex > idx || (!isSimulating && activeStepIndex === -1);

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border transition-all duration-300 relative ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                      : isPast
                      ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                      : 'bg-slate-950/30 border-slate-800/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      AŞAMA {step.step}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {step.durationAvg}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-200 mt-1">
                    {step.title}
                  </div>
                  <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                    {step.agentName}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 flex items-center gap-1">
                      <FileCode2 className="w-3 h-3 text-slate-400" />
                      Çıktı:
                    </span>
                    <span className="text-emerald-400 font-bold truncate max-w-[160px]">
                      {step.artifact}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider shadow">
                      Aktif Çalışıyor
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ASCII Flow Diagram Block */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Akış Topoloji Şeması (ASCII Trace)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Canlı Senkron
            </span>
          </div>
          <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
            {selectedWorkflow.diagramAscii}
          </pre>
        </div>
      </div>
    </div>
  );
}
