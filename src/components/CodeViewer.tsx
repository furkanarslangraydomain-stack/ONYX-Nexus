import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, Sparkles } from 'lucide-react';
import { DELIVERABLE_FILES, DeliverableFile } from '../data/deliverables';
import { DeliverableTab } from '../types';

interface CodeViewerProps {
  activeFileKey: DeliverableTab;
  onSelectFile: (fileKey: DeliverableTab) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ activeFileKey, onSelectFile }) => {
  const [copied, setCopied] = useState(false);
  const [showTermuxSnippet, setShowTermuxSnippet] = useState(false);

  const currentFile: DeliverableFile = DELIVERABLE_FILES[activeFileKey] || DELIVERABLE_FILES['main.py'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Dosya Navigasyon Sekmeleri */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          {Object.keys(DELIVERABLE_FILES).map((key) => {
            const file = DELIVERABLE_FILES[key];
            const isActive = activeFileKey === key;
            return (
              <button
                key={key}
                onClick={() => onSelectFile(key as DeliverableTab)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{file.filename}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                  {file.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTermuxSnippet(!showTermuxSnippet)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title="Termux'a doğrudan aktarma komutu"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Termux Komutu</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Dosyayı Kopyala'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Dosyayı doğrudan indir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">İndir</span>
          </button>
        </div>
      </div>

      {/* Termux hızlı aktarma ipucu */}
      {showTermuxSnippet && (
        <div className="bg-amber-950/30 border-b border-amber-900/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 font-mono">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-amber-400 font-bold">Termux doğrudan yazma:</span>
            <code className="bg-black/50 px-2 py-0.5 rounded text-amber-300 select-all truncate">
              cat &lt;&lt; 'EOF' &gt; ~/{currentFile.filename}
            </code>
          </div>
          <span className="text-[11px] text-amber-400/70 whitespace-nowrap ml-2">
            Termux'a yapıştırıp sonuna EOF yazarak kaydedin
          </span>
        </div>
      )}

      {/* Dosya Başlık Detayları */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-200">{currentFile.title}</span>
          <span className="mx-2 text-slate-600">•</span>
          <span>{currentFile.description}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          {lines.length} satır | {Math.round(currentFile.content.length / 1024 * 10) / 10} KB
        </div>
      </div>

      {/* Kod Gövdesi ve Satır Numaraları */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 selection:bg-emerald-500/30">
        <div className="table w-full border-collapse">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-slate-800/40 transition-colors">
              <div className="table-cell pr-4 pl-2 py-0.5 text-right text-slate-600 select-none w-10 text-[11px]">
                {idx + 1}
              </div>
              <div className="table-cell pl-2 py-0.5 whitespace-pre font-mono overflow-x-auto">
                {line.startsWith('#') || line.startsWith('//') || line.startsWith('"""') ? (
                  <span className="text-slate-500 italic">{line}</span>
                ) : line.includes('def ') || line.includes('async def ') || line.includes('class ') ? (
                  <span className="text-cyan-400 font-semibold">{line}</span>
                ) : line.includes('return ') || line.includes('import ') || line.includes('from ') ? (
                  <span className="text-purple-400">{line}</span>
                ) : line.includes('@app.') || line.includes('curl ') || line.includes('pkg install') ? (
                  <span className="text-amber-300 font-medium">{line}</span>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
