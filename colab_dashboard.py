"""
Onyx-Nexus Colab & Cloudflare Dashboard UI Renderer
Provides a lightweight, modern web interface served directly by FastAPI.
Features autonomous standalone server controls, background task queue,
CrewAI and LangChain orchestration, live SSE streaming, and 1-click ZIP downloads.
"""

from typing import Dict, Any

def render_colab_dashboard(stats: Dict[str, Any]) -> str:
    ram = stats.get("ram", {})
    total_ram = ram.get("total_gb", 20.0)
    used_ram = ram.get("used_gb", 1.2)
    free_ram = ram.get("available_gb", 18.8)
    ram_pct = ram.get("percent", 6.0)

    gpu = stats.get("gpu", "None")
    cpu_cores = stats.get("cpu_cores", 2)
    engine = stats.get("engine", "colab").upper()
    tunnel_url = stats.get("cloudflare_url") or "Aktif (Tünel)"
    providers = stats.get("providers", ["Pollinations DeepSeek", "Pollinations OpenAI", "DuckDuckGo Search"])
    frameworks = stats.get("frameworks", {})
    crewai_ready = frameworks.get("crewai_available", False)
    langchain_ready = frameworks.get("langchain_available", False)
    workspace_dir = stats.get("workspace_dir", "/content/workspace")
    active_tasks = stats.get("active_tasks", 0)

    crewai_badge = '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">CrewAI: Hazır (3 Ajan)</span>' if crewai_ready else '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">CrewAI: Yüklenebilir</span>'
    langchain_badge = '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">LangChain: Hazır</span>' if langchain_ready else '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">LangChain: Yüklenebilir</span>'

    providers_pills = "".join([
        f'<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">{p}</span>'
        for p in providers
    ])

    return f"""<!DOCTYPE html>
<html lang="tr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onyx-Nexus | Colab 20GB RAM Otonom Sunucu &amp; Ajan Konsolu</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {{
      darkMode: 'class',
      theme: {{
        extend: {{
          fontFamily: {{
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }},
          colors: {{
            brand: {{
              50: '#ecfdf5',
              500: '#10b981',
              600: '#059669',
              900: '#064e3b',
              950: '#022c22',
            }}
          }}
        }}
      }}
    }}
  </script>
  <style>
    body {{
      background-color: #050811;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }}
    .glow-border {{
      box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.15);
    }}
    pre code {{
      font-family: 'JetBrains Mono', monospace;
    }}
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">
  <!-- Üst Başlık Çubuğu -->
  <header class="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
          Ω
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-mono font-bold text-sm text-slate-100 tracking-tight">ONYX-NEXUS</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Otonom Sunucu (20GB RAM)</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">Cloudflare Tunnel</span>
          </div>
          <p class="text-[11px] text-slate-400 font-mono truncate">CrewAI &amp; LangChain Bağımsız Sunucu ve Görev Kuyruğu</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-300">RAM: <span id="header-ram" class="text-emerald-400 font-bold">{total_ram} GB</span></span>
        </div>
        <button onclick="runDiagnostics()" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition flex items-center space-x-1.5 shadow-sm">
          <span>⚡ Teşhis Testi</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Ana İçerik -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- 1. Donanım & Çerçeve Telemetri Paneli -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg glow-border">
        <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
          <span>COLAB RAM BELLEĞİ</span>
          <span class="text-emerald-400">%{ram_pct} Dolu</span>
        </div>
        <div class="text-2xl font-bold font-mono text-white tracking-tight">{total_ram} <span class="text-sm font-normal text-slate-400">GB</span></div>
        <div class="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
          <div class="bg-emerald-500 h-1.5 rounded-full" style="width: {ram_pct}%"></div>
        </div>
        <div class="text-[11px] text-slate-400 font-mono mt-2 flex justify-between">
          <span>Kullanılan: {used_ram} GB</span>
          <span>Boş: {free_ram} GB</span>
        </div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-slate-400 text-xs font-mono mb-1">AJAN MİMARİSİ</div>
        <div class="flex flex-col gap-1.5 mt-1">
          <div>{crewai_badge}</div>
          <div>{langchain_badge}</div>
        </div>
        <div class="text-[11px] text-slate-400 font-mono mt-2">Çalışma Alanı: {workspace_dir}</div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-slate-400 text-xs font-mono mb-1">LLM HAVUZU (0 KEY)</div>
        <div class="text-base font-bold font-mono text-emerald-400">Awesome-FreeLLM</div>
        <div class="text-xs text-slate-400 mt-1">Pollinations DeepSeek / OpenAI</div>
        <div class="text-[11px] text-cyan-400 font-mono mt-2">DuckDuckGo Canlı Arama Aktif</div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-slate-400 text-xs font-mono mb-1">CLOUDFLARE TÜNELİ</div>
        <div class="text-sm font-bold font-mono text-indigo-400 truncate" id="tunnel-display-text">HTTPS Güvenli</div>
        <div class="text-xs text-slate-400 font-mono mt-1">trycloudflare.com</div>
        <button onclick="copyOpenWebUISettings()" class="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center space-x-1 underline">
          <span>WebUI Ayarlarını Kopyala</span>
        </button>
      </div>
    </div>

    <!-- 2. OTONOM BAĞIMSIZ SUNUCU: GÖREV BAŞLATMA & KUYRUK YÖNETİMİ -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-emerald-500/30 rounded-xl p-6 shadow-xl space-y-5">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">BAĞIMSIZ SUNUCU</span>
            <span class="text-xs font-bold text-white font-mono">⚡ Otonom Görev Yöneticisi</span>
          </div>
          <p class="text-xs text-slate-300 mt-1">Colab 20GB RAM üzerinde arka planda bağımsız çalışan CrewAI, LangChain veya yerel çoklu ajan görevleri başlatın ve çıktıları ZIP olarak indirin.</p>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="installFrameworks()" id="btn-install-frameworks" class="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-mono text-xs font-semibold transition border border-indigo-500/40 flex items-center space-x-1.5">
            <span>📦 CrewAI &amp; LangChain Kur</span>
          </button>
          <button onclick="loadTasks()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition border border-slate-700 flex items-center space-x-1">
            <span>🔄 Kuyruğu Yenile</span>
          </button>
        </div>
      </div>

      <!-- Görev Formu -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-3 space-y-2">
          <textarea id="task-prompt-input" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" placeholder="Otonom görev istemini yazın (Örn: 'Python ile FastAPI tabanlı bir görev yöneticisi mikroservisi yaz, birim testlerini hazırla ve çalıştır')..."></textarea>
          
          <div class="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span>Hızlı İstem:</span>
            <button type="button" onclick="setTaskPrompt('Python ile asenkron web kazıyıcı yaz ve sonuçları JSON olarak kaydet.')" class="hover:text-emerald-400 underline">Web Kazıyıcı</button>
            <span>•</span>
            <button type="button" onclick="setTaskPrompt('C++ ile yüksek performanslı matris çarpımı algoritması yaz, kıyasla ve doğrula.')" class="hover:text-emerald-400 underline">C++ Algoritması</button>
            <span>•</span>
            <button type="button" onclick="setTaskPrompt('Linux sistem durumunu izleyen, RAM ve CPU tepe noktalarını kaydeden bir Bash betiği hazırla.')" class="hover:text-emerald-400 underline">Bash Monitör</button>
          </div>
        </div>

        <div class="space-y-3 flex flex-col justify-between">
          <div>
            <label class="block text-[11px] font-mono text-slate-400 mb-1">Yürütücü Motor:</label>
            <select id="task-engine-select" class="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 outline-none">
              <option value="auto">🤖 Otomatik (CrewAI / LangChain)</option>
              <option value="crewai">👥 CrewAI Takımı (Mimar+Geliştirici+QA)</option>
              <option value="langchain">🔗 LangChain Akıl Yürütme Zinciri</option>
              <option value="native">⚡ Onyx Doğal Hızlı Motor</option>
            </select>
          </div>

          <button id="btn-submit-task" onclick="submitAutonomousTask()" class="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg">
            <span>🚀 Görevi Başlat</span>
            <span>▶</span>
          </button>
        </div>
      </div>

      <!-- Canlı Görev Tablosu / Kuyruğu -->
      <div class="mt-4 border-t border-slate-800 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
            <span>📂 Çalışma Alanı Görevleri &amp; İndirme Masası</span>
            <span id="active-task-badge" class="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">{active_tasks} Aktif</span>
          </h4>
          <span class="text-[11px] font-mono text-slate-500">Her görev kendi izole klasörüne kaydedilir</span>
        </div>

        <div id="task-list-container" class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          <div class="text-xs font-mono text-slate-500 py-4 text-center">Görev kuyruğu yükleniyor...</div>
        </div>
      </div>
    </div>

    <!-- 3. Open WebUI Hızlı Bağlantı Kartı -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">OPEN WEBUI KÖPRÜSÜ</span>
            <span class="text-xs text-slate-400 font-mono">OpenAI /v1 Uyumlu</span>
          </div>
          <h3 class="text-base font-bold text-white mt-1">Colab Sunucunuzu Open WebUI'a Bağlayın</h3>
          <p class="text-xs text-slate-300 mt-0.5">Open WebUI → Ayarlar → Bağlantılar → OpenAI API sekmesine aşağıdaki bilgileri girin:</p>
        </div>
        <button onclick="copyOpenWebUISettings()" id="btn-copy-webui" class="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold transition flex items-center space-x-2 shadow-lg whitespace-nowrap">
          <span>📋 Bağlantı Bilgilerini Kopyala</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 font-mono text-xs">
        <div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800">
          <div class="text-[10px] text-slate-400">API BASE URL</div>
          <div class="text-emerald-400 font-semibold truncate select-all mt-1" id="val-base-url">https://.../v1</div>
        </div>
        <div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800">
          <div class="text-[10px] text-slate-400">API KEY</div>
          <div class="text-amber-400 font-semibold select-all mt-1">onyx-nexus-colab</div>
        </div>
        <div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800">
          <div class="text-[10px] text-slate-400">MODEL</div>
          <div class="text-cyan-400 font-semibold select-all mt-1">onyx-nexus-agent</div>
        </div>
      </div>
    </div>

    <!-- 4. Canlı Ajan Akış Konsolu (SSE Interactive Playground) -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center space-x-2">
            <span>🚀 Canlı Sohbet Konsolu</span>
            <span class="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">SSE Akış</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">Doğrudan tarayıcınızdan SSE akışıyla akıl yürütme adımlarını (&lt;thought&gt;) izleyin.</p>
        </div>

        <div class="flex items-center space-x-2">
          <select id="agent-model-select" class="bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none">
            <option value="onyx-nexus-agent">onyx-nexus-agent (Auto)</option>
            <option value="onyx-nexus-crewai">onyx-nexus-crewai (CrewAI Team)</option>
            <option value="onyx-nexus-langchain">onyx-nexus-langchain (Chain)</option>
            <option value="onyx-nexus-colab">onyx-nexus-colab (High-RAM)</option>
            <option value="onyx-nexus-deepseek">onyx-nexus-deepseek (Reasoning)</option>
          </select>
        </div>
      </div>

      <!-- İstem Giriş Alanı -->
      <div class="space-y-2">
        <textarea id="prompt-input" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" placeholder="Ajanlara doğrudan bir soru veya görev verin..."></textarea>
        <div class="flex items-center justify-between">
          <div class="text-[11px] text-slate-400 font-mono">
            Awesome-FreeLLM havuzundan otomatik yönlendirilir. API anahtarı gerekmez.
          </div>
          <button id="btn-run-agent" onclick="executeAgentPrompt()" class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center space-x-2 shadow-lg">
            <span>Çalıştır (Run)</span>
            <span>▶</span>
          </button>
        </div>
      </div>

      <!-- Canlı Akış Çıktı Alanı -->
      <div id="output-container" class="hidden space-y-3 pt-2">
        <details id="thought-details" open class="bg-slate-950 rounded-lg border border-purple-500/30 overflow-hidden">
          <summary class="px-4 py-2.5 bg-purple-950/30 text-purple-300 text-xs font-mono font-semibold cursor-pointer flex items-center justify-between select-none">
            <span class="flex items-center space-x-2">
              <span id="thought-spinner" class="animate-spin inline-block w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full"></span>
              <span>Canlı Akıl Yürütme Süreci (&lt;thought&gt;)</span>
            </span>
            <span class="text-[10px] text-purple-400">Open WebUI Uyumlu</span>
          </summary>
          <div id="thought-content" class="p-4 text-xs font-mono text-purple-200/90 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            Ajan başlatılıyor...
          </div>
        </details>

        <div class="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-mono font-bold text-emerald-400">Çalıştırma Raporu &amp; Kod Doğrulama</span>
            <button onclick="copyOutput()" class="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition">Kopyala</button>
          </div>
          <div id="final-report-content" class="text-xs font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-96 overflow-y-auto">
            (Sonuç bekleniyor...)
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Bellek & Geçmiş Görevler (SQLite FTS5) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white">💾 SQLite FTS5 Hafıza Günlüğü</h3>
            <p class="text-[11px] text-slate-400">WAL modunda çalışan, RAM tüketmeyen kalıcı görev belleği.</p>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="loadMemory()" class="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-950 rounded border border-slate-800">Yenile</button>
            <button onclick="clearMemory()" class="text-xs font-mono text-rose-400 hover:text-rose-300 px-2 py-1 bg-slate-950 rounded border border-slate-800">Temizle</button>
          </div>
        </div>

        <div id="memory-list" class="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div class="text-xs font-mono text-slate-500 py-3 text-center">Yükleniyor...</div>
        </div>
      </div>

      <!-- Colab Kesilme Önleyici -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white flex items-center space-x-1.5">
            <span>🛡️ Colab Kesilme Önleyici</span>
          </h3>
          <p class="text-[11px] text-slate-400 mt-1">Google Colab oturumunu açık tutmak için tarayıcı konsoluna (F12) yapıştırın:</p>
        </div>

        <div class="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 overflow-x-auto select-all">
          function KeepAlive(){{console.log("Colab canlı");document.querySelector("colab-connect-button")?.click()}}setInterval(KeepAlive,60000)
        </div>

        <button onclick="copyKeepAlive()" class="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition border border-slate-700/80">
          📋 Kodu Kopyala
        </button>

        <div class="border-t border-slate-800 pt-3">
          <div class="text-[11px] text-slate-400 font-mono">
            <strong>Otonom Mod:</strong> Görevler arka planda çalışır ve tamamlandığında doğrudan indirilebilir.
          </div>
        </div>
      </div>
    </div>

  </main>

  <footer class="border-t border-slate-800/80 bg-slate-950 py-4 text-xs font-mono text-slate-500 text-center">
    Onyx-Nexus Engine • Google Colab 20GB RAM &amp; Cloudflare Tunnel Edition • CrewAI &amp; LangChain Standalone Server
  </footer>

  <script>
    const currentOrigin = window.location.origin;
    const apiUrl = currentOrigin + '/v1';
    document.getElementById('val-base-url').innerText = apiUrl;
    document.getElementById('tunnel-display-text').innerText = window.location.hostname;

    function setPrompt(text) {{
      document.getElementById('prompt-input').value = text;
    }}

    function setTaskPrompt(text) {{
      document.getElementById('task-prompt-input').value = text;
    }}

    function copyOpenWebUISettings() {{
      const text = `API Base URL: ${{apiUrl}}\\nAPI Key: onyx-nexus-colab\\nModel: onyx-nexus-agent`;
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('btn-copy-webui');
      btn.innerText = '✓ Kopyalandı!';
      setTimeout(() => {{ btn.innerText = '📋 Bağlantı Bilgilerini Kopyala'; }}, 2000);
    }}

    function copyKeepAlive() {{
      const code = 'function KeepAlive(){{console.log("Colab canlı");document.querySelector("colab-connect-button")?.click()}}setInterval(KeepAlive,60000)';
      navigator.clipboard.writeText(code);
      alert('Colab Keep-Alive kodu kopyalandı! Colab sekmesinde F12 -> Console sekmesine yapıştırıp Enter tuşuna basın.');
    }}

    function copyOutput() {{
      const text = document.getElementById('final-report-content').innerText;
      navigator.clipboard.writeText(text);
      alert('Çıktı panoya kopyalandı!');
    }}

    // 1. Otonom Görev Gönderme
    async function submitAutonomousTask() {{
      const prompt = document.getElementById('task-prompt-input').value.trim();
      if (!prompt) return alert('Lütfen otonom görev için bir istem yazın.');

      const engine = document.getElementById('task-engine-select').value;
      const btn = document.getElementById('btn-submit-task');
      btn.disabled = true;
      btn.innerHTML = '<span>Kuyruğa Alınıyor...</span>';

      try {{
        const res = await fetch('/api/tasks/submit', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{ prompt: prompt, engine: engine }})
        }});
        if (!res.ok) throw new Error('Görev kuyruğa alınamadı');
        document.getElementById('task-prompt-input').value = '';
        loadTasks();
      }} catch (err) {{
        alert('Hata: ' + err.message);
      }} finally {{
        btn.disabled = false;
        btn.innerHTML = '<span>🚀 Görevi Başlat</span> <span>▶</span>';
      }}
    }}

    // 2. Görev Listesini Yükleme
    async function loadTasks() {{
      const container = document.getElementById('task-list-container');
      try {{
        const res = await fetch('/api/tasks');
        const tasks = await res.json();
        if (!tasks || tasks.length === 0) {{
          container.innerHTML = '<div class="text-xs font-mono text-slate-500 py-3 text-center">Henüz kuyrukta veya tamamlanmış görev yok.</div>';
          return;
        }}

        const activeCount = tasks.filter(t => t.status === 'QUEUED' || t.status === 'RUNNING').length;
        document.getElementById('active-task-badge').innerText = activeCount + ' Aktif';

        container.innerHTML = tasks.map(t => {{
          let statusBadge = '';
          if (t.status === 'COMPLETED') {{
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">COMPLETED</span>';
          }} else if (t.status === 'RUNNING') {{
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">RUNNING</span>';
          }} else if (t.status === 'QUEUED') {{
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">QUEUED</span>';
          }} else {{
            statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">FAILED</span>';
          }}

          const filesCount = t.files ? t.files.length : 0;
          const downloadBtn = t.status === 'COMPLETED' 
            ? `<a href="/api/tasks/${{t.id}}/download" download class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold transition flex items-center space-x-1 shadow">
                 <span>📦 ZIP İndir</span>
               </a>` 
            : '';

          return `
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-slate-200">${{t.id}}</span>
                  ${{statusBadge}}
                  <span class="text-[10px] text-slate-400">Motor: ${{t.engine}}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] text-slate-500">${{t.created_at}}</span>
                  ${{downloadBtn}}
                </div>
              </div>
              <div class="text-slate-300 font-sans text-xs truncate">
                ${{t.prompt}}
              </div>
              ${{t.thought ? `<div class="text-[11px] text-purple-300/90 truncate">💡 ${{t.thought}}</div>` : ''}}
              ${{filesCount > 0 ? `<div class="text-[10px] text-cyan-400">📁 Dosyalar: ${{t.files.map(f => f.name).join(', ')}}</div>` : ''}}
            </div>
          `;
        }}).join('');

      }} catch (e) {{
        container.innerHTML = '<div class="text-xs font-mono text-slate-500 py-3 text-center">Görevler alınamadı.</div>';
      }}
    }}

    // 3. Framework Yükleme
    async function installFrameworks() {{
      const btn = document.getElementById('btn-install-frameworks');
      btn.disabled = true;
      btn.innerText = '⏳ Kuruluyor...';
      try {{
        const res = await fetch('/api/frameworks/install', {{ method: 'POST' }});
        const data = await res.json();
        alert('CrewAI & LangChain arka plan kurulumu başlatıldı! Birkaç dakika içinde hazır olacaktır.');
      }} catch (e) {{
        alert('Kurulum tetiklenemedi: ' + e.message);
      }} finally {{
        setTimeout(() => {{
          btn.disabled = false;
          btn.innerText = '📦 CrewAI & LangChain Kur';
        }}, 5000);
      }}
    }}

    // 4. Canlı Ajan Akışı (SSE)
    async function executeAgentPrompt() {{
      const prompt = document.getElementById('prompt-input').value.trim();
      if (!prompt) return alert('Lütfen bir görev veya soru yazın.');

      const model = document.getElementById('agent-model-select').value;
      const btn = document.getElementById('btn-run-agent');
      const outContainer = document.getElementById('output-container');
      const thoughtContent = document.getElementById('thought-content');
      const thoughtSpinner = document.getElementById('thought-spinner');
      const finalReport = document.getElementById('final-report-content');

      btn.disabled = true;
      btn.innerHTML = '<span>Çalışıyor...</span> <span class="animate-spin">⏳</span>';
      outContainer.classList.remove('hidden');
      thoughtContent.innerText = '';
      thoughtSpinner.classList.remove('hidden');
      finalReport.innerText = 'Orkestratör görev üzerinde çalışıyor...';

      try {{
        const response = await fetch('/v1/chat/completions', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            model: model,
            messages: [{{ role: 'user', content: prompt }}],
            stream: true
          }})
        }});

        if (!response.ok) throw new Error('API Hatası: ' + response.statusText);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullOutput = '';

        while (true) {{
          const {{ done, value }} = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, {{ stream: true }});
          const lines = chunk.split('\\n');

          for (const line of lines) {{
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {{
              try {{
                const json = JSON.parse(line.slice(6));
                const delta = json.choices[0]?.delta?.content || '';
                fullOutput += delta;

                if (fullOutput.includes('<thought>') && !fullOutput.includes('</thought>')) {{
                  const tStart = fullOutput.indexOf('<thought>') + 9;
                  thoughtContent.innerText = fullOutput.substring(tStart);
                }} else if (fullOutput.includes('</thought>')) {{
                  const tStart = fullOutput.indexOf('<thought>') + 9;
                  const tEnd = fullOutput.indexOf('</thought>');
                  thoughtContent.innerText = fullOutput.substring(tStart, tEnd);
                  thoughtSpinner.classList.add('hidden');
                  finalReport.innerText = fullOutput.substring(tEnd + 10).trim();
                }} else {{
                  finalReport.innerText = fullOutput;
                }}
              }} catch (e) {{}}
            }}
          }}
        }}

        thoughtSpinner.classList.add('hidden');
      }} catch (err) {{
        finalReport.innerText = 'Hata oluştu: ' + err.message;
        thoughtSpinner.classList.add('hidden');
      }} finally {{
        btn.disabled = false;
        btn.innerHTML = '<span>Çalıştır (Run)</span> <span>▶</span>';
        loadMemory();
        loadTasks();
      }}
    }}

    // 5. Bellek Yükleme
    async function loadMemory() {{
      const list = document.getElementById('memory-list');
      try {{
        const res = await fetch('/api/memory');
        const data = await res.json();
        if (!data || data.length === 0) {{
          list.innerHTML = '<div class="text-xs font-mono text-slate-500 py-3 text-center">Henüz kayıtlı görev yok.</div>';
          return;
        }}
        list.innerHTML = data.map(item => `
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
            <div class="truncate max-w-[70%]">
              <span class="${{item.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}} font-bold mr-1.5">[${{item.status}}]</span>
              <span class="text-slate-300 font-semibold">${{item.prompt}}</span>
            </div>
            <div class="text-[10px] text-slate-500 whitespace-nowrap">${{item.engine}}</div>
          </div>
        `).join('');
      }} catch (e) {{
        list.innerHTML = '<div class="text-xs font-mono text-slate-500 py-3 text-center">Hafıza yüklenemedi.</div>';
      }}
    }}

    async function clearMemory() {{
      if (!confirm('Tüm görev hafızasını temizlemek istediğinize emin misiniz?')) return;
      await fetch('/api/memory/clear', {{ method: 'POST' }});
      loadMemory();
    }}

    async function runDiagnostics() {{
      alert('Sistem teşhisi başlatılıyor... Lütfen bekleyin.');
      try {{
        const res = await fetch('/api/test', {{ method: 'POST' }});
        const data = await res.json();
        alert(`Teşhis Tamamlandı!\\n\\n• LLM Havuzu: ${{data.llm_status}}\\n• Colab Yerel Sandbox: ${{data.sandbox_status}}\\n• SQLite FTS5 Bellek: ${{data.memory_status}}\\n• Toplam Süre: ${{data.latency_ms}}ms`);
      }} catch (e) {{
        alert('Teşhis sırasında hata oluştu: ' + e.message);
      }}
    }}

    // İlk açılış & periyodik yenileme
    loadMemory();
    loadTasks();
    setInterval(loadTasks, 6000);
  </script>
</body>
</html>
"""
