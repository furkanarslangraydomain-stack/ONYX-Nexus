import os
import subprocess
import time
import re
import json
import logging

logger = logging.getLogger("FreeAPIsImporter")

FREE_API_REPOS = [
    {
        "name": "awesome-freellm-apis",
        "url": "https://github.com/open-free-llm-api/awesome-freellm-apis.git",
        "raw_readme": "https://raw.githubusercontent.com/open-free-llm-api/awesome-freellm-apis/main/README.md"
    },
    {
        "name": "awesome-free-chatgpt",
        "url": "https://github.com/LiLittleCat/awesome-free-chatgpt.git",
        "raw_readme": "https://raw.githubusercontent.com/LiLittleCat/awesome-free-chatgpt/main/README.md"
    },
    {
        "name": "awesome-free-ai",
        "url": "https://github.com/fakhari/awesome-free-ai.git",
        "raw_readme": "https://raw.githubusercontent.com/fakhari/awesome-free-ai/main/README.md"
    },
    {
        "name": "awesome-llm",
        "url": "https://github.com/mahrtayyab/awesome-llm.git",
        "raw_readme": "https://raw.githubusercontent.com/mahrtayyab/awesome-llm/main/README.md"
    },
    {
        "name": "cool-ai-stuff",
        "url": "https://github.com/zukixa/cool-ai-stuff.git",
        "raw_readme": "https://raw.githubusercontent.com/zukixa/cool-ai-stuff/main/README.md"
    }
]

DEST_DIR = "free_apis_repos"
DISCOVERED_ENDPOINTS_FILE = "discovered_free_apis.json"

def clone_or_update_repos():
    """5 farklı ücretsiz API sağlayıcı deposunu yerel olarak klonlar ve günceller."""
    print("[*] 5 Farklı Ücretsiz LLM API Deposu İçe Aktarılıyor...")
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR, exist_ok=True)
    
    extracted_endpoints = []
    
    for repo_info in FREE_API_REPOS:
        repo_name = repo_info["name"]
        repo_url = repo_info["url"]
        repo_path = os.path.join(DEST_DIR, repo_name)
        
        if os.path.exists(repo_path):
            print(f"  ➜ [{repo_name}] Güncelleniyor (git pull)...")
            subprocess.run(["git", "-C", repo_path, "pull", "--rebase"], capture_output=True, text=True)
        else:
            print(f"  ➜ [{repo_name}] Klonlanıyor...")
            subprocess.run(["git", "clone", "--depth", "1", repo_url, repo_path], capture_output=True, text=True)
            
        # Yerel README'yi tara ve API uç noktalarını çek
        readme_path = os.path.join(repo_path, "README.md")
        if os.path.exists(readme_path):
            try:
                with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    urls = re.findall(r'(https?://[^\s)\]"\']+)', content)
                    count = 0
                    for u in urls:
                        if ("/v1" in u or "api" in u.lower() or "chat/completions" in u) and "github.com" not in u and "shields.io" not in u:
                            clean_u = u.strip('`').strip().rstrip('/')
                            endpoint = clean_u if clean_u.endswith("/chat/completions") else f"{clean_u}/v1/chat/completions"
                            if endpoint not in [e["endpoint"] for e in extracted_endpoints]:
                                extracted_endpoints.append({
                                    "provider": repo_name,
                                    "endpoint": endpoint,
                                    "model": "gpt-4o-mini" if "4o" in endpoint else "gpt-3.5-turbo"
                                })
                                count += 1
                                if count >= 10:
                                    break
                    print(f"  ✓ [{repo_name}] {count} adet aktif API uç noktası çıkarıldı.")
            except Exception as e:
                print(f"  ! [{repo_name}] Analiz hatası: {e}")

    with open(DISCOVERED_ENDPOINTS_FILE, "w", encoding="utf-8") as f:
        json.dump(extracted_endpoints, f, indent=2)
        
    print(f"[+] Toplam {len(extracted_endpoints)} adet ücretsiz API uç noktası '{DISCOVERED_ENDPOINTS_FILE}' dosyasına aktarıldı.")
    return extracted_endpoints

if __name__ == "__main__":
    clone_or_update_repos()
