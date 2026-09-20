import urllib.request
import urllib.parse
import json
import logging
import re

logger = logging.getLogger(__name__)

class DeepResearchEngine:
    """
    Otonom Ajanlar için Derin Araştırma (Deep Research) ve Web Gezinme Modülü.
    Dış kütüphane (pip) gerektirmeden saf Python ile çalışır.
    """
    def __init__(self):
        self.headers = {'User-Agent': 'Onyx-Nexus-Agent/1.0 (Autonomous Research Bot)'}

    def search_wikipedia(self, query: str, limit: int = 3) -> str:
        """Wikipedia üzerinde arama yapar ve özetleri getirir."""
        url = f"https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                results = data.get('query', {}).get('search', [])
                
                if not results:
                    return "Wikipedia'da sonuç bulunamadı."
                
                output = f"--- '{query}' İÇİN WIKIPEDIA ARAŞTIRMA SONUÇLARI ---\n"
                for i, r in enumerate(results[:limit]):
                    clean_snippet = re.sub(r'<[^>]+>', '', r['snippet']) # HTML taglerini temizle
                    output += f"{i+1}. {r['title']}: {clean_snippet}...\n"
                return output
        except Exception as e:
            return f"Araştırma Hatası (Wiki): {str(e)}"

    def fetch_webpage_text(self, url: str) -> str:
        """Verilen bir URL'in kaynak kodundaki metinleri kaba taslak çeker."""
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode(errors='ignore')
                # Basit HTML tag temizliği (BeautifulSoup olmadan)
                text = re.sub(r'<style.*?>.*?</style>', '', html, flags=re.DOTALL)
                text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
                text = re.sub(r'<[^>]+>', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()
                return text[:2000] + "... [Metin Kırpıldı]"
        except Exception as e:
            return f"Sayfa Okuma Hatası ({url}): {str(e)}"

if __name__ == "__main__":
    engine = DeepResearchEngine()
    print(engine.search_wikipedia("Yapay Zeka"))
