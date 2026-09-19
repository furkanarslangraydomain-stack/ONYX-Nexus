#!/usr/bin/env python3
"""
ONYX-NEXUS: 5-Node Distributed Google Colab Mesh Cluster
==========================================================
Architecture:
  - Node 1 (Port 8000): Master Orchestrator & Swarm Router (FastAPI, WebSockets, Open WebUI /v1)
  - Node 2 (Port 8001): Polyglot Compiler & Sandbox (Solidity, Rust, Go, C++20, TypeScript, Python)
  - Node 3 (Port 8002): Consensus Swarm & Deep Research (3-Agent Consensus Matrix, DuckDuckGo & Wiki)
  - Node 4 (Port 8003): 3D Render Studio Engine (Procedural Three.js, Shaders, PBR Materials, CAD Export)
  - Node 5 (Port 8004): Distributed Vector DB & FTS5 Memory Hub (SQLite FTS5, WAL Mode, Context Compactor)

All nodes are interconnected over a virtual mesh gossip network, exposed to the outer web
via encrypted, free Cloudflare Tunnels (trycloudflare.com).
"""

import os
import sys
import time
import json
import re
import shutil
import urllib.request
import subprocess
import threading
import argparse
from typing import Dict, Any, List

MESH_NODES = {
    1: {
        "id": "node-1-orchestrator",
        "name": "Master Orchestrator & Swarm Router",
        "port": 8000,
        "role": "Orchestrator",
        "desc": "Ana yönlendirici, Open WebUI /v1 köprüsü, WebSocket canlı terminal ve görev yöneticisi",
        "icon": "Cpu"
    },
    2: {
        "id": "node-2-polyglot",
        "name": "Polyglot Compiler & Execution Sandbox",
        "port": 8001,
        "role": "Compiler Sandbox",
        "desc": "Solidity (solc), Rust (cargo), Go, C++20, TypeScript ve Python çok dilli derleme ve otomatik onarım",
        "icon": "Code2"
    },
    3: {
        "id": "node-3-consensus",
        "name": "Consensus Swarm & Deep Research",
        "port": 8002,
        "role": "Consensus Engine",
        "desc": "Baş Mimar, Web3 Güvenlik Denetçisi ve QA karar matrisi; DuckDuckGo ve Wikipedia araştırmacısı",
        "icon": "ShieldCheck"
    },
    4: {
        "id": "node-4-render3d",
        "name": "3D Render Studio & Shader Engine",
        "port": 8003,
        "role": "3D Studio Engine",
        "desc": "Prosedürel Three.js sahne üretici, GLSL shader sentezleyici, PBR materyal ve CAD dışa aktarıcı",
        "icon": "Layers"
    },
    5: {
        "id": "node-5-memory",
        "name": "Distributed Vector DB & FTS5 Hub",
        "port": 8004,
        "role": "Memory Hub",
        "desc": "SQLite FTS5 tam metin indeksi, WAL modu yüksek eşzamanlılık, token sıkıştırıcı ve kalıcı kural deposu",
        "icon": "Database"
    }
}

class ColabMeshManager:
    def __init__(self, target_nodes: List[int] = None):
        self.target_node_ids = target_nodes or [1, 2, 3, 4, 5]
        self.processes: Dict[int, subprocess.Popen] = {}
        self.tunnels: Dict[int, subprocess.Popen] = {}
        self.public_urls: Dict[int, str] = {}
        self.cloudflared_bin = self._ensure_cloudflared()

    def _ensure_cloudflared(self) -> str:
        bin_path = shutil.which("cloudflared")
        if not bin_path:
            local_bin = "./cloudflared"
            if not os.path.exists(local_bin):
                print("\033[1;36m[+] Cloudflare Tunnel (cloudflared) indiriliyor...\033[0m")
                url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
                urllib.request.urlretrieve(url, local_bin)
                subprocess.run(["chmod", "+x", local_bin], check=True)
            return os.path.abspath(local_bin)
        return bin_path

    def start_node(self, node_num: int):
        cfg = MESH_NODES[node_num]
        port = cfg["port"]
        name = cfg["name"]
        print(f"\033[1;34m[Node {node_num}] {name} (Port {port}) başlatılıyor...\033[0m")

        env = os.environ.copy()
        env["MESH_NODE_ID"] = str(node_num)
        env["MESH_NODE_PORT"] = str(port)
        env["EXECUTION_ENGINE"] = "colab_mesh"

        # Node 1 launches main:app which hosts both primary API and mesh router.
        # Nodes 2-5 run microservice endpoints with the main codebase.
        cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port), "--workers", "1"]
        proc = subprocess.Popen(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.processes[node_num] = proc

        # Start background log consumer
        def log_reader():
            for line in iter(proc.stdout.readline, ''):
                if any(k in line for k in ["ERROR", "Uvicorn running", "ONYX", "Mesh", "Consensus", "Polyglot", "3D"]):
                    print(f"\033[0;36m[N{node_num}:{port}]\033[0m {line.strip()}")
        threading.Thread(target=log_reader, daemon=True).start()

        # Start Cloudflare Tunnel for this node
        time.sleep(1.8)
        tunnel_proc = subprocess.Popen(
            [self.cloudflared_bin, "tunnel", "--url", f"http://127.0.0.1:{port}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        self.tunnels[node_num] = tunnel_proc

        pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")
        start_t = time.time()
        node_url = None
        while time.time() - start_t < 25:
            line = tunnel_proc.stdout.readline()
            if not line: break
            m = pattern.search(line)
            if m:
                node_url = m.group(0)
                break

        if node_url:
            self.public_urls[node_num] = node_url
            print(f"\033[1;32m[✓ Node {node_num} Tüneli Aktif]\033[0m {node_url} (Port {port})")
        else:
            print(f"\033[1;33m[! Node {node_num}] Yerel tünel bekleniyor...\033[0m")

    def run_all(self):
        print("\033[1;35m" + "=" * 80)
        print("    ONYX-NEXUS: 5-NODE GOOGLE COLAB MESH CLUSTER & CLOUDFLARE ORCHESTRATOR    ")
        print("=" * 80 + "\033[0m")
        print("Her düğüm (node) bağımsız bir uzmanlık alanına atanmış izole mikroservistir.")
        print("-" * 80)

        for n in self.target_node_ids:
            self.start_node(n)

        # Notify Node 1 about other mesh peers
        time.sleep(2)
        try:
            mesh_manifest = {
                "nodes": [
                    {
                        "node_id": n,
                        "name": MESH_NODES[n]["name"],
                        "port": MESH_NODES[n]["port"],
                        "public_url": self.public_urls.get(n, f"http://127.0.0.1:{MESH_NODES[n]['port']}"),
                        "role": MESH_NODES[n]["role"],
                        "status": "ONLINE"
                    } for n in self.target_node_ids
                ]
            }
            req = urllib.request.Request(
                "http://127.0.0.1:8000/api/mesh/sync-peers",
                data=json.dumps(mesh_manifest).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            urllib.request.urlopen(req, timeout=3.0)
        except Exception:
            pass

        print("\n\033[1;32m" + "█" * 80)
        print("  🎉 ONYX-NEXUS 5-NODE MESH AĞI CLOUDFLARE ÜZERİNDEN BAŞARIYLA AYAĞA KALKTI!")
        print("█" * 80 + "\033[0m\n")

        for n in self.target_node_ids:
            url = self.public_urls.get(n, f"http://127.0.0.1:{MESH_NODES[n]['port']}")
            print(f"  \033[1;36m[Node {n}]\033[0m \033[1;33m{MESH_NODES[n]['name']:<38}\033[0m -> \033[1;32m{url}\033[0m")

        print("\n\033[1;35m>>> 🌐 Open WebUI / Harici İstemci Bağlantısı:\033[0m")
        orch_url = self.public_urls.get(1, "http://127.0.0.1:8000")
        print(f"  • API Base URL:  \033[1;32m{orch_url}/v1\033[0m")
        print(f"  • API Key:       \033[1;33monyx-nexus-mesh\033[0m")
        print(f"  • Ana Model:     \033[1;36monyx-nexus-agent\033[0m / \033[1;36monyx-mesh-swarm\033[0m")
        print("\nMesh ağı çalışıyor. Durdurmak için Ctrl+C tuşlayabilirsiniz.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[-] Mesh kümesi kapatılıyor...")
            for p in self.tunnels.values(): p.terminate()
            for p in self.processes.values(): p.terminate()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ONYX-Nexus Colab Mesh Cluster")
    parser.add_argument("--node", type=str, default="all", help="all veya 1,2,3,4,5")
    args = parser.parse_args()

    if args.node.lower() == "all":
        targets = [1, 2, 3, 4, 5]
    else:
        targets = [int(x.strip()) for x in args.node.split(",") if x.strip().isdigit()]

    manager = ColabMeshManager(targets)
    manager.run_all()
