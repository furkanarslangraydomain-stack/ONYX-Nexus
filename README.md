# 🌐 ONYX-NEXUS: Yapay Zeka İşletim Sistemi (AI OS)

Onyx-Nexus, sadece kod yazan bir sohbet botu değil; otonom araştırma yapabilen, yazdığı kodu sanal bir ortamda test eden, birden fazla ajana bölünebilen (Swarm), zamanlanmış görevler çalıştırabilen ve sizin iletişim tarzınızı öğrenen **Açık Kaynaklı, Yerel ve Ücretsiz** bir Süper Zekadır.

## 🔥 Süper Güçleri
- **Fraktal Swarm Motoru:** Görevi anlar, kendini dinamik olarak alt ajanlara böler (Mimar, Geliştirici, QA) ve paralel çalıştırır.
- **Otonom Kod Sandbox'ı (E2B & Local):** Yazdığı kodu sana vermeden önce kendi kendine çalıştırır, hatası varsa yakalar ve düzeltir. İsteğe bağlı olarak **E2B Cloud Sandbox** destekler!
- **Deep Research (Derin Araştırma):** Halüsinasyon görmez! Wikipedia ve Web üzerinde anlık araştırma yapıp kanıtlara dayalı cevap verir.
- **Auto-Git (CI/CD):** Ürettiği çalışan kodları anında GitHub deponuza Pushlar.
- **Kalıcı Öğrenme & Kişilik Klonlama:** `/ogret` komutu ile şirket kurallarınızı veya yazılım tercihlerinizi yerel Vektör Veritabanına kaydeder. Sohbetlerinizi analiz edip sizin üslubunuzla konuşur.
- **Notion Entegrasyonu:** (Yeni!) Ajanların ürettiği raporları ve proje loglarını anında Notion veritabanınıza yazar.
- **Ses & Multimodal Zeka:** Sesinizle komut verebilir, yüklediğiniz resimleri analiz ettirebilir ve sonuçları sesli olarak (TTS) duyabilirsiniz.
- **Sıfır Maliyet (Limitsiz):** OpenAI veya Anthropic'e yüzlerce dolar ödemenize gerek yok. LiteLLM + Pollinations AI ağı ile açık uçlu modelleri ücretsiz ve limitsiz kullanır.

---

## 🛠️ KURULUM REHBERİ (INSTALLATION)

### 1. Gereksinimler
- Python 3.10+ ve Node.js 18+

### 2. Çevre Değişkenleri (.env)
Proje dizininde bir `.env` dosyası oluşturun (İsteğe bağlı):
```env
E2B_API_KEY="e2b_..."                   # Cloud Code Sandbox için (Zorunlu değil, yoksa yerel sandbox kullanır)
NOTION_API_KEY="secret_..."             # Raporları Notion'a kaydetmek için
NOTION_DATABASE_ID="123456..."          # Notion DB ID
```

### 3. Backend (Yapay Zeka Motoru) Kurulumu
Bir terminal açın ve proje dizinine gidin:
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend (React Arayüzü) Kurulumu
Yeni bir terminal penceresi açın:
```bash
npm install
npm run dev
```

---

## 🩺 Sistem Hazırlık Testi (Diagnostic)
Tüm API bağlantılarınızı, E2B erişilebilirliğini, Notion yetkilerinizi ve Vektör Veritabanınızı test etmek için yazdığımız otonom analiz aracını çalıştırın:
```bash
python3 system_diagnostic.py
```
Bu araç sistemin uçtan uca hazır olup olmadığını, eksik tokenleri ve modülleri size raporlar.
