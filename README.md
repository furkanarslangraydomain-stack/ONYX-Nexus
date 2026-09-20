# ONYX-Nexus Colab çalışma modeli

ONYX-Nexus artık Google Colab üzerinde beş düğümlü mesh başlatmaz. Colab kurulumu tek hücrede OpenSSH + tmate + tek FastAPI daemon şeklindedir.

Kurulum:

```python
!git clone https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git /content/ONYX-Nexus
%cd /content/ONYX-Nexus
!python3 colab_single_cell_setup.py
```

Kurulum script'i:

- `openssh-client`, `openssh-server`, `tmate` ve `curl` kurar.
- Mevcut `main:app` FastAPI uygulamasını yalnızca `127.0.0.1:8000` üzerinde başlatır.
- SSH ve tarayıcı terminal bağlantılarını terminale yazdırır.
- Daemon loglarını `/content/ONYX-Nexus/logs/onyx-colab.log` dosyasına kaydeder.

Kontrol:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/docs
```

Mesh, beş port, Cloudflare tünelleri ve mesh senkronizasyonu bu çalışma modelinin parçası değildir. Eski mesh giriş dosyaları geriye dönük uyumluluk amacıyla yalnızca hata mesajı verir; yeni kodda kullanılmamalıdır.

Güvenlik: tmate bağlantı URL'leri oturum sırrı gibi değerlendirilmelidir. Bunları herkese açık depolara veya loglara commit etmeyin. Colab runtime kapandığında SSH ve daemon süreçleri de kapanır.
