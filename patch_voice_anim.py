import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# 1. Add Speech Recognition logic
speech_logic = """
  // Sesli Komut (Voice Recognition)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onerror = (event: any) => {
      console.error("Ses tanıma hatası:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };
"""

if "window.SpeechRecognition" not in content:
    # Insert right before const handleSend
    content = content.replace("const handleSend = async () => {", speech_logic + "\n  const handleSend = async () => {")

# 2. Wire up the Mic button
old_mic = """            <button 
              onClick={() => setIsListening(!isListening)}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            >
              <Mic className="w-5 h-5" />
            </button>"""
new_mic = """            <button 
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse ring-2 ring-red-500/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              title="Sesli Komut"
            >
              <Mic className="w-5 h-5" />
            </button>"""
if "toggleListening" in new_mic and "onClick={toggleListening}" not in content:
    content = content.replace(old_mic, new_mic)

# 3. Add Agent Reaction Animations
# In the messages map...
old_msg_render = """                      <div className="text-sm prose prose-invert max-w-none">
                        {msg.content}
                      </div>"""

new_msg_render = """                      <div className="text-sm prose prose-invert max-w-none">
                        {msg.content === 'Düşünüyor...' || msg.content.includes('bekleyin...') ? (
                          <div className="flex items-center gap-3 text-emerald-400 font-medium">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="animate-pulse">{msg.content}</span>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>"""
                      
if "animate-bounce" not in content:
    content = content.replace(old_msg_render, new_msg_render)
    
# Make the avatar glow when processing
old_avatar = """                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>"""
new_avatar = """                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'} ${(msg.content === 'Düşünüyor...' || msg.content.includes('bekleyin...')) ? 'ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : ''}`}>"""
if "shadow-[0_0_15px" not in content:
    content = content.replace(old_avatar, new_avatar)

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)

print("Voice command and agent animations patched!")
