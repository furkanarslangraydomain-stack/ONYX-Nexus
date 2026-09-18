import re
import urllib.request

def fetch_awesome_pool():
    print("[Awesome-FreeLLM-APIs] GitHub reposu taranıyor...")
    providers = []
    try:
        url = "https://raw.githubusercontent.com/open-free-llm-api/awesome-freellm-apis/main/README.md"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            content = resp.read().decode('utf-8')
            urls = re.findall(r'(https?://[^\s)\]"\']+)', content)
            
            for u in urls:
                if ("/v1" in u or "api" in u.lower()) and "github.com" not in u:
                    u = u.strip('`').strip()
                    if u not in [p['endpoint'] for p in providers]:
                        endpoint = u if u.endswith("/chat/completions") else f"{u.rstrip('/')}/v1/chat/completions"
                        providers.append({
                            "name": f"awesome_freellm_{len(providers)+1}",
                            "endpoint": endpoint,
                            "model": "gpt-3.5-turbo",
                            "key": "",
                            "type": "openai"
                        })
            print(f"[Awesome-FreeLLM-APIs] {len(providers)} adet potansiyel uç nokta bulundu ve bağlandı.")
            print(providers[:2])
    except Exception as e:
        print(f"[Awesome-FreeLLM-APIs] Hata: {e}")
    return providers

fetch_awesome_pool()
