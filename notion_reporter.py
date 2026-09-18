import os
import httpx
import logging

logger = logging.getLogger(__name__)

class NotionReporter:
    """
    Notion Entegrasyon Modülü.
    Ajanların ürettiği önemli raporları, proje planlarını veya logları kullanıcının Notion veritabanına kaydeder.
    """
    def __init__(self):
        self.api_key = os.environ.get("NOTION_API_KEY", "")
        self.database_id = os.environ.get("NOTION_DATABASE_ID", "")
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

    def is_configured(self):
        return bool(self.api_key and self.database_id)

    async def check_connection(self) -> bool:
        """Notion API'sine bağlantı ve yetki testi yapar."""
        if not self.is_configured():
            return False
        async with httpx.AsyncClient() as client:
            try:
                # Kullanıcıları listele (API test için en basit endpoint)
                response = await client.get(f"{self.base_url}/users", headers=self.headers, timeout=10)
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Notion API Connection Error: {e}")
                return False

    async def log_to_notion(self, title: str, content: str) -> str:
        """Belirtilen Database'e yeni bir sayfa (kayıt) ekler."""
        if not self.is_configured():
            return "Notion yapılandırılmamış (API Key veya Database ID eksik)."

        # Content çok uzunsa Notion'un blok limitine takılabilir, o yüzden kırpalım
        safe_content = content[:1500] + ("..." if len(content) > 1500 else "")

        payload = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Name": {
                    "title": [
                        {"text": {"content": title}}
                    ]
                }
            },
            "children": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {"type": "text", "text": {"content": safe_content}}
                        ]
                    }
                }
            ]
        }
        
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(f"{self.base_url}/pages", headers=self.headers, json=payload, timeout=10)
                if res.status_code == 200:
                    page_url = res.json().get("url", "URL bulunamadı")
                    return f"Rapor Notion'a başarıyla kaydedildi: {page_url}"
                else:
                    return f"Notion Kayıt Hatası: {res.status_code} - {res.text}"
            except Exception as e:
                return f"Notion Bağlantı Hatası: {e}"

if __name__ == "__main__":
    print("Notion Reporter Modülü Yüklendi.")
