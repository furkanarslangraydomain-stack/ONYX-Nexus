# ONYX-Nexus Android İstemcisi (Kotlin & Jetpack Compose)

ONYX-Nexus Otonom Yapay Zeka İşletim Sistemi için geliştirilmiş resmi yerel Android uygulamasıdır.

## 🚀 Öne Çıkan Özellikler

1. **Google Gemini Tarzı Minimalist Sohbet:**
   - Oval ve zarif parlayan prompt barı.
   - 9 Uzman Ajan (Router, Architect, Coder, Sentinel, Runner, Researcher, Web3, DevOps, Reporter) seçimi.
   - 5 Otonom İş Akışı (Dual-Stage CoT, Consensus Swarm, Auto-Repair, Deep Research, ZK-Shield).
   - Sesli komut desteği.
2. **Zero-Knowledge Privacy Shield:**
   - Dış API sağlayıcılarına giden verilerin yerel olarak körleştirilmesi.
   - HMAC-SHA256 bütünlük doğrulaması.
3. **Colab 5-Düğümlü Mesh Ağı Telemetrisi:**
   - P2P düğüm durumları, gecikme süreleri ve port takibi.
4. **Offline Dayanıklılığı:**
   - Sunucuya erişilemediğinde yerel kural motoru devrede kalır.

---

## 🛠️ Kurulum ve Derleme (Android Studio)

### Gereksinimler
- **Android Studio Iguana | Hedgehog** veya daha yenisi
- **JDK 17** (Gradle ve Kotlin uyumu için)
- **Android SDK:** Compile SDK 34, Min SDK 26 (Android 8.0+)

### Adım Adım Çalıştırma
1. Android Studio'yu açın ve `Open Project` seçeneğine tıklayın.
2. Proje kökündeki `android` klasörünü seçin.
3. Gradle senkronizasyonunun tamamlanmasını bekleyin.
4. Emülatör veya USB ile bağlı gerçek Android cihazınızı seçin.
5. `Run 'app'` (Shift + F10) tuşuna basarak uygulamayı derleyip başlatın.

### APK Üretimi (Debug / Release)
Terminal üzerinden doğrudan APK derlemek için:
```bash
cd android
./gradlew assembleDebug
```
Üretilen APK dosyası şu dizinde bulunacaktır:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Backend Sunucu Bağlantısı

Uygulamanın sağ üst köşesindeki **Ayarlar (Settings)** ikonuna tıklayarak API adresini belirleyebilirsiniz:
- **Android Emülatöründen Yerel Sunucu:** `http://10.0.2.2:3000` veya `http://10.0.2.2:8000`
- **Aynı Wi-Fi Ağındaki Bilgisayar:** `http://192.168.1.X:3000`
- **Google Colab (Cloudflare Tüneli):** `https://xxxx.trycloudflare.com`
