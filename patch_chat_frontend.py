import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# 1. Update Modes state definition (which might be typed)
old_state = "const [chatMode, setChatMode] = useState<'normal' | 'agent'>('agent');"
new_state = "const [chatMode, setChatMode] = useState<'normal' | 'agent' | 'swarm'>('agent');"
content = content.replace(old_state, new_state)

# 2. Add Swarm button to toggle UI
old_toggle = """              <button 
                onClick={() => setChatMode('agent')}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-colors ${chatMode === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Otonom Ajan Modu
              </button>
            </div>"""

new_toggle = """              <button 
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
              </button>
            </div>"""
if "Swarm Modu" not in content:
    content = content.replace(old_toggle, new_toggle)

# 3. Add Swarm logic to handleSend
old_task = """      // AGENT TASK MODE
      const taskRes = await fetch(`${apiUrl}/api/tasks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, engine: 'auto', image_data: currentImage })
      });"""

new_task = """      // AGENT TASK MODE
      let selectedEngine = 'auto';
      if (chatMode === 'swarm') selectedEngine = 'swarm';
      
      const taskRes = await fetch(`${apiUrl}/api/tasks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, engine: selectedEngine, image_data: currentImage })
      });"""

if "selectedEngine =" not in content:
    content = content.replace(old_task, new_task)
    
# 4. Add Cron command logic to handleSend
# If message starts with "/cron", intercept it.
old_start = """    if (!input.trim() && !imageData) return;"""
new_start = """    if (!input.trim() && !imageData) return;
    
    if (input.trim().startsWith('/cron')) {
       // Example: /cron 60 Her sabah bana haberleri özetle
       const parts = input.trim().split(' ');
       const interval = parts[1];
       const prompt = parts.slice(2).join(' ');
       
       await fetch(`${apiUrl}/api/schedule`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({interval: parseInt(interval) || 60, prompt})
       });
       
       const cronMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ Zamanlanmış Görev (Cron Job) eklendi! Görev her ${interval || 60} dakikada bir arkaplanda otonom olarak çalışıp sonuçları buraya gönderecektir.`
       };
       setMessages(prev => [...prev, cronMsg]);
       setInput('');
       return;
    }
"""
if "startsWith('/cron')" not in content:
    content = content.replace(old_start, new_start)

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
print("ChatInterface.tsx patched with Swarm and Cron commands.")
