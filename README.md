# 🌐 ONYX-NEXUS: Açık Kaynaklı Yapay Zeka İşletim Sistemi (AI OS) v3.0

Onyx-Nexus; tek tıkla Google Colab üzerinde 5 mikroservis düğümünü (Mesh Nodes) ayağa kaldıran, 12+ açık kaynaklı ücretsiz LLM sağlayıcısını (145+ model) dinamik olarak harmanlayan, 3 ajanlı konsensüs karar matrisi (Lead Architect, Security, QA) ile çalışan ve ürettiği kodları otomatik derleyip GitHub'a aktaran **Açık Kaynaklı ve Ücretsiz bir Otonom Yazılım Ajanı Platformudur**.

---

## ⚡ HIZLI KURULUM REHBERİ (QUICK START)

Kurulum dosyaları doğrudan GitHub depomuzda bulunmaktadır:

### 🚀 1. Tek Tıkla Google Colab Kurulumu (One-Click Colab Mesh)
Aşağıdaki linke tıklayarak Google Colab'da tek bir hücre ile 5-Düğümlü Mesh ağını ve Cloudflare genel tünelini başlatabilirsiniz:
- [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/furkanarslangraydomain-stack/ONYX-Nexus/blob/main/colab_mesh_setup.ipynb)

### 💻 2. Tek Satır Terminal / VPS Kurulumu
Linux, macOS, Termux veya bulut sunucunuzda tek bir komutla tüm bağımlılıkları kurup arka planda 5 düğümü çalıştırın:
```bash
curl -sSL https://raw.githubusercontent.com/furkanarslangraydomain-stack/ONYX-Nexus/main/setup_colab_mesh.sh | bash
```

---

## 🔥 TEMEL YETENEKLER

1. **5-Düğümlü Dağıtık Colab Mesh Kümesi:**
   - **Düğüm 1 (Port 8000):** Master Orchestrator & API Ağ Geçidi (Cloudflare Public Tüneli)
   - **Düğüm 2 (Port 8001):** Çok Dilli Polyglot Compiler Sandbox (Solidity EVM, Rust, Go, C++, Python, TS)
   - **Düğüm 3 (Port 8002):** 3-Ajanlı Konsensüs Swarm & Deep Research Karar Motoru
   - **Düğüm 4 (Port 8003):** 3D Render Studio Engine (WebGL & Three.js)
   - **Düğüm 5 (Port 8004):** Dağıtık Vektör DB & FTS5 Hub (SQLite WAL Concurrency)

2. **12+ Genişletilmiş Free LLM & API Havuzu (145+ Model):**
   - **OpenRouter Free:** Llama-3.3-70B, DeepSeek-R1, Qwen-2.5-Coder-32B, Gemini-2.0-Flash-Exp
   - **Puter.js Zero-Key AI:** Claude 3.5 Sonnet, GPT-4o, DeepSeek-Chat, Llama-3.1-70B
   - **Pollinations AI:** Limitsiz metin & görsel üretimi
   - **DuckDuckGo AI Relay:** Anonim GPT-4o-mini, Claude-3-Haiku, Llama-3.3
   - **Cloudflare Workers AI:** @cf/meta/llama-3.1, @cf/deepseek-ai/deepseek-r1
   - **HuggingFace Serverless Inference:** Topluluk modelleri
   - **Groq Cloud:** 800+ tokens/sec Llama-3.3-70B & DeepSeek-R1-Distill
   - **Awesome-Free-LLM-APIs, Cool-AI-Stuff, GPT_API_free** ve diğer açık kaynak kataloglar.

3. **3-Ajanlı Konsensüs Karar Matrisi:**
   - Baş Mimar (Lead Architect), Web3 Güvenlik Denetçisi ve QA Test Uzmanı ortak karar matrisi ile kodları analiz eder, reentrancy ve tx.origin açıklarını yakalayıp Foundry / PyTest test paketleri üretir.

4. **Otomatik GitHub CI/CD Entegrasyonu:**
   - Onaylanan ve test edilen kodları anında depoya otomatik commit & push eder.

---

## 📁 REPO DOSYA DÜZENİ

- `colab_mesh_setup.ipynb` - Google Colab tek tıkla mesh kurulum defteri.
- `setup_colab_mesh.sh` - Linux/VPS/Termux tek satırlık bash kurulum scripti.
- `main.py` - FastAPI & Mikroservis orkestratör çekirdeği.
- `test_comprehensive_v3.py` - 9/9 sistem entegrasyon ve doğrulama test paketi.
- `ARCHITECTURE.md` - Sistemin 5-node mesh ve 3-ajan konsensüs mimari şeması.
