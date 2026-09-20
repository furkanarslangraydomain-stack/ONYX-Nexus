import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Add Settings Icon import
content = content.replace(
    "import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2 } from 'lucide-react';",
    "import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2, Settings2 } from 'lucide-react';"
)

# Add API URL state and Settings Modal state
state_code = """  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('onyx_api_url') || 'http://127.0.0.1:8000');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
"""
content = content.replace("const [activeArtifact, setActiveArtifact] = useState<{type: 'html'|'code', content: string} | null>(null);", 
                          "const [activeArtifact, setActiveArtifact] = useState<{type: 'html'|'code', content: string} | null>(null);\n" + state_code)

# Update fetches to use apiUrl
content = content.replace("fetch('http://127.0.0.1:8000/api/chat/history')", "fetch(`${apiUrl}/api/chat/history`)")
content = content.replace("fetch('http://127.0.0.1:8000/api/chat/message'", "fetch(`${apiUrl}/api/chat/message`")
content = content.replace("fetch('http://127.0.0.1:8000/api/chat/history', {method: 'DELETE'})", "fetch(`${apiUrl}/api/chat/history`, {method: 'DELETE'})")
content = content.replace("fetch('http://127.0.0.1:8000/api/tasks/submit'", "fetch(`${apiUrl}/api/tasks/submit`")
content = content.replace("fetch(`http://127.0.0.1:8000/api/tasks/${data.id}`)", "fetch(`${apiUrl}/api/tasks/${data.id}`)")

# Handle history fetch error silently in console, but update UI
content = content.replace(
    ".catch(err => console.error(\"History fetch error:\", err));",
    ".catch(err => { /* Failed to fetch silently */ });"
)
content = content.replace(
    "content: `Bağlantı hatası: Backend servisi (http://127.0.0.1:8000) aktif mi?`",
    "content: `Bağlantı hatası: Backend servisi (${apiUrl}) aktif mi? Sağ üstteki ayarlar ikonundan uç noktayı değiştirebilirsiniz.`"
)

# Add Settings Modal UI and Settings Button in header
settings_modal = """
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" /> Bağlantı Ayarları
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Backend API URL</label>
              <input 
                type="text" 
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Örn: http://127.0.0.1:8000 veya Ngrok URL'si"
              />
              <p className="text-xs text-slate-500 mt-2">Onyx-Nexus Python sunucusunun çalıştığı adresi girin (Termux veya Colab URL'si).</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">İptal</button>
              <button 
                onClick={() => {
                  setApiUrl(tempApiUrl);
                  localStorage.setItem('onyx_api_url', tempApiUrl);
                  setShowSettings(false);
                  // Reload history with new URL
                  fetch(`${tempApiUrl}/api/chat/history`)
                    .then(res => res.json())
                    .then(data => { if(data && data.length > 0) setMessages(data); })
                    .catch(() => {});
                }} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
"""

header_btns = """<div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={() => setShowSettings(true)} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-emerald-400 border border-slate-700 backdrop-blur" title="Ayarlar">
          <Settings2 className="w-4 h-4" />
        </button>
        <button onClick={clearHistory} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-red-400 border border-slate-700 backdrop-blur" title="Geçmişi Temizle">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>"""

content = content.replace(
    """<div className="absolute top-4 right-4 z-10">
        <button onClick={clearHistory} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-red-400 border border-slate-700 backdrop-blur" title="Geçmişi Temizle">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>""",
    header_btns
)

content = content.replace("  return (\n    <div className=\"flex h-full w-full bg-slate-900 overflow-hidden\">", "  return (\n    <div className=\"flex h-full w-full bg-slate-900 overflow-hidden\">" + settings_modal)

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)

print("Patched ChatInterface with configurable API URL and silenced fetch error.")
