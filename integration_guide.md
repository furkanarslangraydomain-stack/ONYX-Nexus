# ONYX-Nexus v4.0: Entegrasyon ve Dağıtım Teknik Kılavuzu

Bu kılavuz; ONYX-Nexus sisteminin Google Colab, Android Termux, Yerel Android İstemcisi, Open WebUI ve Universal MCP (Cursor / Claude Desktop) ortamlarına nasıl entegre edileceğini adım adım açıklar.

---

## 1. Google Colab 5-Düğümlü Mesh Entegrasyonu

Google Colab üzerinde 5 mikroservis düğümünü (Port 8000 - 8004) başlatmak ve Cloudflare genel tüneli üzerinden dış dünyaya açmak için:

1. `colab_mesh_setup.ipynb` veya `colab_5_cell_mesh_setup.ipynb` dosyasını Colab'da açın.
2. Hücreleri sırayla çalıştırın.
3. 4. Hücrede çıkan **Cloudflare Public Tunnel** URL'sini kopyalayın (Örn: `https://xyz-abc.trycloudflare.com`).
4. Küme durumunu ve senkronizasyonunu terminalden denetlemek için:
   ```bash
   python3 colab_mesh_sync.py --sync
   ```

---

## 2. Android Yerel İstemci Entegrasyonu (Kotlin & Jetpack Compose)

ONYX-Nexus, telefonunuzdan doğrudan Colab kümesine veya yerel sunucuya bağlanabilen bağımsız bir Android uygulamasına sahiptir (`/android`):

### Adım 2.1: Android Studio ile Derleme
1. Android Studio'da `Open Project` diyerek proje dizinindeki `android` klasörünü seçin.
2. Gradle senkronizasyonu tamamlandıktan sonra Shift + F10 ile cihazınızda çalıştırın.
3. Terminalden APK üretmek için:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   Çıktı: `android/app/build/outputs/apk/debug/app-debug.apk`

### Adım 2.2: Sunucu Bağlantısı
Uygulama açıldığında sağ üstteki **Ayarlar** simgesine dokunun ve Colab Cloudflare tünel adresinizi (veya yerel ağ IP'nizi `http://192.168.1.X:8000`) kaydedin.

---

## 3. Android Termux & Open WebUI Entegrasyonu

Düşük bellekli Android cihazlarda arka planda OpenAI uyumlu uç nokta çalıştırmak için:

### Adım 3.1: Termux Kurulumu
```bash
pkg update -y && pkg install -y git python clang rust
git clone https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git ~/onyx-nexus
cd ~/onyx-nexus
pip install -r requirements.txt
```

### Adım 3.2: Düşük Bellekli Çalıştırma (12GB / Mobil Optimizasyonu)
Termux'ta bellek taşmalarını önlemek için Uvicorn'u tek iş parçacığıyla (1-worker) başlatın:
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --timeout-keep-alive 65
```

### Adım 3.3: Open WebUI Bağlantısı
1. Open WebUI panelinde: **Settings → Connections → OpenAI API** bölümüne gidin.
2. **API URL:** `http://<TELEFON_IP>:8000/v1` (Örn: `http://192.168.1.145:8000/v1`)
3. **API Key:** `sk-onyx-nexus-local`
4. Modeller sekmesinden `onyx-nexus-swarm` modelini seçin.

---

## 4. Universal MCP Hub Entegrasyonu (Cursor & Claude Desktop)

ONYX-Nexus, JSON-RPC tabanlı Model Context Protocol (MCP) üzerinden geliştirici araçlarıyla doğrudan haberleşir.

### Cursor Entegrasyonu (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "onyx-nexus": {
      "command": "python3",
      "args": ["/path/to/ONYX-Nexus/mcp_server.py"],
      "env": {
        "ONYX_PORT": "8000"
      }
    }
  }
}
```

### Claude Desktop Entegrasyonu (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "onyx-nexus": {
      "command": "python3",
      "args": ["/absolute/path/to/ONYX-Nexus/mcp_server.py"]
    }
  }
}
```

---

## 5. Zero-Knowledge Shield API ve cURL Örnekleri

Dış sağlayıcılara giden istekleri körleştirerek güvenli sorgulama yapmak için:

```bash
curl -X POST http://localhost:8000/api/chat/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "0x71C84183203fCd82004E82554CE1B31580A76356 adresi için reentrancy korumalı staking kontratı üret.",
    "agent": "web3",
    "workflow": "consensus_swarm"
  }'
```

Sistem durumu ve gizlilik kalkanı kontrolü:
```bash
curl -X GET http://localhost:8000/api/security/privacy-status
```
