import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Add Mode State
if "chatMode" not in content:
    content = content.replace("const [isListening, setIsListening] = useState(false);", "const [isListening, setIsListening] = useState(false);\n  const [chatMode, setChatMode] = useState<'normal' | 'agent'>('agent');")
    
    # Add Toggle UI above textarea
    toggle_ui = """
          <div className="flex justify-center mb-2">
            <div className="bg-slate-800 p-1 rounded-lg inline-flex border border-slate-700">
              <button 
                onClick={() => setChatMode('normal')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Normal Sohbet
              </button>
              <button 
                onClick={() => setChatMode('agent')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Otonom Ajan Modu
              </button>
            </div>
          </div>
          <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
"""
    content = content.replace("<div className=\"flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all\">", toggle_ui)

# Modify handleSend to branch based on chatMode
new_send = """
      if (chatMode === 'normal') {
          // NORMAL CHAT MODE
          setMessages(prev => [...prev, {
            id: assistantMsgId,
            role: 'assistant',
            content: 'Düşünüyor...',
            agentProcess: 'Bilinç Modülü Devrede'
          }]);
          
          const chatRes = await fetch(`${apiUrl}/api/chat/completion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: currentInput })
          });
          const chatData = await chatRes.json();
          const finalMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: chatData.response,
            agentProcess: 'Normal Sohbet Yanıtı'
          };
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          setIsLoading(false);
          return;
      }
      
      // AGENT TASK MODE
"""
if "// NORMAL CHAT MODE" not in content:
    content = content.replace("const data = await res.json();\n      \n      const assistantMsgId = 'msg-' + data.id;", "const assistantMsgId = 'msg-' + Date.now().toString();\n      " + new_send + "\n      const res = await fetch(`${apiUrl}/api/tasks/submit`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ prompt: currentInput, engine: 'auto', image_data: currentImage })\n      });\n      const data = await res.json();")
    content = content.replace("const assistantMsgId = 'msg-' + data.id;", "") # remove leftover

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
print("ChatInterface.tsx patched for dual mode.")
