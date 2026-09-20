import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Download,
  Play,
  Server,
  Zap,
  Cpu,
  Code2,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Globe,
  FileCode,
  Laptop
} from 'lucide-react';

interface MCPAppConfig {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  filePath: string;
  configJson: string;
  setupSteps: string[];
}

export const McpConnectHub: React.FC = () => {
  const [activeClient, setActiveClient] = useState<string>('cursor');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testTool, setTestTool] = useState<string>('fs_list_dir');
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [isRunningTool, setIsRunningTool] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  const host = typeof window !== 'undefined' ? window.location.host : '127.0.0.1:3000';
  const sseUrl = `https://${host}/api/mcp/sse`;
  const rpcUrl = `https://${host}/api/mcp/rpc`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const clientConfigs: Record<string, MCPAppConfig> = {
    cursor: {
      id: 'cursor',
      name: 'Cursor IDE',
      category: 'AI Code Editor',
      badge: 'Popüler',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Cursor Composer ve Chat panelinden ONYX-Nexus araçlarını doğrudan çağırın.',
      filePath: '.cursor/mcp.json veya Cursor Settings -> Features -> MCP',
      setupSteps: [
        'Cursor uygulamasını açın ve Settings (Ayarlar) -> Features -> MCP sekmesine gidin.',
        '"Add new MCP server" butonuna tıklayın.',
        'Aşağıdaki JSON konfigürasyonunu yapıştırın veya projenizin kök dizininde .cursor/mcp.json dosyasına ekleyin.'
      ],
      configJson: JSON.stringify(
        {
          mcpServers: {
            "onyx-nexus": {
              command: "python3",
              args: ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"]
            },
            "onyx-nexus-remote": {
              url: sseUrl
            }
          }
        },
        null,
        2
      )
    },
    claude: {
      id: 'claude',
      name: 'Claude Desktop',
      category: 'Anthropic Resmi İstemci',
      badge: 'Resmi',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Claude Desktop uygulamasına 36+ dosya, bellek ve sistem aracını bağlayın.',
      filePath: 'Mac: ~/Library/Application Support/Claude/claude_desktop_config.json\nWin: %APPDATA%\\Claude\\claude_desktop_config.json',
      setupSteps: [
        'Claude Desktop uygulamasını tamamen kapatın.',
        'Yukarıda belirtilen dosya yolundaki claude_desktop_config.json dosyasını bir editörle açın.',
        'Aşağıdaki mcpServers bloğunu ekleyin ve Claude uygulamasını yeniden başlatın.'
      ],
      configJson: JSON.stringify(
        {
          mcpServers: {
            "onyx-nexus": {
              command: "python3",
              args: ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"]
            }
          }
        },
        null,
        2
      )
    },
    cline: {
      id: 'cline',
      name: 'VS Code (Cline & Roo Code)',
      category: 'VS Code Eklentisi',
      badge: 'Otonom',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'VS Code üzerindeki Cline veya Roo Code otonom ajanına tam sistem yetkileri verin.',
      filePath: 'VS Code -> Cline Settings -> MCP Servers -> Add Server',
      setupSteps: [
        'VS Code sol çubuğundaki Cline ikonuna tıklayın.',
        'Üstteki Dişli (Settings) ikonundan "MCP Servers" sekmesine geçin.',
        '"Add Server" seçip aşağıdaki konfigürasyonu yapıştırın.'
      ],
      configJson: JSON.stringify(
        {
          mcpServers: {
            "onyx-nexus": {
              command: "python3",
              args: ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"],
              disabled: false,
              autoApprove: ["fs_read_file", "fs_list_dir", "db_fts_search"]
            }
          }
        },
        null,
        2
      )
    },
    windsurf: {
      id: 'windsurf',
      name: 'Windsurf IDE (Codeium)',
      category: 'AI IDE',
      badge: 'Cascade',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Windsurf Cascade motoru ile ONYX-Nexus araçlarını eşzamanlı kullanın.',
      filePath: '~/.codeium/windsurf/mcp_config.json',
      setupSteps: [
        'Windsurf ayarlarından Cascade veya MCP bölümünü açın.',
        '~/.codeium/windsurf/mcp_config.json dosyasına aşağıdaki bloğu yerleştirin.'
      ],
      configJson: JSON.stringify(
        {
          mcpServers: {
            "onyx-nexus": {
              command: "python3",
              args: ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"]
            }
          }
        },
        null,
        2
      )
    },
    librechat: {
      id: 'librechat',
      name: 'LibreChat',
      category: 'Web Arayüzü',
      badge: 'SSE Uyumlu',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'LibreChat açık kaynak sohbet platformuna SSE üzerinden uzaktan bağlayın.',
      filePath: 'librechat.yaml',
      setupSteps: [
        'LibreChat kurulum dizinindeki librechat.yaml dosyasını açın.',
        'mcpServers bölümüne aşağıdaki uzaktan SSE bağlantısını ekleyin.'
      ],
      configJson: `mcpServers:
  onyx_nexus:
    type: "sse"
    url: "${sseUrl}"
    chatMenu: true
    model: "gpt-4o"`
    },
    zed: {
      id: 'zed',
      name: 'Zed Editor',
      category: 'Hızlı Rust Editör',
      badge: 'Experimental',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Zed editörün yeni model context protocol desteği ile yerel entegrasyon.',
      filePath: '~/.config/zed/settings.json',
      setupSteps: [
        'Zed menüsünden "Open Settings (JSON)" seçin.',
        'Aşağıdaki "experimental.model_context_protocol" ayarını ekleyin.'
      ],
      configJson: JSON.stringify(
        {
          "experimental.model_context_protocol": {
            "servers": [
              {
                "id": "onyx-nexus",
                "command": "python3",
                "args": ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"]
              }
            ]
          }
        },
        null,
        2
      )
    },
    jetbrains: {
      id: 'jetbrains',
      name: 'JetBrains IDEs',
      category: 'IntelliJ / PyCharm',
      badge: 'Plugin',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      description: 'PyCharm, WebStorm ve IntelliJ için Model Context Protocol eklenti ayarı.',
      filePath: 'Settings -> Tools -> Model Context Protocol',
      setupSteps: [
        'JetBrains Marketplace üzerinden "Model Context Protocol" eklentisini kurun.',
        'Eklenti ayarlarına aşağıdaki stdio veya SSE sunucu adresini tanımlayın.'
      ],
      configJson: JSON.stringify(
        {
          name: "onyx-nexus",
          transport: "stdio",
          command: "python3",
          args: ["/Users/USERNAME/ONYX-Nexus/mega_mcp_server.py"]
        },
        null,
        2
      )
    },
    langchain: {
      id: 'langchain',
      name: 'LangChain & LlamaIndex',
      category: 'Python & TS SDK',
      badge: 'Agent SDK',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Kendi Python veya TypeScript ajanlarınızdan 36+ aracı doğrudan çağırın.',
      filePath: 'mcp_client.py',
      setupSteps: [
        'Python ortamınızda pip install langchain-mcp-adapters mcp komutunu çalıştırın.',
        'Aşağıdaki istemci kodunu projenize dahil edin.'
      ],
      configJson: `from langchain_community.tools import MCPClient

# ONYX-Nexus JSON-RPC Gateway
client = MCPClient(url="${rpcUrl}")
tools = client.get_tools()

print(f"Loaded {len(tools)} tools from ONYX-Nexus MCP:")
for t in tools:
    print(f" - {t.name}: {t.description}")`
    }
  };

  const executeToolTest = async () => {
    setIsRunningTool(true);
    try {
      const res = await fetch('/api/mcp/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: testTool,
            arguments: { path: '.', query: 'swarm' }
          }
        })
      });
      const data = await res.json();
      setToolResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setToolResult(`Hata: ${e.message}`);
    } finally {
      setIsRunningTool(false);
    }
  };

  const activeConf = clientConfigs[activeClient] || clientConfigs.cursor;

  const downloadConfigFile = () => {
    const blob = new Blob([activeConf.configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeConf.id === 'librechat' ? 'librechat.yaml' : `${activeConf.id}_mcp_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="h-16 bg-slate-900/90 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              UNIVERSAL MCP CONNECT HUB (36+ ARAÇ)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                8+ IDE & AI İstemcisi
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Claude Desktop, Cursor, VS Code, Windsurf ve harici LLM uygulamalarını tek tıkla sisteme bağlayın
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SSE / Stdio Hazır
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Quick Connection Endpoints Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Yerel Stdio Protokolü</span>
            <div className="mt-1 font-mono text-xs text-slate-200 truncate">
              python3 mega_mcp_server.py
            </div>
            <span className="text-[10px] text-emerald-400 font-mono mt-1">36 Araç • Sıfır Gecikme</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Uzak SSE Canlı Akışı</span>
            <div className="mt-1 font-mono text-xs text-cyan-400 truncate">
              {sseUrl}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Server-Sent Events • Bulut & Web</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">JSON-RPC 2.0 Ağ Geçidi</span>
            <div className="mt-1 font-mono text-xs text-purple-400 truncate">
              {rpcUrl}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Standart MCP 2024-11-05 Protokolü</span>
          </div>
        </div>

        {/* Client Selection Tabs */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3">
            Bağlanmak İstediğiniz Uygulamayı Seçin:
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.values(clientConfigs).map((conf) => {
              const isSelected = activeClient === conf.id;
              return (
                <button
                  key={conf.id}
                  onClick={() => setActiveClient(conf.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-purple-500/50 shadow-md shadow-purple-500/10 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Laptop className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${conf.badgeColor}`}>
                      {conf.badge}
                    </span>
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-200">{conf.name}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{conf.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Client Configuration Detail Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{activeConf.name} Entegrasyon Rehberi</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeConf.badgeColor}`}>
                  {activeConf.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeConf.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadConfigFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition"
              >
                <Download className="w-3.5 h-3.5" />
                İndir
              </button>
              <button
                onClick={() => handleCopy(activeConf.configJson, activeConf.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition shadow-md shadow-purple-600/20"
              >
                {copiedKey === activeConf.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === activeConf.id ? 'Kopyalandı!' : 'Konfigürasyonu Kopyala'}
              </button>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 font-mono">Kurulum Adımları:</span>
            <div className="space-y-1.5">
              {activeConf.setupSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target File Path */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 truncate mr-2">
              <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-slate-500">Konfigürasyon Dosyası:</span>
              <span className="text-slate-300 truncate">{activeConf.filePath}</span>
            </div>
            <button
              onClick={() => handleCopy(activeConf.filePath, 'path')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 transition"
              title="Yolu Kopyala"
            >
              {copiedKey === 'path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-72 leading-relaxed">
              {activeConf.configJson}
            </pre>
          </div>
        </div>

        {/* Live MCP Tool Tester */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Canlı MCP Araç Yürütücüsü & Test Konsolu
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                36 araçtan birini seçerek JSON-RPC üzerinden canlı yanıt testini çalıştırın.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={testTool}
                onChange={(e) => setTestTool(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="fs_list_dir">fs_list_dir (Dizin Listeleme)</option>
                <option value="fs_read_file">fs_read_file (Dosya Okuma)</option>
                <option value="db_fts_search">db_fts_search (Hafıza Araması)</option>
                <option value="polyglot_compile">polyglot_compile (Derleyici)</option>
                <option value="system_info">system_info (Sistem Bilgisi)</option>
              </select>

              <button
                onClick={executeToolTest}
                disabled={isRunningTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs transition"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunningTool ? 'Çalıştırılıyor...' : 'Aracı Test Et'}
              </button>
            </div>
          </div>

          {toolResult && (
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
                {toolResult}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
