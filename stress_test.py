import urllib.request
import urllib.error
import time
import json
import concurrent.futures

def hit_api():
    try:
        start = time.time()
        url = "http://127.0.0.1:8000/v1/chat/completions"
        data = json.dumps({
            "model": "onyx-nexus-agent",
            "messages": [{"role": "user", "content": "ping"}],
            "stream": False
        }).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=15.0) as resp:
            resp.read()
            return 200, time.time() - start
    except urllib.error.HTTPError as e:
        return e.code, 0
    except Exception as e:
        return 500, 0

def main():
    print("Stress test başlıyor (50 istek, 10 eşzamanlı)...")
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(hit_api) for _ in range(50)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    
    success = [r for r in results if r[0] == 200]
    failed = [r for r in results if r[0] != 200]
    print(f"Başarılı: {len(success)}")
    print(f"Başarısız/Zaman Aşımı: {len(failed)}")
    if success:
        avg_time = sum(r[1] for r in success) / len(success)
        print(f"Ortalama Süre: {avg_time:.2f} sn")

if __name__ == "__main__":
    main()
