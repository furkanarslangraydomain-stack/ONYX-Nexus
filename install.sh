#!/usr/bin/env bash
# ==============================================================================
# ONYX-NEXUS: Tek Tıkla Otomatik Kurulum ve Başlatma Betiği
# Awesome-FreeLLM-APIs Entegre: Sıfır API Anahtarı, Anında Çalışma!
# Desteklenen Ortamlar: Android (Termux), Ubuntu, Debian, Alpine, WSL
# ==============================================================================
set -e

echo -e "\033[1;32m"
echo "  ___  _  ____   ____  __  _ _____  ___   _ ____ "
echo " / _ \| \| \ \ / /\ \/ / | | | ____|\ \ / // ___|"
echo "| | | | . \ \ V /  \  /  | | |  _|   \ V / \___ \ "
echo "| |_| | |\ \ | |   /  \  | | | |___   | |   ___) |"
echo " \___/|_| \_||_|  /_/\_\ |_| |_____|  |_|  |____/ "
echo -e "\033[0m"
echo -e "\033[1;36m[+] Onyx-Nexus Tek Tıkla Kurulum Başlatılıyor...\033[0m\n"

# 1. Ortam Tespiti
IS_TERMUX=false
if [ -d "$PREFIX/bin" ] && [ -n "$TERMUX_VERSION" ]; then
    IS_TERMUX=true
    echo -e "\033[1;33m[i] Android Termux ortamı tespit edildi.\033[0m"
else
    echo -e "\033[1;34m[i] Standart Linux / Bulut sunucu ortamı tespit edildi.\033[0m"
fi

# 2. Çalışma Dizini Oluşturma
INSTALL_DIR="$HOME/onyx-nexus"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
echo -e "\033[1;32m[✓] Çalışma dizini: $INSTALL_DIR\033[0m"

# 3. Bağımlılıkların Yüklenmesi
if [ "$IS_TERMUX" = true ]; then
    echo -e "\033[1;36m[+] Termux paketleri güncelleniyor ve kuruluyor...\033[0m"
    pkg update -y && pkg install -y python clang libffi openssl curl git
    termux-wake-lock
    echo -e "\033[1;32m[✓] Termux wake-lock aktif edildi (arka planda CPU uyumaz).\033[0m"
else
    if command -v apt-get &> /dev/null; then
        echo -e "\033[1;36m[+] APT paketleri güncelleniyor...\033[0m"
        sudo apt-get update -y && sudo apt-get install -y python3 python3-pip curl git
    fi
fi

# 4. Python Bağımlılıkları (Ultra Hafif: < 35MB RAM, SQLite Dahili)
echo -e "\033[1;36m[+] Python kütüphaneleri yükleniyor (FastAPI, Uvicorn, HTTPX)...\033[0m"
python3 -m pip install --upgrade pip
python3 -m pip install "fastapi>=0.110.0" "uvicorn>=0.28.0" "httpx>=0.27.0" "pydantic>=2.6.0"

# 5. .env Yapılandırması (Gereksiz! Doğrudan Sıfır Anahtarla Çalışır)
if [ ! -f .env ]; then
    echo -e "\033[1;33m[i] .env şablonu oluşturuluyor (Varsayılan: Sıfır API Anahtarlı Ücretsiz Havuz)...\033[0m"
    cat << 'EOF' > .env
# Onyx-Nexus Yapılandırma Dosyası
# NOT: API girmek ZORUNLU DEĞİLDİR! Sistem gömülü Awesome-FreeLLM-APIs (Pollinations AI) ile doğrudan çalışır.
API_POOL_BASE_URL=""
API_POOL_KEY=""
API_POOL_MODEL="onyx-pool-auto"

# 2. Kod Çalıştırma Motoru (Piston Cloud: Sıfır Maliyet & Çoklu Dil Sandbox)
EXECUTION_ENGINE="piston"

# 3. Ağ Bağlantısı
HOST="0.0.0.0"
PORT=8000
EOF
    echo -e "\033[1;32m[✓] .env şablonu hazır. API anahtarı girmeden de anında çalıştırabilirsiniz!\033[0m"
fi

# 6. Yerel IP Tespiti
LOCAL_IP="127.0.0.1"
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}')
elif command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1)
fi

echo -e "\n\033[1;32m================================================================"
echo -e " [✓] ONYX-NEXUS KURULUMU TAMAMLANDI!"
echo -e "================================================================\033[0m"
echo -e "Awesome-FreeLLM-APIs Havuzu: \033[1;32mAKTİF (API Anahtarı Gerekmez)\033[0m"
echo -e "Open WebUI Bağlantı Adresiniz (Base URL):"
echo -e "  \033[1;36mhttp://${LOCAL_IP:-192.168.1.X}:8000/v1\033[0m"
echo -e "API Anahtarı:"
echo -e "  \033[1;33monyx-nexus-termux\033[0m (veya herhangi bir şey)"
echo -e "Model Adı:"
echo -e "  \033[1;32monyx-nexus-agent\033[0m"
echo -e "----------------------------------------------------------------"
echo -e "Başlatmak için: \033[1;32mpython3 main.py\033[0m"
echo -e "================================================================\n"

# Otomatik başlatma isteği
read -p "Sunucuyu hemen başlatmak istiyor musunuz? (E/h): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ee]$ ]] || [[ -z $REPLY ]]; then
    echo -e "\033[1;32m[+] Uvicorn (FastAPI) tek worker ile başlatılıyor...\033[0m\n"
    python3 main.py
fi
