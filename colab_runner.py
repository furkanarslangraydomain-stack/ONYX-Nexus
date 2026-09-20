#!/usr/bin/env python3
"""
Onyx-Nexus Colab & Cloudflare Tunnel Runner
Exclusively crafted for Google Colab (20GB RAM) to expose FastAPI server
to Open WebUI over a free, encrypted Cloudflare Tunnel (trycloudflare.com).
Zero API keys needed!
"""

import os
import re
import sys
import time
import json
import shutil
import urllib.request
import subprocess
import threading

def get_colab_specs():
    specs = {"ram": "20 GB", "gpu": "None", "cpu": "Unknown"}
    try:
        with open("/proc/meminfo", "r") as f:
            for line in f:
                if "MemTotal" in line:
                    kb = int(line.split()[1])
                    specs["ram"] = f"{round(kb / (1024 * 1024), 1)} GB"
                    break
    except Exception:
        pass

    try:
        res = subprocess.run(["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"], capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            specs["gpu"] = res.stdout.strip()
    except Exception:
        pass

    try:
        res = subprocess.run(["nproc"], capture_output=True, text=True)
        if res.returncode == 0:
            specs["cpu"] = f"{res.stdout.strip()} Çekirdek"
    except Exception:
        pass

    return specs

def setup_cloudflared():
    cloudflared_path = shutil.which("cloudflared")
    if not cloudflared_path:
        local_bin = "./cloudflared"
        if not os.path.exists(local_bin):
            print("\033[1;36m[+] Cloudflare Tunnel (cloudflared) indiriliyor...\033[0m")
            url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
            urllib.request.urlretrieve(url, local_bin)
            subprocess.run(["chmod", "+x", local_bin], check=True)
            print("\033[1;32m[✓] cloudflared hazırlandı.\033[0m")
        return os.path.abspath(local_bin)
    return cloudflared_path

def start_server_and_tunnel():
    specs = get_colab_specs()
    print("\033[1;35m" + "=" * 75)
    print("      ONYX-NEXUS: GOOGLE COLAB (20GB RAM) & CLOUDFLARE ORCHESTRATOR    ")
    print("=" * 75 + "\033[0m")
    print(f"\033[1;32m[✓] Algılanan Donanım:\033[0m RAM: {specs['ram']} | GPU: {specs['gpu']} | CPU: {specs['cpu']}")
    print(f"\033[1;32m[✓] LLM Havuzu:\033[0m Awesome-FreeLLM-APIs (Pollinations DeepSeek/OpenAI - 0 Key)")
    print(f"\033[1;32m[✓] Yürütme Sandbox:\033[0m Colab Yüksek Hızlı Yerel Yürütme + Piston Bulut")
    print("-" * 75)

    # 1. Gerekli paketlerin kurulumu
    print("\033[1;36m[+] Python bağımlılıkları doğrulanıyor (CrewAI, LangChain, FastAPI, WebSockets)...\033[0m")
    subprocess.run([
        sys.executable, "-m", "pip", "install", "-q",
        "fastapi>=0.110.0", "uvicorn[standard]>=0.28.0", "httpx>=0.27.0", "pydantic>=2.6.0",
        "websockets>=12.0", "crewai", "langchain-community", "langchain-openai"
    ], check=False)

    # 2. Cloudflared Hazırlığı
    cflared = setup_cloudflared()

    # 3. Uvicorn FastAPI Sunucusunu Başlatma
    print("\033[1;36m[+] Onyx-Nexus Otonom Sunucu motoru başlatılıyor (Port 8000)...\033[0m")
    server_env = os.environ.copy()
    server_env["EXECUTION_ENGINE"] = "colab"
    server_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--workers", "1"],
        env=server_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    # Uvicorn log okuyucu
    def log_streamer():
        for line in iter(server_proc.stdout.readline, ''):
            if "ERROR" in line or "Uvicorn running" in line or "ONYX-NEXUS" in line or "AutonomousServer" in line:
                print(f"\033[0;34m[API]\033[0m {line.strip()}")
    threading.Thread(target=log_streamer, daemon=True).start()

    time.sleep(2.5)

    # 4. Cloudflare Tunnel Başlatma
    print("\033[1;36m[+] Cloudflare Tüneli kuruluyor (HTTPS uç noktası oluşturuluyor)...\033[0m")
    tunnel_proc = subprocess.Popen(
        [cflared, "tunnel", "--url", "http://127.0.0.1:8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    public_tunnel_url = None
    tunnel_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

    # Tünel linkini loglardan yakala
    start_time = time.time()
    while time.time() - start_time < 30:
        line = tunnel_proc.stdout.readline()
        if not line:
            break
        match = tunnel_pattern.search(line)
        if match:
            public_tunnel_url = match.group(0)
            break

    if not public_tunnel_url:
        print("\033[1;31m[!] Cloudflare tünel URL'si yakalanamadı. Lütfen internet bağlantınızı kontrol edin.\033[0m")
        return

    # FastAPI sunucusuna Cloudflare URL'sini bildir
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/set-tunnel",
            data=json.dumps({"url": public_tunnel_url}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=3.0)
    except Exception:
        pass

    print("\n\033[1;32m" + "█" * 78)
    print("  🎉 TEBRİKLER! ONYX-NEXUS OTONOM SUNUCU (20GB RAM) BAĞIMSIZ OLARAK YAYINDA!")
    print("█" * 78 + "\033[0m")
    print(f"\n\033[1;35m>>> 🖥️ COLAB OTONOM YÖNETİM MERKEZİ & GÖREV MASASI <<<\033[0m")
    print(f"\033[1;37mBağımsız sunucuyu yönetmek ve görevleri ZIP olarak indirmek için açın:\033[0m")
    print(f"   \033[1;35mWeb Konsolu:\033[0m      \033[1;32m\033[4m{public_tunnel_url}\033[0m")
    print(f"   \033[1;36mOtonom Mod:\033[0m       CrewAI (3 Ajan) & LangChain Zincirleri")
    print(f"   \033[1;36mÇalışma Alanı:\033[0m    /content/workspace (Doğrudan ZIP indirme destekli)")

    print(f"\n\033[1;33m>>> 🌐 OPEN WEBUI BAĞLANTI AYARLARINIZ <<<\033[0m")
    print(f"\033[1;37mOpen WebUI → Yönetici Paneli → Ayarlar → Bağlantılar → OpenAI API:\033[0m\n")
    print(f"   \033[1;36mAPI Base URL:\033[0m  \033[1;32m{public_tunnel_url}/v1\033[0m")
    print(f"   \033[1;36mAPI Key:\033[0m       \033[1;33monyx-nexus-colab\033[0m (veya herhangi bir metin)")
    print(f"   \033[1;36mModel:\033[0m         \033[1;36monyx-nexus-agent\033[0m / \033[1;36monyx-nexus-crewai\033[0m")
    print("-" * 75)
    print(f"   \033[1;36mAPI Anahtarı:\033[0m  \033[1;33monyx-nexus-colab\033[0m")
    print(f"   \033[1;36mModel Seçimi:\033[0m  \033[1;32monyx-nexus-agent\033[0m  (veya onyx-nexus-colab)")
    print("\n\033[1;32m" + "-" * 78)
    print("  Donanım & Özellikler:")
    print(f"  • Colab Gücü: {specs['ram']} RAM ile yerel Python/Bash çalıştırma (0 gecikme)")
    print("  • Web Arayüzü: Yerleşik FastAPI HTML & Tailwind Kontrol Merkezi")
    print("  • Akıl Yürütme: Open WebUI <thought> katlanabilir canlı düşünce akışı")
    print("  • Bellek: SQLite FTS5 WAL Modu (Kalıcı görev hafızası, sıfır kilitlenme)")
    print("  • Tünel: Ücretsiz, sınırsız Cloudflare SSL Güvenli Bağlantı")
    print("-" * 78 + "\033[0m\n")
    print("\033[1;34m[i] Sunucu çalışıyor. Çıkmak için Ctrl+C tuşlarına basabilirsiniz.\033[0m\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\033[1;31m[-] Kapatılıyor...\033[0m")
        tunnel_proc.terminate()
        server_proc.terminate()

if __name__ == "__main__":
    start_server_and_tunnel()
