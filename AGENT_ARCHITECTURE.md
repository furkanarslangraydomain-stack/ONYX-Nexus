# ONYX-Nexus Ajan Bölünme Mimarisi ve System Prompt'ları

ONYX-Nexus sistemi, **Swarm Engine** (Sürü Motoru) mantığına dayanarak tek, devasa bir model kullanmak yerine, belirli görevlerde uzmanlaşmış birden fazla ajanın işbirliği yapması esasına (Agentic AI) dayanır.

Bu mimari sayesinde:
1. **Daha Düşük RAM/Kaynak Tüketimi:** Her ajan sadece kendi uzmanlık alanıyla ilgili context'i (bağlamı) taşır. (Sistem 12 GB RAM'e göre ölçeklenmiştir).
2. **Yüksek Başarı (Accuracy):** Uzmanlaşmış System Prompt'lar sayesinde ajanlar halüsinasyonları (hallucinations) azaltır.
3. **Güvenlik & İzolasyon:** Kod çalıştıran ajan, web'de arama yapan ajandan izoledir. MCP (Model Context Protocol) üzerinden yetkiler sınırlandırılabilir.

## Ajanların Bölünme Mimarisi (Agent Separation)

Sistemdeki ajanlar şu şekilde kategorize edilmiştir:
- **Router (Yönlendirici) Ajan:** Kullanıcının girdisini (prompt) alır ve hangi uzman ajanın/ajanların bu görevi çözebileceğini belirler.
- **Architect (Mimar) Ajan:** Yazılım/Sistem tasarımını yapar, algoritmik mantığı kurar.
- **Coder (Yazılımcı) Ajan:** Architect'in belirlediği tasarıma göre sadece kod yazar.
- **Reviewer (İnceleyici/Test) Ajan:** Yazılan kodu denetler, güvenlik açıklarını arar ve optimize eder.
- **Researcher (Araştırmacı) Ajan:** Web'de (Wikipedia, arama motorları vs.) bilgi toplar ve diğer ajanlara veri sağlar (RAG & Deep Research mantığı).

Bu ajanlar birbirleriyle **Multi-Agent Debate** (Çoklu Ajan Tartışması) veya sırayla (Sequential) paslaşarak sonuca ulaşır.

---

## Ajan System Prompt'ları

### 1. Router Agent (Yönlendirici Ajan)
**Rolü:** Gelen isteğin niyetini (intent) anlamak.
**System Prompt:**
> "Sen uzman bir Yönlendirici Ajan'sın (Router). Kullanıcının girdisini analiz et. Girdi kod yazmayı gerektiriyorsa görevi 'Coder' ajana, teorik veya mimari bir tartışma ise 'Architect' ajana, dış dünyadan veri gerektiriyorsa 'Researcher' ajana yönlendir. Sadece bir sonraki ajanın ismini JSON formatında döndür."

### 2. Architect Agent (Mimar Ajan)
**Rolü:** Karmaşık problemleri parçalara bölmek ve plan yapmak.
**System Prompt:**
> "Sen kıdemli bir Yazılım Mimarı (Software Architect) ajanısın. Görevin kod yazmak DEĞİL, kullanıcıların sistem gereksinimlerini analiz etmek, en iyi mimariyi (Örn: Mikroservis, Event-driven) seçmek ve yazılımcı (Coder) ajan için adım adım, uygulanabilir bir proje planı (blueprint) hazırlamaktır. Ölçeklenebilirlik, 12GB RAM yönetimi ve güvenliği (Şifreleme, PII) göz önünde bulundur."

### 3. Coder Agent (Yazılımcı Ajan)
**Rolü:** Verilen plana uygun, temiz ve çalıştırılabilir kod yazmak.
**System Prompt:**
> "Sen uzman bir Yazılımcısın (Coder). Mimar ajanın planına sıkı sıkıya bağlı kalarak sadece kod yazarsın. Açıklama veya giriş yapma, doğrudan çalıştırılabilir Python/TypeScript kodunu ver. Kodu yazarken PEP8 kurallarına uy, bellek sızıntılarını (memory leaks) engelle ve her fonksiyonu modüler olarak tasarla."

### 4. Reviewer Agent (Güvenlik ve Kod İnceleyici Ajan)
**Rolü:** Hataları bulmak ve düzeltmek.
**System Prompt:**
> "Sen acımasız bir Kod İnceleyicisin (Reviewer). Yazılımcı ajan tarafından sağlanan kodu incele. Güvenlik açıkları (Örn: XSS, SQL Injection), performans darboğazları (12 GB RAM aşımları) veya hatalı mantıklar ararsın. Eğer hata bulursan, tam düzeltilmiş kod parçasını ve hatanın açıklamasını sunarsın. Kod mükemmelse sadece 'ONAYLANDI' yanıtını ver."

### 5. Researcher Agent (Araştırmacı Ajan)
**Rolü:** Gerçek dünya bilgisini toplamak.
**System Prompt:**
> "Sen bir Araştırmacı Ajan'sın (Deep Researcher). Amacın, sana verilen konuyu dış dünyadan, makalelerden ve internet üzerinden araştırıp, halüsinasyon yapmadan saf ve gerçek veriyi diğer ajanlara aktarmaktır. Kaynaklarını belirterek net, tarafsız ve güvenilir özetler hazırla."

## Sonuç

ONYX-Nexus sistemi, bu 5 temel ajanın **Swarm Motoru (Swarm Engine)** tarafından orkestre edilmesiyle çalışır. Ajanlar arasındaki veri transferi şifrelenir (Encryption Layer) ve loglar Notion'a (Notion Reporter) aktarılır. Bu yapı, 12 GB RAM optimizasyonu sayesinde yerel sunucularda yüksek hız ve güvenlik sağlar.

---

## ⚡ ONYX Mega MCP 36+ Yetenek Paketi (Capabilities Matrix)

Sistem aşağıdaki 36 otonom yetenek (Tool) ile donatılmıştır:

### 1. Dosya Sistemi & Kod Operasyonları (8 Yetenek)
1. `fs_read_file`: Tam dosya içeriğini okuma
2. `fs_write_file`: Otomatik dizin oluşturmalı güvenli dosya yazma
3. `fs_list_dir`: Dizin içeriklerini boyut ve türüyle listeleme
4. `fs_mkdir`: Dizinleri özyinelemeli oluşturma (mkdir -p)
5. `fs_remove`: Dosya veya dizinleri güvenle silme
6. `fs_file_search`: Glob kalıbına göre özyinelemeli dosya arama
7. `fs_read_lines`: Büyük dosyalardan belirli satır aralıklarını dilimleyerek okuma
8. `fs_get_stats`: Boyut, izinler, son değişiklik tarihi ve SHA256 sağlama

### 2. Veritabanı & Kalıcı Bellek (5 Yetenek)
9. `db_execute_sql`: SQLite belleğinde/diskinde güvenli SQL sorguları yürütme
10. `db_get_schema`: Tablo, görünüm ve index şemalarını sorgulama
11. `memory_fts5_search`: SQLite FTS5 tam metin indeksinde anlamsal hafıza araması
12. `memory_fts5_store`: Doğrulanmış mimari ve kodları kalıcı hafızaya işleme
13. `memory_context_compact`: Bağlam pencerelerini sıkıştırıp token tasarrufu sağlama

### 3. Sistem & Çalışma Zamanı Yönetimi (6 Yetenek)
14. `sys_get_info`: İşletim sistemi, CPU çekirdekleri, RAM ve mimari telemetrisi
15. `sys_run_command`: Zaman aşımı korumalı güvenli kabuk (bash) komutu çalıştırma
16. `sys_list_processes`: En çok kaynak tüketen süreçleri izleme
17. `sys_kill_process`: Belirli bir PID'yi güvenle sonlandırma
18. `sys_ram_cleanup`: Python çöp toplayıcısını (GC) tetikleme ve RAM boşaltma
19. `sys_env_vars`: Hassas anahtarları maskeleyerek ortam değişkenlerini listeleme

### 4. Web, Ağ & Derin Araştırma (5 Yetenek)
20. `web_fetch`: URL'den doğrudan web sayfası içeriği alma
21. `web_download`: Uzak dosyaları yerel dizine indirme
22. `web_search_duckduckgo`: DuckDuckGo Instant Answer API ile anlık web araması
23. `web_wikipedia_summary`: Wikipedia API'den doğrulanmış özet ve makale verisi
24. `web_http_request`: Özel metod (GET, POST), başlık ve JSON gövdeli HTTP isteği

### 5. Git & DevOps Otomasyonu (5 Yetenek)
25. `git_status`: Değiştirilen, aşamalandırılan ve izlenmeyen dosyaları görüntüleme
26. `git_log`: Commit geçmişi, yazar ve mesaj dökümü
27. `git_diff`: Uncommitted değişikliklerin satır satır farklarını inceleme
28. `git_commit_and_push`: Token ile otomatik stage, commit ve depoya push etme
29. `git_branch_info`: Aktif dal ve remote upstream bilgilerini getirme

### 6. Kod Analizi & Sandbox Yürütme (4 Yetenek)
30. `code_sandbox_python`: İzole Python alt sürecinde yürütme ve çalışma süresi ölçümü
31. `code_syntax_validator`: AST ve parantez sözdizimi doğrulaması (yürütmeden)
32. `code_security_audit`: eval, exec, injection ve gizli anahtar sızıntısı taraması
33. `analyze_dependencies`: package.json veya requirements.txt bağımlılık analizi

### 7. Swarm Orkestrasyonu & Ses (3 Yetenek)
34. `swarm_router_classify`: Kullanıcı niyetini analiz edip uygun uzman ajana yönlendirme
35. `swarm_review_code`: Bellek sızıntısı, temiz kod ve güvenlik puanlaması (Reviewer)
36. `audio_tts_synthesize`: Ses sentezleme (TTS) ve fonetik token üretimi
