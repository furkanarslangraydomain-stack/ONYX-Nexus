#!/usr/bin/env bash
# ==============================================================================
# ONYX-Nexus: 5-Node Colab Mesh One-Click Setup Script
# Works on Google Colab, Linux VPS, Docker, and Termux
# ==============================================================================

set -e

REPO_URL="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git"
TARGET_DIR="${TARGET_DIR:-$HOME/ONYX-Nexus}"

echo -e "\033[1;36m==============================================================================\033[0m"
echo -e "\033[1;32m       ONYX-NEXUS 5-NODE COLAB MESH KURULUMU & BAŞLATICI                     \033[0m"
echo -e "\033[1;36m==============================================================================\033[0m"

# 1. Depo Kontrolü
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "\033[1;34m[*] Depo klonlanıyor: $REPO_URL -> $TARGET_DIR\033[0m"
    git clone --depth=1 "$REPO_URL" "$TARGET_DIR"
else
    echo -e "\033[1;34m[*] Mevcut depo güncelleniyor: $TARGET_DIR\033[0m"
    git -C "$TARGET_DIR" pull --ff-only || true
fi

cd "$TARGET_DIR"

# 2. Python Ortamı
echo -e "\033[1;34m[*] Bağımlılıklar kuruluyor (FastAPI, Uvicorn, HTTPX, Pydantic, pycloudflared)...\033[0m"
python3 -m pip install -q --upgrade pip
python3 -m pip install -q fastapi uvicorn httpx pydantic psutil python-dotenv pycloudflared

# 3. 5-Node Mesh Düğümlerini Arka Planda Başlatma
declare -A NODES
NODES[1]="Master Orchestrator:8000"
NODES[2]="Polyglot Compiler Sandbox:8001"
NODES[3]="Consensus Swarm Engine:8002"
NODES[4]="3D Studio Engine:8003"
NODES[5]="Vector DB Hub:8004"

echo -e "\033[1;33m[*] 5-Node Mesh Düğümleri Başlatılıyor...\033[0m"
mkdir -p logs

for id in 1 2 3 4 5; do
    INFO="${NODES[$id]}"
    NAME="${INFO%:*}"
    PORT="${INFO#*:}"
    
    NODE_ID=$id PORT=$PORT HOST=0.0.0.0 python3 main.py > "logs/node_${PORT}.log" 2>&1 &
    PID=$!
    echo -e "  \033[1;32m✓\033[0m Düğüm $id: $NAME (Port: $PORT) [PID: $PID] çalışıyor."
    sleep 1
done

# 4. Cloudflare Tüneli
echo -e "\033[1;34m[*] Cloudflare Tünel kontrolü yapılıyor...\033[0m"
python3 -c "
try:
    from pycloudflared import try_cloudflare
    t = try_cloudflare(port=8000)
    print('\033[1;32m🌟 [CLOUDFLARE PUBLIC URL]:\033[0m', t.tunnel_url)
    with open('logs/cloudflare_url.txt', 'w') as f:
        f.write(t.tunnel_url)
except Exception as e:
    print('[i] Cloudflare tünel başlatılamadı, yerel ağda port 8000 açık.')
" || true

echo -e "\033[1;32m==============================================================================\033[0m"
echo -e "\033[1;32m🎉 ONYX-Nexus Mesh Ağı Başarıyla Kuruldu!\033[0m"
echo -e "Düğümleri durdurmak için: \033[1;31mpkill -f 'python3 main.py'\033[0m"
echo -e "Logları izlemek için: \033[1;33mtail -f logs/node_8000.log\033[0m"
echo -e "\033[1;32m==============================================================================\033[0m"
