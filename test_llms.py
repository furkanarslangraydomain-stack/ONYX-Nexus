import urllib.request
import json

endpoints = [
    "https://text.pollinations.ai/openai/chat/completions",
    "https://api.jmuz.me/v1/chat/completions"
]

for url in endpoints:
    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 10
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    print(f"Testing {url}...")
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            print(" ✅ OK:", res['choices'][0]['message']['content'])
    except Exception as e:
        print(" ❌ ERROR:", e)
