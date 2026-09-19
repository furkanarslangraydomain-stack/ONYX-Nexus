import MAIN_PY_CONTENT from '../../main.py?raw';
import MEGA_MCP_SERVER_CONTENT from '../../mega_mcp_server.py?raw';
import INSTALL_SH_CONTENT from '../../install.sh?raw';
import SETUP_SH_CONTENT from '../../setup.sh?raw';
import COLAB_RUNNER_CONTENT from '../../colab_runner.py?raw';
import COLAB_DASHBOARD_CONTENT from '../../colab_dashboard.py?raw';
import ONYX_NEXUS_COLAB_IPYNB from '../../onyx_nexus_colab.ipynb?raw';
import AGENT_CREW_CONTENT from '../../agent_crew.py?raw';
import REQUIREMENTS_TXT_CONTENT from '../../requirements.txt?raw';

export interface DeliverableFile {
  filename: string;
  language: string;
  title: string;
  description: string;
  tag: string;
  content: string;
}

export { SETUP_SH_CONTENT, MAIN_PY_CONTENT, INSTALL_SH_CONTENT, COLAB_RUNNER_CONTENT, COLAB_DASHBOARD_CONTENT, ONYX_NEXUS_COLAB_IPYNB, AGENT_CREW_CONTENT, REQUIREMENTS_TXT_CONTENT };

export const INTEGRATION_GUIDE_CONTENT = `# Onyx-Nexus: Google Colab (20GB RAM) & Cloudflare Entegrasyon Kılavuzu

Awesome-FreeLLM-APIs destekli, Google Colab üzerinde 20GB RAM ve Cloudflare Tunnel (HTTPS) ile sıfır API anahtarıyla çalışan, OpenAI uyumlu çoklu ajan motoru.

---

## 1. Google Colab & Cloudflare İle Tek Tıkla Başlatma (20GB RAM)

Google Colab, ücretsiz olarak **20 GB RAM**, çok çekirdekli Intel Xeon/AMD CPU ve T4 GPU sağlar. Cloudflare Tunnel ise Colab sunucunuzu şifreli bir \`https://xxxx.trycloudflare.com\` adresine dönüştürür.

### Colab'da Çalıştırma Adımları:
1. Google Colab'ı açın ([colab.research.google.com](https://colab.research.google.com)).
2. Yeni bir not defteri açıp aşağıdaki hücreyi yapıştırın ve çalıştırın (Play):

\`\`\`python
# 1. Gerekli kütüphaneleri yükle
!pip install -q fastapi uvicorn httpx pydantic

# 2. Onyx-Nexus Colab & Cloudflare Başlatıcısını çalıştır
!curl -sSL https://raw.githubusercontent.com/username/onyx-nexus/main/colab_runner.py | python3
\`\`\`

3. Birkaç saniye içinde terminalde yeşil kutuda Cloudflare Tünel bağlantınız belirecektir:
   \`\`\`text
   API Base URL: https://xxxx-xxxx-xxxx.trycloudflare.com/v1
   API Anahtarı: onyx-nexus-colab
   Model:        onyx-nexus-agent (veya onyx-nexus-colab)
   \`\`\`

---

## 2. Open WebUI Bağlantı Ayarları

1. Open WebUI arayüzünü açın (telefonunuzda veya bilgisayarınızda).
2. **Yönetici Paneli → Ayarlar → Bağlantılar → OpenAI API** yolunu izleyin.
3. Ayarları girin:
   - **API Base URL**: \`https://<SENIN_TÜNEL_ADRESIN>.trycloudflare.com/v1\`
   - **API Anahtarı**: \`onyx-nexus-colab\`
4. Doğrula simgesine tıklayın (\`onyx-nexus-agent\` ve \`onyx-nexus-colab\` modelleri listelenir).
5. **Kaydet**'e basın.

---

## 3. SSE Canlı Düşünce Akışı (<thought>)
Open WebUI, Onyx-Nexus'tan gelen akıl yürütme adımlarını katlanabilir **Düşünce Süreci (Thinking)** akordeonunda canlı olarak gösterir:
- **Tasarımcı Ajan**: Mimari plan ve algoritma tasarımı
- **Web Arama**: DuckDuckGo Canlı HTML Ajanı (Sıfır Maliyet)
- **Geliştirici & Onarım**: 20GB RAM'li Colab sandbox'ında anında derleme ve test (≤3 Onarım Döngüsü)
- **Kalıcı Bellek**: SQLite FTS5 WAL Modu ile anında indeksleme
`;

export const ENV_EXAMPLE_CONTENT = `# ==============================================================================
# Onyx-Nexus Multi-Agent Yapılandırma Dosyası (.env)
# ==============================================================================

# 1. API Havuzu (İSTEĞE BAĞLI: Boş bırakılırsa gömülü Awesome-FreeLLM-APIs devreye girer!)
# Kullanıcıdan API anahtarı istenmez. Kendi LiteLLM havuzunuz varsa adresi yazabilirsiniz:
API_POOL_BASE_URL=""
API_POOL_KEY=""
API_POOL_MODEL="onyx-pool-auto"

# 2. Yürütme Motoru ("colab" -> 20GB RAM yerel yürütme, "piston" -> bulut sandbox)
EXECUTION_ENGINE="colab"

# 3. İsteğe Bağlı Harici Hafıza (Notion API) - Varsayılan: Yerel SQLite FTS5 (<1MB RAM)
NOTION_API_KEY=""
NOTION_DATABASE_ID=""

# 4. Ağ Yapılandırması
HOST="0.0.0.0"
PORT=8000
`;

export const DELIVERABLE_FILES: Record<string, DeliverableFile> = {
  'mega_mcp_server.py': {
    filename: 'mega_mcp_server.py',
    language: 'python',
    title: 'ONYX Mega MCP Sunucusu (36+ Yetenek)',
    description: '36 adet otonom MCP aracı içeren Model Context Protocol (v2.5) sunucusu: Dosya işlemleri, SQLite FTS5, DuckDuckGo, izole sandbox ve Git entegrasyonu.',
    tag: 'Mega MCP Server',
    content: MEGA_MCP_SERVER_CONTENT,
  },
  'agent_crew.py': {
    filename: 'agent_crew.py',
    language: 'python',
    title: 'CrewAI & LangChain Ajan Motoru',
    description: '20GB RAM üzerinde çalışan CrewAI (Mimar, Geliştirici, QA Takımı) ve LangChain akıl yürütme motoru.',
    tag: 'CrewAI & LangChain',
    content: AGENT_CREW_CONTENT,
  },
  'colab_dashboard.py': {
    filename: 'colab_dashboard.py',
    language: 'python',
    title: 'Colab & Cloudflare Web Yönetim Paneli',
    description: 'Colab 20GB RAM, CPU/GPU telemetrisi, canlı akıl yürütme (<thought>) konsolu ve SQLite bellek yöneticisini barındıran yerleşik Web UI.',
    tag: 'Web UI / Dashboard',
    content: COLAB_DASHBOARD_CONTENT,
  },
  'colab_runner.py': {
    filename: 'colab_runner.py',
    language: 'python',
    title: 'Google Colab & Cloudflare Otomatik Başlatıcı',
    description: '20GB RAM donanım algılama, otomatik cloudflared tünel kurulumu, Open WebUI genel HTTPS bağlantı oluşturucu ve servis yöneticisi.',
    tag: 'Colab & Cloudflare',
    content: COLAB_RUNNER_CONTENT,
  },
  'onyx_nexus_colab.ipynb': {
    filename: 'onyx_nexus_colab.ipynb',
    language: 'json',
    title: 'Google Colab Jupyter Not Defteri',
    description: 'Doğrudan Google Colab içine yüklenebilen ve tek tıkla (Run All) 20GB RAM üzerinde Cloudflare tünelini açan Jupyter Notebook.',
    tag: 'Jupyter Notebook',
    content: ONYX_NEXUS_COLAB_IPYNB,
  },
  'main.py': {
    filename: 'main.py',
    language: 'python',
    title: 'FastAPI Onyx-Nexus Orkestratörü',
    description: '20GB RAM Colab optimizasyonu, SQLite FTS5 WAL kilitlenmesiz hafıza, SSE role-uyumlu <thought> akışı, DuckDuckGo Lite yedekli arama ve dual sandbox.',
    tag: 'Python 3 / FastAPI',
    content: MAIN_PY_CONTENT,
  },
  'requirements.txt': {
    filename: 'requirements.txt',
    language: 'text',
    title: 'Python Bağımlılıkları',
    description: 'CrewAI, LangChain, FastAPI, Uvicorn ve httpx için gerekli üretim bağımlılıkları listesi.',
    tag: 'Dependencies',
    content: REQUIREMENTS_TXT_CONTENT,
  },
  'install.sh': {
    filename: 'install.sh',
    language: 'bash',
    title: 'Tek Tıkla Otomatik Kurulum',
    description: 'Termux ve Linux ortamlarında tek tıkla bağımlılıkları, wake-lock ayarını, .env dosyasını kurup sistemi başlatan otomatik kurulum betiği.',
    tag: 'One-Click Installer',
    content: INSTALL_SH_CONTENT,
  },
  'setup.sh': {
    filename: 'setup.sh',
    language: 'bash',
    title: 'Termux Kurulum Betiği',
    description: 'Python, derleyici araçları, FastAPI, Uvicorn, httpx ve Piston/E2B desteğini Termux wake-lock ile otomatik kurar.',
    tag: 'Bash / Termux',
    content: SETUP_SH_CONTENT,
  },
  'integration_guide.md': {
    filename: 'integration_guide.md',
    language: 'markdown',
    title: 'Open WebUI & Colab Kılavuzu',
    description: 'Colab 20GB RAM, Cloudflare HTTPS tünel alma, Open WebUI bağlantı ayarları, SSE canlı düşünce akışı ve LAN testleri.',
    tag: 'Dokümantasyon',
    content: INTEGRATION_GUIDE_CONTENT,
  },
  '.env.example': {
    filename: '.env.example',
    language: 'bash',
    title: 'Ortam Değişkenleri Şablonu',
    description: 'API_POOL_BASE_URL (opsiyonel), EXECUTION_ENGINE (colab/piston), NOTION_API_KEY ve ağ yapılandırma şablonu.',
    tag: 'Yapılandırma',
    content: ENV_EXAMPLE_CONTENT,
  },
};
