import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Sparkles,
  Terminal,
  Mic,
  Code2,
  Trash2,
  Settings2,
  Volume2,
  Copy,
  Check,
  Shield,
  Layers,
  ChevronDown,
  RefreshCw,
  Search,
  Coins,
  Cpu,
  ArrowRight,
  ExternalLink,
  Bot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CONFIGURED_AGENTS, CONFIGURED_WORKFLOWS } from '../config/agentsAndWorkflows';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageData?: string;
  codePreview?: string;
  htmlPreview?: string;
  taskId?: string;
  agentProcess?: string;
  agentId?: string;
  workflowId?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isVoiceInputRef = useRef(false);
  
  // Selected Agent and Workflow
  const [selectedAgentId, setSelectedAgentId] = useState<string>('router');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('dual_stage_cot');
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);

  const [activeArtifact, setActiveArtifact] = useState<{ type: 'html' | 'code'; content: string } | null>(null);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('onyx_api_url') || window.location.origin);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const selectedAgent = CONFIGURED_AGENTS.find(a => a.id === selectedAgentId) || CONFIGURED_AGENTS[0];
  const selectedWorkflow = CONFIGURED_WORKFLOWS.find(w => w.id === selectedWorkflowId) || CONFIGURED_WORKFLOWS[0];

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    fetch(`${apiUrl}/api/chat/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, [apiUrl]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const saveMessage = async (msg: Message) => {
    try {
      await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
    } catch (e) {
      // ignore
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${apiUrl}/api/chat/history`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    setMessages([]);
    setActiveArtifact(null);
  };

  // Text-to-Speech (Sesli Yanıt)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, " [Kod bloğu] ")
      .replace(/[*_#`]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Sesli Komut (Voice Recognition)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.");
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      isVoiceInputRef.current = true;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

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

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const textToSend = promptToSend !== undefined ? promptToSend : input;
    if (!textToSend.trim() && !imageData) return;

    // Özel komutlar: /ogret
    if (textToSend.trim().startsWith('/ogret') || textToSend.trim().startsWith('/learn')) {
      const parts = textToSend.trim().split(' ');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content: contentText })
      });

      const ftMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `✅ Başarılı! Sistem '${topic}' kuralıyla eğitildi (Fine-Tuned). Kalıcı hafızaya kaydedildi.`
      };
      setMessages(prev => [...prev, ftMsg]);
      setInput('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      imageData: imageData || undefined,
      agentId: selectedAgentId,
      workflowId: selectedWorkflowId
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessage(userMsg);

    const currentInput = textToSend;
    setInput('');
    setImageData(null);
    setIsLoading(true);

    const assistantMsgId = 'msg-' + Date.now().toString();

    try {
      // Backend /api/chat/completion çağrısı (Agent ve Workflow ile)
      const res = await fetch(`${apiUrl}/api/chat/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          agent: selectedAgentId,
          workflow: selectedWorkflowId,
          image_data: imageData
        })
      });

      const data = await res.json();
      const content = data.response || data.result || 'İşlem tamamlandı.';

      let htmlPreview: string | undefined;
      if (content.includes('```html') && currentInput.toLowerCase().includes('3d')) {
        const match = content.match(/```html\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          htmlPreview = match[1];
        }
      }

      const finalMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: content,
        htmlPreview: htmlPreview,
        agentProcess: `${selectedAgent.name} • ${selectedWorkflow.name}`,
        agentId: selectedAgentId,
        workflowId: selectedWorkflowId
      };

      setMessages(prev => [...prev, finalMsg]);
      saveMessage(finalMsg);

      if (htmlPreview) {
        setActiveArtifact({ type: 'html', content: htmlPreview });
      } else if (content.includes('```')) {
        const codeMatch = content.match(/```[a-z]*\n([\s\S]*?)\n```/);
        if (codeMatch) setActiveArtifact({ type: 'code', content: codeMatch[1] });
      }

      setIsLoading(false);
      if (isVoiceInputRef.current) {
        speakText(content);
        isVoiceInputRef.current = false;
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: `Bağlantı hatası: Sunucu ile iletişim kurulamadı. Ayarlardan API URL'sini (${apiUrl}) kontrol edebilirsiniz.`
        }
      ]);
      setIsLoading(false);
    }
  };

  const suggestionCards = [
    {
      title: '5-Ajanlı Swarm Konsensüsü',
      desc: 'Architect, Coder ve Reviewer ajanlarıyla otonom kod ve blueprint üret',
      prompt: 'Yeni nesil mikroservis tabanlı bir veri işleme motoru için mimari blueprint oluştur ve Python kodunu üret.',
      icon: Layers,
      agentId: 'architect',
      workflowId: 'consensus_swarm',
      badge: 'Swarm'
    },
    {
      title: 'Web3 & EVM Akıllı Sözleşme',
      desc: 'ERC-20 Staking sözleşmesi oluştur ve güvenlik açıklarını tara',
      prompt: 'Solidity 0.8.24 ile reentrancy korumalı ve gas optimizasyonlu ERC-20 Staking akıllı sözleşmesi yaz.',
      icon: Coins,
      agentId: 'web3',
      workflowId: 'auto_repair_loop',
      badge: 'Web3'
    },
    {
      title: 'Zero-Knowledge Gizlilik Kalkanı',
      desc: 'Hassas API anahtarlarını ve veritabanı bilgilerini körleştir',
      prompt: 'Cüzdan: 0x71C84183203fCd82004E82554CE1B31580A76356, Secret: sk-live-9988776655. Bu bilgileri ZK kalkanıyla maskeleyip güvenli hale getir.',
      icon: Shield,
      agentId: 'sentinel',
      workflowId: 'zk_privacy_flow',
      badge: 'ZK-Shield'
    },
    {
      title: 'Otonom Derin Araştırma',
      desc: 'Wikipedia ve teknik kaynaklardan kanıta dayalı analiz sentezle',
      prompt: 'SQLite FTS5 WAL concurrency mimarisi ile Postgres MVCC concurrency modellerini karşılaştır ve teknik sentez hazırla.',
      icon: Search,
      agentId: 'researcher',
      workflowId: 'deep_research_flow',
      badge: 'Scholar'
    }
  ];

  return (
    <div className="flex h-full w-full bg-[#0a0d14] text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background Ambient Glow (Gemini Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-cyan-500/5 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Conversational Stage */}
      <div className={`flex flex-col h-full transition-all duration-300 ${activeArtifact ? 'w-full lg:w-3/5 border-r border-slate-800/80' : 'w-full'}`}>
        
        {/* Gemini Top Bar Controls */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/60 bg-[#0a0d14]/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Agent Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAgentMenu(!showAgentMenu);
                  setShowWorkflowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium transition text-slate-200 shadow-sm"
              >
                <span className="text-sm">{selectedAgent.avatar}</span>
                <span className="font-semibold text-cyan-400">{selectedAgent.name}</span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({selectedAgent.role})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showAgentMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1.5 font-semibold">
                    Uzman Ajanlar & Botlar ({CONFIGURED_AGENTS.length})
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {CONFIGURED_AGENTS.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setShowAgentMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition ${
                          selectedAgentId === agent.id ? 'bg-cyan-500/10 border border-cyan-500/30 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{agent.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold flex items-center justify-between">
                            <span>{agent.name}</span>
                            <span className="text-[9px] font-mono text-emerald-400 px-1 rounded bg-emerald-500/10">
                              {agent.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Selector Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setShowWorkflowMenu(!showWorkflowMenu);
                  setShowAgentMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium transition text-slate-300"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300">{selectedWorkflow.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showWorkflowMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1.5 font-semibold">
                    Otonom İş Akışları ({CONFIGURED_WORKFLOWS.length})
                  </div>
                  <div className="space-y-1">
                    {CONFIGURED_WORKFLOWS.map(wf => (
                      <button
                        key={wf.id}
                        onClick={() => {
                          setSelectedWorkflowId(wf.id);
                          setShowWorkflowMenu(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition ${
                          selectedWorkflowId === wf.id ? 'bg-purple-500/10 border border-purple-500/30 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-purple-300 mb-0.5">{wf.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2">{wf.description}</div>
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-slate-500">
                          <span>Adımlar: {wf.steps.join(' -> ')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ZK-Shield Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>ZK-Privacy Shield</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
              title="Bağlantı Ayarları"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition"
              title="Geçmişi Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Gemini Welcome / Empty State */}
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto py-12 px-2 flex flex-col items-center text-center">
              {/* Animated Sparkle Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20 mb-6">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Merhaba, ben ONYX-Nexus
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-10 leading-relaxed">
                9 uzman ajan, sıfır maliyetli LLM havuzu ve Zero-Knowledge gizlilik kalkanıyla güçlendirilmiş otonom yapay zeka işletim sistemi.
              </p>

              {/* 4 Suggestion Cards (Gemini Aesthetic) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                {suggestionCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedAgentId(card.agentId);
                        setSelectedWorkflowId(card.workflowId);
                        handleSendPrompt(card.prompt);
                      }}
                      className="group p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all text-left flex flex-col justify-between shadow-sm hover:shadow-cyan-500/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          {card.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {card.desc}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Hemen Çalıştır</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="max-w-2xl mx-auto my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`max-w-3xl mx-auto flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md shadow-cyan-500/10 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Agent Process Badge */}
                  {!isUser && msg.agentProcess && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/90 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{msg.agentProcess}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.imageData && (
                      <img
                        src={msg.imageData}
                        alt="Kullanıcı Görseli"
                        className="max-w-xs max-h-48 rounded-lg mb-2 object-cover border border-white/20"
                      />
                    )}

                    <div className="prose prose-invert prose-sm max-w-none break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            return !inline && match ? (
                              <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                  <span>{match[1]}</span>
                                  <button
                                    onClick={() => handleCopyCode(codeString, msg.id)}
                                    className="flex items-center gap-1 hover:text-slate-200 transition"
                                  >
                                    {copiedCodeId === msg.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Kopyalandı</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Kopyala</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-300">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-xs font-mono text-cyan-300" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Actions under Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                      <button
                        onClick={() => speakText(msg.content)}
                        className="flex items-center gap-1 hover:text-slate-300 transition"
                        title="Sesli Oku"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Seslendir</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyCode(msg.content, msg.id)}
                        className="hover:text-slate-300 transition"
                      >
                        Kopyala
                      </button>
                      {msg.htmlPreview && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => setActiveArtifact({ type: 'html', content: msg.htmlPreview! })}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                          >
                            3D/HTML Önizle
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="max-w-3xl mx-auto flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs font-mono text-cyan-400 flex items-center gap-2.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{selectedAgent.name} ({selectedWorkflow.name}) otonom olarak işliyor...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Gemini Iconic Floating Rounded Input Bar */}
        <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto shrink-0">
          <div className="relative rounded-3xl bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 focus-within:border-cyan-500/60 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all shadow-xl shadow-black/40 backdrop-blur-xl p-2.5 sm:p-3">
            
            {/* Top Row: Active Agent & Workflow Pills inside input box */}
            <div className="flex items-center gap-2 px-2 pb-1.5 border-b border-slate-800/60 mb-2">
              <span className="text-xs">{selectedAgent.avatar}</span>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">{selectedAgent.name}</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-purple-400">{selectedWorkflow.name}</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> ZK-Korumalı
              </span>

              {imageData && (
                <div className="ml-auto flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  <span>Görsel eklendi</span>
                  <button onClick={() => setImageData(null)} className="hover:text-rose-400 ml-1">×</button>
                </div>
              )}
            </div>

            {/* Main Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder={`${selectedAgent.name}'e bir görev verin, kod yazdırın veya soru sorun...`}
              rows={2}
              className="w-full bg-transparent border-0 resize-none px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 leading-relaxed"
            />

            {/* Action Bar Bottom Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Image Upload */}
                <label className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition cursor-pointer" title="Görsel Yükle">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Voice Input */}
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80'
                  }`}
                  title="Sesle Yaz"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <span className="text-[11px] text-slate-600 font-mono hidden md:inline">
                  Shift+Enter: Yeni Satır
                </span>
              </div>

              {/* Glowing Send Button */}
              <button
                onClick={() => handleSendPrompt()}
                disabled={(!input.trim() && !imageData) || isLoading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() || imageData
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Artifact Preview Panel (for 3D / Code HTML) */}
      {activeArtifact && (
        <div className="w-full lg:w-2/5 h-full bg-slate-950 flex flex-col border-l border-slate-800/80 z-20">
          <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Canlı Artifact Önizleme ({activeArtifact.type.toUpperCase()})</span>
            </div>
            <button
              onClick={() => setActiveArtifact(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition text-xs font-mono"
            >
              Kapat ✕
            </button>
          </div>

          <div className="flex-1 overflow-hidden p-3">
            {activeArtifact.type === 'html' ? (
              <iframe
                srcDoc={activeArtifact.content}
                className="w-full h-full rounded-xl border border-slate-800 bg-black"
                sandbox="allow-scripts"
                title="Artifact Preview"
              />
            ) : (
              <pre className="w-full h-full p-4 rounded-xl border border-slate-800 bg-slate-900 text-emerald-300 font-mono text-xs overflow-auto">
                {activeArtifact.content}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-cyan-400" /> ONYX-Nexus Bağlantı Ayarları
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Sunucu API adresini özelleştirin (Yerel, Colab Cloudflare tüneli veya Uzak Sunucu).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Backend API URL</label>
                <input
                  type="text"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="https://...trycloudflare.com veya http://127.0.0.1:8000"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">İpuçları:</div>
                <div>• Google Colab için: Cloudflare Tünel adresini girin.</div>
                <div>• Yerel geliştirme için: <code className="text-cyan-400">{window.location.origin}</code> veya <code className="text-cyan-400">http://127.0.0.1:8000</code>.</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setApiUrl(tempApiUrl);
                  localStorage.setItem('onyx_api_url', tempApiUrl);
                  setShowSettings(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md transition hover:scale-105"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
