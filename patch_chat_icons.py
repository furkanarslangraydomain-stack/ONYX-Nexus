import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Add missing icons
icon_import_target = "import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2, Settings2 } from 'lucide-react';"
icon_import_new = "import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2, Settings2, MessageSquare, Bot, Users } from 'lucide-react';"
if "MessageSquare" not in content:
    content = content.replace(icon_import_target, icon_import_new)

old_toggle = """              <button 
                onClick={() => setChatMode('normal')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Normal Sohbet
              </button>
              <button 
                onClick={() => setChatMode('agent')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Otonom Ajan
              </button>
              <button 
                onClick={() => setChatMode('swarm')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'swarm' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Çoklu Ajan Tartışma Ağı (Developer + QA + Lead)"
              >
                Swarm Modu
              </button>"""

new_toggle = """              <button 
                onClick={() => setChatMode('normal')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${chatMode === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Normal Sohbet (Sadece konuşma, kod/işlem yok)"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Normal Sohbet
              </button>
              <button 
                onClick={() => setChatMode('agent')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${chatMode === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Otonom Ajan (Görevleri tek başına yapar)"
              >
                <Bot className="w-3.5 h-3.5" /> Otonom Ajan
              </button>
              <button 
                onClick={() => setChatMode('swarm')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${chatMode === 'swarm' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Çoklu Ajan Tartışma Ağı (Developer + QA + Lead birlikte çalışır)"
              >
                <Users className="w-3.5 h-3.5" /> Swarm Modu
              </button>"""

if "<MessageSquare" not in content:
    content = content.replace(old_toggle, new_toggle)

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)

print("UI Icons patched.")
