import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# 1. Add Volume2 to lucide imports
if "Volume2" not in content:
    content = content.replace("Users } from 'lucide-react';", "Users, Volume2 } from 'lucide-react';")

# 2. Add TTS Function and state
tts_logic = """
  // Text-to-Speech (Sesli Yanıt)
  const speakText = (text: string) => {
    // @ts-ignore
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown and code blocks for better speech
    const cleanText = text
      .replace(/```[\\s\\S]*?```/g, " [Kod bloğu] ")
      .replace(/[*_#`]/g, "")
      .replace(/\\[(.*?)\\]\\(.*?\\)/g, "$1");
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };
"""
if "const speakText" not in content:
    content = content.replace("// Sesli Komut (Voice Recognition)", tts_logic + "\n  // Sesli Komut (Voice Recognition)")

# 3. Track if user used voice
if "const isVoiceInputRef = useRef(false);" not in content:
    content = content.replace("const [isListening, setIsListening] = useState(false);", 
    "const [isListening, setIsListening] = useState(false);\n  const isVoiceInputRef = useRef(false);")

# Update toggleListening to set the ref
old_recognition_onresult = """    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };"""
new_recognition_onresult = """    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      isVoiceInputRef.current = true; // Sesle giriş yapıldığını kaydet
    };"""
if "isVoiceInputRef.current = true;" not in content:
    content = content.replace(old_recognition_onresult, new_recognition_onresult)

# 4. Auto-play TTS on completion
old_normal_chat = """          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          setIsLoading(false);"""
new_normal_chat = """          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          setIsLoading(false);
          
          if (isVoiceInputRef.current) {
             speakText(finalMsg.content);
             isVoiceInputRef.current = false;
          }"""
if "speakText(finalMsg.content)" not in content:
    content = content.replace(old_normal_chat, new_normal_chat)

old_task_chat = """          if (htmlPreview) {
             setActiveArtifact({type: 'html', content: htmlPreview});
          } else if (content.includes('```')) {
             const codeMatch = content.match(/```[a-z]*\\n([\\s\\S]*?)\\n```/);
             if(codeMatch) setActiveArtifact({type: 'code', content: codeMatch[1]});
          }
          setIsLoading(false);"""
new_task_chat = """          if (htmlPreview) {
             setActiveArtifact({type: 'html', content: htmlPreview});
          } else if (content.includes('```')) {
             const codeMatch = content.match(/```[a-z]*\\n([\\s\\S]*?)\\n```/);
             if(codeMatch) setActiveArtifact({type: 'code', content: codeMatch[1]});
          }
          setIsLoading(false);
          
          if (isVoiceInputRef.current) {
             speakText(finalMsg.content);
             isVoiceInputRef.current = false;
          }"""
content = content.replace(old_task_chat, new_task_chat)

# 5. Add manual TTS button to assistant messages
old_msg_bubble = """                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'} ${(msg.content === 'Düşünüyor...' || msg.content.includes('bekleyin...')) ? 'ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : ''}`}>
                    {msg.role === 'user' ? <Terminal className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </div>"""

new_msg_bubble = """                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'} ${(msg.content === 'Düşünüyor...' || msg.content.includes('bekleyin...')) ? 'ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : ''}`}>
                    {msg.role === 'user' ? <Terminal className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </div>
                  {msg.role === 'assistant' && msg.content !== 'Düşünüyor...' && !msg.content.includes('bekleyin...') && (
                    <button onClick={() => speakText(msg.content)} className="absolute -left-10 top-2 p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="Sesli Oku">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}"""

# Note: We need to make the parent flex container a 'group' for opacity to work
old_msg_row = """              <div key={msg.id} className={`flex gap-4 ${msg.role === 'system' ? 'justify-center' : ''}`}>"""
new_msg_row = """              <div key={msg.id} className={`flex gap-4 group relative ${msg.role === 'system' ? 'justify-center' : ''}`}>"""

if "<Volume2" not in content:
    content = content.replace(old_msg_row, new_msg_row)
    content = content.replace(old_msg_bubble, new_msg_bubble)
    
# Import useRef
if "useRef" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useRef, useEffect } from 'react';")

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
print("TTS and Frontend logic patched.")
