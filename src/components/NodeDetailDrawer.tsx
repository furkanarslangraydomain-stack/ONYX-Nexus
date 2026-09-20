import { ArchitectureNode } from '../types';
import { ARCHITECTURE_NODES } from '../data/architectureData';
import {
  X,
  CheckCircle2,
  Share2,
  ArrowRight,
  Code2,
  FileCode,
  HardDrive,
  Layers,
  Sparkles
} from 'lucide-react';

interface NodeDetailDrawerProps {
  node: ArchitectureNode | null;
  onClose: () => void;
  onSelectNode: (node: ArchitectureNode) => void;
}

export function NodeDetailDrawer({ node, onClose, onSelectNode }: NodeDetailDrawerProps) {
  if (!node) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              {node.layerId.toUpperCase()} KATMANI DÜĞÜMÜ
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {node.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Port Badges */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {node.status}
          </span>
          {node.port && (
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Port: {node.port}
            </span>
          )}
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {node.role}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          {node.description || node.summary}
        </p>

        {/* Responsibilities */}
        <div className="mt-5">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Temel Görev ve Yetenekler:
          </h4>
          <ul className="space-y-2">
            {node.responsibilities.map((resp, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Input & Output Data Contracts */}
        <div className="mt-5 grid grid-cols-1 gap-3">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Girdi Sözleşmesi (Inputs)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {node.inputs.map((inp, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {inp}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Çıktı Sözleşmesi (Outputs)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {node.outputs.map((out, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                  {out}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-5">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            Teknoloji Yığını:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {node.techStack.map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Connected Nodes */}
        {node.connections.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              Doğrudan Bağlı Düğümler:
            </h4>
            <div className="flex flex-wrap gap-2">
              {node.connections.map((connId, i) => {
                const target = ARCHITECTURE_NODES.find(n => n.id === connId);
                return (
                  <button
                    key={i}
                    onClick={() => target && onSelectNode(target)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30 flex items-center gap-1.5 transition"
                  >
                    <span>{target?.name || connId}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer reference */}
      <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-slate-400" />
          {node.fileReference || 'ONYX-Nexus Core'}
        </span>
        <span className="text-cyan-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Canlı
        </span>
      </div>
    </div>
  );
}
