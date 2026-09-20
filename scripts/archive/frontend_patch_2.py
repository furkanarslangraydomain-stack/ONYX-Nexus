import os

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Add Voice Button and Artifacts Layout
if "Artifacts" not in content:
    # 1. Imports
    content = content.replace("import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal } from 'lucide-react';", 
                              "import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2 } from 'lucide-react';")
    
    # 2. Add state for activeArtifact and voice
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(false);",
        """const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<{type: 'html'|'code', content: string} | null>(null);

  // Load history on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/chat/history')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
           setMessages(data);
        }
      })
      .catch(err => console.error("History fetch error:", err));
  }, []);

  const saveMessage = async (msg: Message) => {
     try {
       await fetch('http://127.0.0.1:8000/api/chat/message', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(msg)
       });
     } catch (e) {
       console.error("Save message error:", e);
     }
  };

  const clearHistory = async () => {
     await fetch('http://127.0.0.1:8000/api/chat/history', {method: 'DELETE'});
     setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Merhaba! Ben Onyx-Nexus. Çoklu Ajan motoruna bağlı Mega MCP sunucum aktif. Sana nasıl yardımcı olabilirim?',
      agentProcess: 'Sistem Başlatıldı'
    }]);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tarayıcınız Ses Tanıma desteklemiyor.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
       const transcript = e.results[0][0].transcript;
       setInput(prev => prev + ' ' + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };
"""
    )

    # 3. Handle saving to DB
    content = content.replace(
        "setMessages(prev => [...prev, userMsg]);",
        "setMessages(prev => [...prev, userMsg]);\n    saveMessage(userMsg);"
    )
    
    # 4. Handle assistant message save
    save_assist_code = """
          const finalMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content,
            htmlPreview,
            agentProcess: checkData.status === 'COMPLETED' ? 'İşlem Tamamlandı' : 'Hata Oluştu'
          };
          saveMessage(finalMsg);
          
          if (htmlPreview) {
             setActiveArtifact({type: 'html', content: htmlPreview});
          } else if (content.includes('```')) {
             const codeMatch = content.match(/```[a-z]*\\n([\\s\\S]*?)\\n```/);
             if(codeMatch) setActiveArtifact({type: 'code', content: codeMatch[1]});
          }
"""
    content = content.replace(
        "setMessages(prev => prev.map(m => \n            m.id === assistantMsgId \n              ? { ...m, content, htmlPreview, agentProcess: checkData.status === 'COMPLETED' ? 'İşlem Tamamlandı' : 'Hata Oluştu' }\n              : m\n          ));",
        "setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));" + save_assist_code
    )

    # 5. UI Layout - Split Screen
    # Re-structure the wrapper
    # Replace outer div
    content = content.replace(
        "<div className=\"flex flex-col h-full w-full bg-slate-900 overflow-hidden\">",
        "<div className=\"flex h-full w-full bg-slate-900 overflow-hidden\">\n      <div className={`flex flex-col h-full transition-all duration-300 ${activeArtifact ? 'w-1/2 border-r border-slate-800' : 'w-full'}`}>\n"
    )

    # Wrap the end of the left panel
    content = content.replace(
        "      </div>\n    </div>\n  );\n}",
        "      </div>\n      </div>\n\n      {/* Artifacts Panel */}\n      {activeArtifact && (\n        <div className=\"w-1/2 h-full flex flex-col bg-slate-950 animate-in slide-in-from-right\">\n          <div className=\"h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50\">\n            <div className=\"flex items-center gap-2 text-sm font-medium text-slate-300\">\n              {activeArtifact.type === 'html' ? <SquareTerminal className=\"w-4 h-4 text-emerald-400\" /> : <Code2 className=\"w-4 h-4 text-emerald-400\" />}\n              {activeArtifact.type === 'html' ? '3D Render / HTML Çıktısı' : 'Üretim Kodu'}\n            </div>\n            <button onClick={() => setActiveArtifact(null)} className=\"text-slate-400 hover:text-slate-200\">\n              <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg>\n            </button>\n          </div>\n          <div className=\"flex-1 p-4 overflow-hidden relative\">\n            {activeArtifact.type === 'html' ? (\n               <iframe srcDoc={activeArtifact.content} className=\"w-full h-full bg-white rounded-lg border-0\" sandbox=\"allow-scripts\" />\n            ) : (\n               <pre className=\"w-full h-full overflow-auto bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300\">\n                 {activeArtifact.content}\n               </pre>\n            )}\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}"
    )

    # 6. Add Voice button to inputs and clear history button
    input_btns = """
            <button onClick={handleVoiceInput} className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isListening ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'}`}>
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            <label className="p-2 text-slate-400 hover:text-emerald-400 cursor-pointer rounded-lg hover:bg-slate-700 transition-colors">
"""
    content = content.replace("<label className=\"p-2 text-slate-400 hover:text-emerald-400 cursor-pointer rounded-lg hover:bg-slate-700 transition-colors\">", input_btns)

    header_btn = """<div className="absolute top-4 right-4 z-10">
        <button onClick={clearHistory} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-red-400 border border-slate-700 backdrop-blur" title="Geçmişi Temizle">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">"""
    
    content = content.replace("<div className=\"flex-1 overflow-y-auto p-4 sm:p-6 space-y-6\">", header_btn)


with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)

print("ChatInterface.tsx patched.")
