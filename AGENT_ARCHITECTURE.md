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
