import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Check, Loader2, FileCode, Play, Terminal, Mic, SquareTerminal, Code2, Trash2, Settings2, MessageSquare, Bot, Users, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageData?: string;
  codePreview?: string;
  htmlPreview?: string;
  taskId?: string;
  agentProcess?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Merhaba! Ben Onyx-Nexus. Çoklu Ajan motoruna bağlı Mega MCP sunucum aktif. Sana nasıl yardımcı olabilirim?',
      agentProcess: 'Sistem Başlatıldı'
    }
  ]);
  const [input, setInput] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isVoiceInputRef = useRef(false);
  const [chatMode, setChatMode] = useState<'normal' | 'agent' | 'swarm'>('agent');
  const [activeArtifact, setActiveArtifact] = useState<{type: 'html'|'code', content: string} | null>(null);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('onyx_api_url') || 'http://127.0.0.1:8000');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);


  // Load history on mount
  useEffect(() => {
    fetch(`${apiUrl}/api/chat/history`)
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
           setMessages(data);
        }
      })
      .catch(err => { /* Failed to fetch silently */ });
  }, []);

  const saveMessage = async (msg: Message) => {
     try {
       await fetch(`${apiUrl}/api/chat/message`, {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(msg)
       });
     } catch (e) {
       console.error("Save message error:", e);
     }
  };

  const clearHistory = async () => {
     await fetch(`${apiUrl}/api/chat/history`, {method: 'DELETE'});
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

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  
  
  // Text-to-Speech (Sesli Yanıt)
  const speakText = (text: string) => {
    // @ts-ignore
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown and code blocks for better speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, " [Kod bloğu] ")
      .replace(/[*_#`]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

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
      isVoiceInputRef.current = true; // Sesle giriş yapıldığını kaydet
    };
    recognition.onerror = (event: any) => {
      console.error("Ses tanıma hatası:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() && !imageData) return;
    
    // Öğrenme Modülü (Continuous Fine-Tuning)
    if (input.trim().startsWith('/ogret') || input.trim().startsWith('/learn')) {
       const parts = input.trim().split(' ');
       const cmd = parts[0];
       
       // Example: /ogret React_Kurallari Bundan sonra class yerine sadece hooks kullan.
       let topic = "Genel";
       let contentText = "";
       
       if (parts.length > 2 && !parts[1].includes(' ')) {
           topic = parts[1].replace(/_/g, ' ');
           contentText = parts.slice(2).join(' ');
       } else {
           contentText = parts.slice(1).join(' ');
       }
       
       await fetch(`${apiUrl}/api/learn`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({topic, content: contentText})
       });
       
       const ftMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ Başarılı! Sistem '${topic}' konusunda yeni bilgilerle eğitildi (Fine-Tuned). Bu kurallar artık kalıcı hafızama işlendi.`
       };
       setMessages(prev => [...prev, ftMsg]);
       if (isVoiceInputRef.current) {
          speakText("Başarılı. Sistem bu konuda eğitildi ve kurallar kalıcı hafızaya işlendi.");
          isVoiceInputRef.current = false;
       }
       setInput('');
       return;
    }

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

    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      imageData: imageData || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessage(userMsg);
    
    const currentInput = input;
    const currentImage = imageData;
    setInput('');
    setImageData(null);
    setIsLoading(true);

    try {
      const assistantMsgId = 'msg-' + Date.now().toString();
      
      if (chatMode === 'normal') {
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
          
          if (isVoiceInputRef.current) {
             speakText(finalMsg.content);
             isVoiceInputRef.current = false;
          }
          return;
      }

      // AGENT TASK MODE
      let selectedEngine = 'auto';
      if (chatMode === 'swarm') selectedEngine = 'swarm';
      
      const taskRes = await fetch(`${apiUrl}/api/tasks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, engine: selectedEngine, image_data: currentImage })
      });
      const data = await taskRes.json();
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: 'Görev işleniyor, lütfen bekleyin...',
        taskId: data.id,
        agentProcess: 'Görev kuyruğa alındı'
      }]);

      // Polling
      const poll = setInterval(async () => {
        const checkRes = await fetch(`${apiUrl}/api/tasks/${data.id}`);
        const checkData = await checkRes.json();
        
        if (checkData.status === 'COMPLETED' || checkData.status === 'FAILED') {
          clearInterval(poll);
          
          let content = checkData.result || checkData.error || 'İşlem tamamlandı.';
          let htmlPreview;
          
          if (content.includes('```html') && currentInput.toLowerCase().includes('3d')) {
             const match = content.match(/```html\n([\s\S]*?)\n```/);
             if (match && match[1]) {
                htmlPreview = match[1];
             }
          }

          const finalMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content,
            htmlPreview,
            agentProcess: checkData.status === 'COMPLETED' ? 'İşlem Tamamlandı' : 'Hata Oluştu'
          };
          
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          
          if (htmlPreview) {
             setActiveArtifact({type: 'html', content: htmlPreview});
          } else if (content.includes('```')) {
             const codeMatch = content.match(/```[a-z]*\n([\s\S]*?)\n```/);
             if(codeMatch) setActiveArtifact({type: 'code', content: codeMatch[1]});
          }
          setIsLoading(false);
          
          if (isVoiceInputRef.current) {
             speakText(finalMsg.content);
             isVoiceInputRef.current = false;
          }
        } else {
           setMessages(prev => prev.map(m => 
            m.id === assistantMsgId 
              ? { ...m, agentProcess: `Ajanlar çalışıyor (${checkData.status})...` }
              : m
          ));
        }
      }, 2000);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Bağlantı hatası: Backend servisi (${apiUrl}) aktif mi? Sağ üstteki ayarlar ikonundan uç noktayı değiştirebilirsiniz.`
      }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-900 overflow-hidden">
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

      <div className={`flex flex-col h-full transition-all duration-300 ${activeArtifact ? 'w-1/2 border-r border-slate-800' : 'w-full'}`}>

      {/* Chat History */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={() => setShowSettings(true)} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-emerald-400 border border-slate-700 backdrop-blur" title="Ayarlar">
          <Settings2 className="w-4 h-4" />
        </button>
        <button onClick={clearHistory} className="bg-slate-800/80 p-2 rounded-lg text-slate-400 hover:text-red-400 border border-slate-700 backdrop-blur" title="Geçmişi Temizle">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-slate-100'
                : msg.role === 'system'
                  ? 'bg-red-900/50 text-red-200 border border-red-800'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{msg.agentProcess || 'Onyx-Nexus'}</span>
                </div>
              )}
              
              {msg.imageData && (
                <img src={msg.imageData} alt="Uploaded preview" className="max-w-sm rounded-lg mb-3 object-contain border border-slate-600" />
              )}
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.htmlPreview && (
                 <div className="mt-4 rounded-lg overflow-hidden border border-slate-700 h-64 relative bg-black">
                   <iframe srcDoc={msg.htmlPreview} className="w-full h-full border-0" sandbox="allow-scripts" />
                 </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-sm font-mono text-slate-400">Mega MCP & Ajanlar çalışıyor...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto relative">
          {imageData && (
            <div className="absolute -top-16 left-0 bg-slate-800 border border-slate-700 p-2 rounded-lg shadow-lg flex items-center gap-3">
              <img src={imageData} alt="Upload thumb" className="h-10 w-10 rounded object-cover" />
              <button onClick={() => setImageData(null)} className="text-xs text-red-400 hover:text-red-300">İptal</button>
            </div>
          )}
          
          <div className="flex justify-center mb-2">
            <div className="bg-slate-800 p-1 rounded-lg inline-flex border border-slate-700">
              <button 
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
              </button>
            </div>
          </div>
          <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">

            
            <button onClick={handleVoiceInput} className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isListening ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'}`}>
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            <label className="p-2 text-slate-400 hover:text-emerald-400 cursor-pointer rounded-lg hover:bg-slate-700 transition-colors">

              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Onyx-Nexus'a mesaj gönder... (Resim yüklemek için sol butonu kullan)"
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-slate-200 p-2 max-h-32 text-sm"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !imageData)}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors flex-shrink-0 mb-0.5"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500 font-mono">
             Onyx-Nexus Termux & Open WebUI Ajan Motoru. Hatalar yapabilir, lütfen kritik kodları doğrulayın.
          </div>
        </div>
      </div>
      </div>

      {/* Artifacts Panel */}
      {activeArtifact && (
        <div className="w-1/2 h-full flex flex-col bg-slate-950 animate-in slide-in-from-right">
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              {activeArtifact.type === 'html' ? <SquareTerminal className="w-4 h-4 text-emerald-400" /> : <Code2 className="w-4 h-4 text-emerald-400" />}
              {activeArtifact.type === 'html' ? '3D Render / HTML Çıktısı' : 'Üretim Kodu'}
            </div>
            <button onClick={() => setActiveArtifact(null)} className="text-slate-400 hover:text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden relative">
            {activeArtifact.type === 'html' ? (
               <iframe srcDoc={activeArtifact.content} className="w-full h-full bg-white rounded-lg border-0" sandbox="allow-scripts" />
            ) : (
               <pre className="w-full h-full overflow-auto bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                 {activeArtifact.content}
               </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
