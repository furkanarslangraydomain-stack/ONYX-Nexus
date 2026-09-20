# 🌐 ONYX-NEXUS: Otonom Yapay Zeka İşletim Sistemi (AI OS) v4.0

[![Colab Mesh](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/furkanarslangraydomain-stack/ONYX-Nexus/blob/main/colab_mesh_setup.ipynb)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Architecture: 9-Agent Swarm](https://img.shields.io/badge/Architecture-9--Agent%20Swarm-blue.svg)](#-9-uzman-ajan--swarms)
[![Zero-Knowledge Privacy](https://img.shields.io/badge/ZK--Shield-100%25%20Blind-emerald.svg)](#-zero-knowledge-privacy-shield--anti-tampering)
[![Android: Jetpack Compose](https://img.shields.io/badge/Android-Kotlin%20Compose-purple.svg)](android/README_ANDROID.md)

**ONYX-Nexus**, tek tıkla Google Colab ve yerel sunucularda 5 mikroservis düğümünü (Mesh Nodes) ayağa kaldıran, 30+ açık kaynaklı ücretsiz LLM sağlayıcısını akıllı yönlendirici ile harmanlayan, **Zero-Knowledge Gizlilik Kalkanı**, **9 Uzman Ajanlı Sürü Konsensüsü**, **Çok Dilli Sandbox Derleyicisi** ve **Google Gemini Tarzı Minimalist Arayüzü** ile donatılmış yeni nesil açık kaynaklı otonom yapay zeka işletim sistemidir.

---

## ⚡ Hızlı Başlangıç (Quick Start)

### 🚀 1. Google Colab Üzerinde 5-Hücreli Dağıtık Mesh Kurulumu
Aşağıdaki rozete tıklayarak Colab üzerinde 5 mikroservis düğümünü, sıfır maliyetli model havuzunu ve Cloudflare genel tünelini tek adımda başlatın:
- [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/furkanarslangraydomain-stack/ONYX-Nexus/blob/main/colab_mesh_setup.ipynb)

### 💻 2. Tek Komutla Linux / VPS / Termux Kurulumu
```bash
git clone https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git
cd ONYX-Nexus
pip install -r requirements.txt
python3 main.py
```

### 🔄 3. Colab Mesh Düğümlerini Senkronize Etme
```bash
python3 colab_mesh_sync.py --sync
# veya arka planda sürekli senkronizasyon için:
python3 colab_mesh_sync.py --daemon --interval 15
```

### 📱 4. Yerel Android İstemcisi (Kotlin & Jetpack Compose)
Android uygulamasını derlemek ve cihazınızda çalıştırmak için:
```bash
cd android
./gradlew assembleDebug
```
Detaylı bilgi için [Android Dokümantasyonu](android/README_ANDROID.md) sayfasına bakın.

---

## 🌟 Öne Çıkan Temel Mimari Özellikler

### 1. 🎨 Google Gemini Tarzı Sade & Odaklanmış Arayüz
- **Kozmik Koyu Tema (`#0A0D14`):** Göz yormayan derin karanlık, ince sınır çizgileri (`#1E2638`) ve Gemini camgöbeği ışıltısı (`#06B6D4`).
- **Yüzen Oval Prompt Barı:** Sayfanın altına sabitlenmiş, odaklandığında ışıyan, tek tıkla ajan ve iş akışı seçilebilen minimalist giriş alanı.
- **Hızlı Başlangıç Kartları:** Swarm Konsensüsü, Web3 Akıllı Sözleşme, ZK-Gizlilik ve Derin Araştırma için tek tıkla tetiklenebilen hazır senaryolar.
- **Modüler Stüdyo Çekmeceleri:** 3D Sahne Stüdyosu, Colab 5-Düğümlü Mesh Telemetrisi ve Universal MCP Hub.

---

### 2. 🤖 9 Uzman Ajan & Bot Ekosistemi
ONYX-Nexus monolitik bir LLM yerine, işleri uzman ajanlar arasında paylaştırır:

| Ajan | Rol | İkon | Temel Sorumluluk |
| :--- | :--- | :---: | :--- |
| **Nexus Router** | Yönlendirici | 🧭 | İstek niyetini (intent) analiz eder ve en uygun sıfır maliyetli modele yönlendirir. |
| **Master Architect** | Sistem Mimarı | 🏛️ | Modüler sistem tasarımları, FTS5 WAL şemaları ve `.md` proje planları (blueprint) üretir. |
| **Polyglot Developer** | Kod Üreticisi | 💻 | Mimari plana sadık kalarak temiz, hatasız ve optimize kod üretir (Python, TS, Rust, Go, Solidity). |
| **Sentinel (ZK-Shield)** | Gizlilik & Kalkan | 🛡️ | Dış API'lere giden hassas verileri körleştirir (blind masking) ve prompt injection ataklarını engeller. |
| **QA Runner & Sandbox** | Test & Auto-Repair | 🧪 | Kodu izole sandbox içinde derler/çalıştırır, hata çıkarsa 3 döngüde otomatik onarır. |
| **Deep Scholar** | Derin Araştırmacı | 🔬 | Web, Wikipedia ve API dokümantasyonlarından kanıta dayalı halüsinasyonsuz sentez raporları derler. |
| **Web3 Auditor** | Akıllı Sözleşme | ⛓️ | Reentrancy, tx.origin, integer overflow açıklarını tarar ve gas optimizasyonunu doğrular. |
| **Auto-Git & DevOps** | Sürüm Yöneticisi | 🚀 | Testleri geçen onaylı kodları doğrudan GitHub deposuna anında commit ve push eder. |
| **Notion Reporter** | Telemetri & Rapor | 📝 | Oturum kararlarını, test metriklerini ve sistem loglarını kalıcı veritabanına aktarır. |

---

### 3. ⚡ 5 Otonom İş Akışı (Autonomous Workflows)
1. **Dual-Stage CoT Akışı:** Planlama ve kod üretimini ayıran 2 aşamalı düşünce zinciri (Mimar Blueprint → Geliştirici Kod → QA Doğrulama).
2. **3-Ajanlı Swarm Konsensüsü:** Architect, Coder ve Reviewer ajanlarının bağımsız analiz yapıp ağırlıklı oylama ile konsensüse varması.
3. **Sandbox & Auto-Repair Döngüsü:** Kodun E2B/yerel alt işlemde test edilip, derleme hatası durumunda kendi kendini onarması.
4. **Otonom Derin Araştırma:** Çok kaynaklı arama motoru ve Wikipedia taraması ile kanıta dayalı rapor üretimi.
5. **Zero-Knowledge Gizlilik Kalkanı:** Hassas anahtar ve cüzdanların yerelde maskelenip, dış yanıtın istemcide deşifre edilmesi.

---

### 4. 🛡️ Zero-Knowledge Privacy Shield & Anti-Tampering
- **%100 API Blindness:** API anahtarları (`sk-...`, `AIzaSy...`), kripto cüzdanları (`0x...`), e-postalar ve IP adresleri dış LLM sağlayıcılarına gönderilmeden önce deterministik ZK token'ları ile maskelenir (`<MASKED_SECRET_X>`).
- **Yerel De-Maskeleme:** Dış sağlayıcıdan dönen yanıt yalnızca kullanıcının yerel istemcisinde çözülür.
- **Anti-Tampering:** SHA-256 tabanlı HMAC mühürleri ile dış müdahaleler ve prompt injection denemeleri anında engellenir.

---

### 5. 🌐 5-Düğümlü Colab Mesh Ağı & Senkronizasyon
Colab veya çoklu sunucularda çalışan mikroservis mimarisi:
- **Düğüm 1 (Port 8000):** Master Orchestrator & Cloudflare Public Gateway
- **Düğüm 2 (Port 8001):** Polyglot Compiler Sandbox (EVM, Rust, Go, Python, TS)
- **Düğüm 3 (Port 8002):** Consensus Swarm & Deep Research Karar Motoru
- **Düğüm 4 (Port 8003):** 3D Render Studio Engine (Three.js & WebGL)
- **Düğüm 5 (Port 8004):** Distributed Vector DB & FTS5 Hub (SQLite WAL Modu)

`colab_mesh_sync.py` aracı tüm bu düğümler arasındaki bellek, durum ve tünel bağlantılarını canlı senkronize eder.

---

### 6. 🔌 Universal MCP Hub (Model Context Protocol)
ONYX-Nexus; **Cursor**, **Claude Desktop**, **VS Code** ve **Windsurf** gibi geliştirici araçlarına doğrudan bağlanabilen standart bir MCP JSON-RPC sunucusudur. Dosya sistemi işlemleri, SQLite FTS5 sorguları, Web taraması ve Git komutları doğrudan IDE içerisinden çalıştırılabilir.

---

## 🧪 Test & Sistem Doğrulaması

Kapsamlı stres ve dayanıklılık test paketini çalıştırmak için:
```bash
python3 test_advanced_stress_and_health.py
```
**Test Kapsamı (9/9 Geçti):**
- SQLite FTS5 WAL Concurrency (2200+ IOPS)
- 40 Paralel Swarm Konsensüs Matrisi (0.02 ms/karar)
- Context Compactor (%84.2 Token Tasarrufu)
- Model Router Failover (17+ sağlayıcı)
- 5 Dilde AST ve Sandbox Derlemesi
- Mega MCP 36+ Araç Yürütme
- 5-Düğümlü Mesh Ping & Telemetri
- Sentetik Bilinç (SCP-01) Homeostazis
- Zero-Knowledge Kalkanı & HMAC Doğrulaması

---

## 📄 Dokümantasyon Dizini

- [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) - 9 Ajanın detaylı sistem talimatları ve sürü matrisi.
- [ARCHITECTURE.md](ARCHITECTURE.md) - Sistemin 5 katmanlı topolojisi ve veri akışı.
- [integration_guide.md](integration_guide.md) - Termux, Open WebUI ve API entegrasyon kılavuzu.
- [android/README_ANDROID.md](android/README_ANDROID.md) - Kotlin & Jetpack Compose Android istemcisi.
- [CONSCIOUSNESS_PROTOCOL.md](CONSCIOUSNESS_PROTOCOL.md) - SCP-01 Sentetik Üstbiliş ve Aktif Çıkarım protokolü.

---

## 📜 Lisans
Bu proje **MIT Lisansı** ile lisanslanmıştır. Özgürce kullanılabilir, değiştirilebilir ve dağıtılabilir.
