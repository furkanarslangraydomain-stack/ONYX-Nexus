# ONYX-Nexus: Sistem & Ajan Mimarisi Şeması (System Architecture Blueprint)

ONYX-Nexus, yüksek performanslı **Swarm Engine** (Ajan Sürü Motoru), **Polyglot Compiler Sandbox**, **Web3 Güvenlik Denetçisi**, **3D Render Studio**, ve **5-Node Colab Mesh Cluster** üzerine inşa edilmiş, otonom yapay zeka ve sistem geliştirme platformudur.

---

## 1. Yüksek Düzey Mimari Şeması (High-Level Topology)

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        KULLANICI ARAYÜZÜ (REACT 18 + VITE)                      │
│                                                                                 │
│  [Ajan Sohbet & Terminal]   [Çok Dilli Sandbox]   [Sistem & Ajan Hub]          │
│  [Web3 Akıllı Denetçi]     [3D Sahne Stüdyosu]   [Colab Kontrol & Mesh]        │
│  [Mimari Görselleştirici]  [Sistem Tanılama]                                   │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ WebSocket / REST API (FastAPI Port 8000)
┌───────────────────────────────────────▼─────────────────────────────────────────┐
│                      ONYX-NEXUS CORE ORCHESTRATOR LAYER                         │
│                                                                                 │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   Smart LLM Router    │  │   Swarm Engine v3    │  │ Mega MCP (36+ Tools) │  │
│  │ 5 Açık Kaynak Havuz   │  │ 5 Uzman Ajan Sürüsü  │  │ FS, DB, Web, Git, Sys│  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘  │
└──────────────┼─────────────────────────┼─────────────────────────┼──────────────┘
               │                         │                         │
┌──────────────▼─────────────────────────▼─────────────────────────▼──────────────┐
│                    ÖZELLEŞMİŞ OTONOM YETENEK MOTORLARI                          │
│                                                                                 │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ 3-Agent Consensus     │  │ Polyglot Sandbox     │  │ Web3 Security Linter │  │
│  │ Karar Matrisi         │  │ 6 Dil Derleyici      │  │ Reentrancy, Overflow │  │
│  │ (Mimar + Sec + QA)    │  │ + Auto-Repair Loop   │  │ Gas Optimization     │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ DB & SQL Optimizer    │  │ OpenAPI 3.0 / cURL   │  │ AutoGit CI/CD Agent  │  │
│  │ WAL, Index, CTE       │  │ Otomatik Spec Üreteci│  │ Semantic Push (PAT)  │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────────┐
│                    VERİ, BELLEK VE DAĞITIK ALTYAPI KATMANI                      │
│                                                                                 │
│  ┌────────────────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ SQLite WAL + FTS5 Hibrit DB    │   │ Lightweight Vector DB & Compactor    │  │
│  │ Full-Text Search, Oturum Kayıt │   │ 8K Token Sıkıştırma, 12GB RAM Limiti │  │
│  └────────────────────────────────┘   └──────────────────────────────────────┘  │
│  ┌────────────────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ 5-Node Colab Mesh Kümesi       │   │ Notion Reporter & Encryption Layer   │  │
│  │ Node 1: Master Orchestrator    │   │ AES-256 E2E Şifreli Veri Transferi   │  │
│  │ Node 2: Polyglot Sandbox       │   │ Otomatik Notion Sayfa Senkronizasyonu│  │
│  │ Node 3: Consensus Swarm        │   │                                      │  │
│  │ Node 4: 3D Render Studio       │   │                                      │  │
│  │ Node 5: Distributed Vector DB  │   │                                      │  │
│  └────────────────────────────────┘   └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Ajan Konsensüs & Karar Matrisi Akışı (Consensus Swarm Flow)

Kod yazılırken ya da sistem mimarisi kurulurken 3 uzman ajan ortak karar matrisi ile kodu 3 aşamada doğrular:

```text
[Kullanıcı Kodu / Görev İsteği]
               │
               ▼
   [1. Aşama: Baş Mimar (Lead Architect)]
   ├── Modülerlik, SOLID Prensipleri & Kod Yapısı
   ├── Mimari Uyum Skoru (0 - 100%)
   └── Mimarinin Onay Durumu (ONAYLANDI / ŞARTLI / RED)
               │
               ▼
   [2. Aşama: Web3 & Sistem Güvenlik Uzmanı (Security Auditor)]
   ├── Reentrancy, tx.origin, Overflow/Underflow Taraması
   ├── Bellek Sızıntısı, Güvenli I/O & Enjeksiyon Taraması
   └── Güvenlik Skoru (0 - 100%)
               │
               ▼
   [3. Aşama: QA & Test Uzmanı (QA Tester)]
   ├── Foundry (Contract.t.sol) Testleri (test_fuzz, invariant)
   ├── PyTest / Jest Test Kapsama Analizi
   └── Test Dayanıklılık Skoru (0 - 100%)
               │
               ▼
      [ORTAK KONSENSÜS KARARI]
  ├── Skor >= %85: ONAYLANDI (Üretime Hazır)
  ├── %65 <= Skor < %85: ŞARTLI ONAY (Düzeltmeler Gerekli)
  └── Skor < %65: RED (Ajan Onarım Döngüsüne İletilir)
```

---

## 3. Çok Dilli Sandbox & Derleme Hakimiyeti (Polyglot Sandbox Pipeline)

Desteklenen 6 programlama dili için sözdizimi doğrulaması, AST analizi, çalışma zamanı simülasyonu ve ajan tabanlı otomatik onarım döngüsü:

| Dil | Derleyici / Çalışma Zamanı | Güvenlik & AST Denetimi | Test Çerçevesi |
| :--- | :--- | :--- | :--- |
| **Solidity** | solc v0.8.24 / Hardhat EVM | Reentrancy, tx.origin, CEI Pattern | Foundry (`Contract.t.sol`, `testFuzz_`) |
| **Rust** | rustc 1.77.0 / Cargo | Borrow Checker, Lifetime, Unsafe Check | `cargo test`, Property Testing |
| **Go** | Go 1.22 Runtime / gc | Goroutine Leaks, Race Detector | `go test -race`, Table-driven tests |
| **C++20** | g++ / Clang 18 | AddressSanitizer, UB & Pointer Checks | GoogleTest / Catch2 |
| **TypeScript**| Node.js 20 / tsc | Strict Null Checks, Type Invariants | Jest / Vitest |
| **Python** | Python 3.10+ CPython | PEP8, Memory Profiling, AST Linter | PyTest (`@pytest.mark.parametrize`) |

### Ajan Otomatik Onarım Döngüsü (Auto-Repair Loop)
Bir derleme veya güvenlik hatası saptandığında:
1. Derleyici hata çıktısı ve satır numarası ayrıştırılır.
2. Coder ve Reviewer ajanlar hatanın nedenini tespit eder.
3. Düzeltilmiş kod bloğu ve öneri üretilerek tek tıkla koda entegre edilir.

---

## 4. GitHub & Akıllı CI/CD Commit Otomasyonu

Kural: **Her kod yazma ve mimari geliştirme işlemi sonrasında proje doğrudan GitHub'a aktarılır.**

- **Repository**: `https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git`
- **Yetkilendirme**: Personal Access Token (PAT)
- **Format**: Conventional Semantic Commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- **İşlem Adımları**:
  1. `git config user.name "furkanarslangray"`
  2. `git config user.email "furkanarslangray@gmail.com"`
  3. `git add .`
  4. `git commit -m "<semantic-mesaj>"`
  5. `git push origin main`

---

## 5. Dağıtık Colab 5-Düğümlü Mesh Mimarisi (5-Node Mesh Cluster)

| Düğüm | Adı | Varsayılan Port | Rol & İşlev |
| :--- | :--- | :--- | :--- |
| **Node 1** | Master Orchestrator | `8000` | Merkezi istek yönlendirme, REST API, WebSocket terminali |
| **Node 2** | Polyglot Compiler Sandbox | `8001` | Çok dilli kod derleme, AST ayrıştırma, sözdizimi analizi |
| **Node 3** | Consensus Swarm & Research | `8002` | 3 Ajanlı karar matrisi, Deep Web Research & RAG |
| **Node 4** | 3D Render Studio Engine | `8003` | Three.js sahne üretimi, GLSL shader hesaplama, CAD geometri |
| **Node 5** | Vector DB & FTS5 Hub | `8004` | SQLite FTS5 tam metin araması, 8K bağlam sıkıştırma, bellek |
