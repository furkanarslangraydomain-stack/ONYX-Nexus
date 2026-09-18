import os
import subprocess
import time
import threading

REPOS = [
    "https://github.com/cheems/awesome-free-chatgpt.git",
    "https://github.com/LiLittleCat/awesome-free-chatgpt.git",
    "https://github.com/zukixa/cool-ai-stuff.git",
    "https://github.com/mahrtayyab/awesome-llm.git",
    "https://github.com/fakhari/awesome-free-ai.git"
]

DEST_DIR = "free_apis_repos"

def update_repos():
    print("[*] Ücretsiz LLM API depoları güncelleniyor...")
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
    
    for repo in REPOS:
        repo_name = repo.split("/")[-1].replace(".git", "")
        repo_path = os.path.join(DEST_DIR, repo_name)
        
        if os.path.exists(repo_path):
            print(f"  ➜ {repo_name} güncelleniyor (git pull)...")
            subprocess.run(["git", "-C", repo_path, "pull", "--rebase"], capture_output=True)
        else:
            print(f"  ➜ {repo_name} klonlanıyor...")
            subprocess.run(["git", "clone", repo, repo_path], capture_output=True)
            
    print("[+] Tüm API depoları güncellendi.")

def start_updater():
    while True:
        update_repos()
        # Her 24 saatte bir (86400 saniye)
        time.sleep(86400)

if __name__ == "__main__":
    t = threading.Thread(target=start_updater, daemon=True)
    t.start()
    print("[+] Ücretsiz API güncelleyici arka planda başlatıldı.")
    # For testing, we just let it run for a second and exit if not imported
