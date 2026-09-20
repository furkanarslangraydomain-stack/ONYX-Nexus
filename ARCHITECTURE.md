# ONYX-Nexus: Sistem & Ajan Mimarisi Şeması (System Architecture Blueprint v4.0)

ONYX-Nexus; **9 Uzman Ajanlı Sürü Motoru (Swarm Engine)**, **Zero-Knowledge Gizlilik Kalkanı (ZK-Shield)**, **5-Düğümlü Colab Mesh Ağı**, **Polyglot Compiler Sandbox**, **Universal MCP Hub** ve **Yerel Kotlin Android İstemcisi** üzerine inşa edilmiş açık kaynaklı bir otonom yapay zeka işletim sistemidir.

---

## 1. Yüksek Düzey Katmanlı Topoloji (High-Level Topology)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                İSTEMCİ VE KULLANICI KATMANI                            │
│                                                                                        │
│   [Google Gemini Tarzı Web UI]       [Android Kotlin / Jetpack Compose İstemcisi]      │
│   • Oval Parlayan Prompt Barı        • Material 3 Navigasyon                           │
│   • 4 Hızlı Başlangıç Kartı          • Retrofit 2 & OkHttp REST İstemcisi              │
│   • 3D Sahne Stüdyosu (Three.js)     • Çevrimdışı Kural Fallback Motoru                │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST / SSE / WebSocket (Port 8000 & Cloudflare)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                        GÜVENLİK & ZERO-KNOWLEDGE KALKAN KATMANI                        │
│                                                                                        │
│   ┌───────────────────────────────────┐    ┌───────────────────────────────────────┐   │
│   │ Sentinel ZK-Privacy Shield        │    │ Anti-Tampering & Prompt Guard         │   │
│   │ Deterministik API Maskeleme       │    │ SHA-256 HMAC Paket Mührü              │   │
│   │ %100 Dış Sağlayıcı Körleştirmesi  │    │ Prompt Injection İmha Devresi         │   │
│   └───────────────────────────────────┘    └───────────────────────────────────────┘   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                         9-AJANLI SWARM ORKESTRASYON KATMANI                            │
│                                                                                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │
│   │ Nexus Router │  │ Master Arch. │  │ Polyglot Dev │  │ Sentinel ZK  │  │ QA Run  │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│   │ Deep Scholar │  │ Web3 Auditor │  │ Auto-Git Bot │  │ Notion Rep.  │               │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                                        │
│   5 Otonom Akış: [Dual-Stage CoT] [Consensus Swarm] [Auto-Repair] [Research] [ZK-Flow] │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                       5-NODE DAĞITIK COLAB MESH MİKROSERVİS AĞI                        │
│                                                                                        │
│   ┌───────────────────────────────┐        ┌───────────────────────────────────────┐   │
│   │ Düğüm 1 (Port 8000)           │        │ Düğüm 2 (Port 8001)                   │   │
│   │ Master Orchestrator & Gateway │        │ Polyglot Compiler Sandbox             │   │
│   │ Cloudflare Public Tunnel      │        │ Solidity, Rust, Go, Python, TS        │   │
│   └──────────────┬────────────────┘        └──────────────────┬────────────────────┘   │
│                  │                                            │                        │
│   ┌──────────────┴────────────────┐        ┌──────────────────┴────────────────────┐   │
│   │ Düğüm 3 (Port 8002)           │        │ Düğüm 4 (Port 8003)                   │   │
│   │ Consensus Swarm & Deep Scholar│        │ 3D Render Studio Engine               │   │
│   │ 3-Ajanlı Karar Matrisi        │        │ WebGL & Keyframe Engine               │   │
│   └──────────────┬────────────────┘        └──────────────────┬────────────────────┘   │
│                  │                                            │                        │
│   ┌──────────────┴────────────────────────────────────────────┴────────────────────┐   │
│   │ Düğüm 5 (Port 8004): Distributed Vector DB & FTS5 Hub                          │   │
│   │ • SQLite WAL Concurrency (Lock-Free)  • Context Compactor (8K -> 1.5K Token)   │   │
│   │ • 30+ Ücretsiz Sağlayıcı Havuzu       • colab_mesh_sync.py Canlı Senkronizasyon│   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sıfır Maliyetli Model Yönlendirme ve Failover

Sistem, 30'dan fazla ücretsiz API sağlayıcısını dinamik olarak izler:
- `awesome-freellm-apis` (10 uç nokta)
- `awesome-free-chatgpt` (10 uç nokta)
- `cool-ai-stuff` (10 uç nokta)
- Groq, Pollinations AI, HuggingFace Serverless

Her istekte:
1. Sentinel girdiyi maskeler (`<MASKED_SECRET_X>`).
2. Router en düşük gecikmeye sahip sağlayıcıyı seçer.
3. Sağlayıcı hata verirse (< 2.5 ms) otomatik yedek uç noktaya geçer (failover).
4. Dönen yanıt yerelde deşifre edilir.

---

## 3. SQLite FTS5 WAL & Bellek Dayanıklılığı

- **WAL Modu (Write-Ahead Logging):** 2200+ IOPS okuma/yazma hızı ile sıfır veritabanı kilitlenmesi.
- **Lock-Free Concurrency:** Eşzamanlı isteklerde `PRAGMA busy_timeout = 5000` ve otomatik truncate checkpointing (`colab_mesh_sync.py`).
- **Context Compactor:** Uzun konuşmalarda kritik 4 son iletiyi korurken, ara geçmişi anlamsal özet haline getirerek token tüketimini %84 azaltır.

---

## 4. Universal MCP Entegrasyonu (Model Context Protocol)

ONYX-Nexus, JSON-RPC tabanlı standart bir MCP sunucusu olarak çalışır:
- **Desteklenen IDE ve İstemciler:** Cursor, Claude Desktop, VS Code (Continue / Roo Code), Windsurf.
- **36+ Dahili Araç:**
  - `fs_read_file`, `fs_write_file`, `fs_list_dir`
  - `sqlite_query`, `sqlite_schema`
  - `git_status`, `git_commit`, `git_push`
  - `sandbox_run_code`, `web3_audit_contract`
  - `mesh_node_status`, `zk_mask_secret`
