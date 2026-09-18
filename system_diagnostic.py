import asyncio
import os
import sys
import logging

# Bağımlılıkları kontrol et
try:
    import httpx
    import litellm
except ImportError as e:
    print(f"KRİTİK HATA: Gerekli kütüphaneler eksik ({e}). Önce 'pip install -r requirements.txt' çalıştırın.")
    sys.exit(1)

from notion_reporter import NotionReporter
from git_agent import AutoGitAgent

logging.basicConfig(level=logging.INFO, format="%(message)s")

async def test_llm_api():
    print("\n[1] LLM Motoru (Onyx Router) Testi...")
    try:
        from main import FreeProviderRouter
        router = FreeProviderRouter()
        # Basit bir prompt gönderelim
        res = await router.call_llm_with_fallback("Sen bir test sistemisin.", "Bana sadece 'OK' de.", temperature=0.1, max_tokens=10)
        if "OK" in res.upper() or len(res) > 0:
            print("  ✅ LLM API Bağlantısı (Pollinations/OpenAI) Başarılı.")
        else:
            print("  ❌ LLM Yanıt Vermedi.")
    except Exception as e:
        print(f"  ❌ LLM Testi Hatası: {e}")

def test_e2b_sandbox():
    print("\n[2] E2B Cloud Sandbox Erişebilirliği...")
    e2b_key = os.environ.get("E2B_API_KEY")
    if not e2b_key:
        print("  ⚠️ E2B_API_KEY bulunamadı. Sistem varsayılan olarak 'Local Subprocess (Yerel)' Sandbox kullanacak.")
        # Local test
        try:
            from swarm_engine import execute_in_sandbox
            res = execute_in_sandbox("print('Local Sandbox OK')")
            if "Local Sandbox OK" in res:
                print("  ✅ Local Sandbox Bağlantısı Başarılı.")
            else:
                print("  ❌ Local Sandbox Başarısız.")
        except Exception as e:
            print(f"  ❌ Sandbox Testi Hatası: {e}")
        return

    print("  E2B_API_KEY algılandı. Cloud bağlantısı kuruluyor...")
    try:
        from e2b_code_interpreter import Sandbox
        with Sandbox(api_key=e2b_key) as sandbox:
            exec_res = sandbox.run_code("print('E2B OK')")
            if "E2B OK" in "".join(exec_res.logs.stdout):
                print("  ✅ E2B Cloud Sandbox Bağlantısı Başarılı.")
            else:
                print("  ❌ E2B Çıktısı Hatalı.")
    except ImportError:
        print("  ❌ 'e2b_code_interpreter' kütüphanesi yüklü değil. pip install e2b_code_interpreter")
    except Exception as e:
        print(f"  ❌ E2B Bağlantı Hatası (Key geçersiz olabilir): {e}")

async def test_notion_integration():
    print("\n[3] Notion Veritabanı Entegrasyonu...")
    notion = NotionReporter()
    if not notion.is_configured():
        print("  ⚠️ NOTION_API_KEY veya NOTION_DATABASE_ID eksik. Raporlama özelliği devre dışı.")
        return
    
    is_connected = await notion.check_connection()
    if is_connected:
        print("  ✅ Notion API Bağlantısı ve Yetkilendirme Başarılı.")
    else:
        print("  ❌ Notion API Bağlantısı Başarısız (Token geçersiz veya yetkisiz).")

def test_vector_memory():
    print("\n[4] Vektör Veritabanı (Memory) & Embedding Motoru...")
    try:
        from vector_db import LightweightVectorDB
        vdb = LightweightVectorDB("test_diag.db")
        vec = vdb.get_embedding("Test")
        if len(vec) == 384:
            print(f"  ✅ Embedding Modeli Başarılı (Boyut: {len(vec)}).")
        else:
            print("  ❌ Embedding boyutu beklenenden farklı.")
        os.remove("test_diag.db")
    except Exception as e:
        print(f"  ❌ Vektör DB Testi Hatası: {e}")

def test_git_agent():
    print("\n[5] Git Ajanı & Dizin Durumu...")
    try:
        git_bot = AutoGitAgent()
        res = git_bot.execute_command(["git", "status"])
        if "BAŞARILI" in res:
            print("  ✅ Git Reposu Aktif ve Erişilebilir.")
        else:
            print(f"  ❌ Git Durum Hatası: {res}")
    except Exception as e:
        print(f"  ❌ Git Ajanı Hatası: {e}")

async def run_all_tests():
    print("="*70)
    print(" 🛠️ ONYX-NEXUS SYSTEM READINESS DIAGNOSTIC (SİSTEM HAZIRLIK TESTİ) 🛠️ ")
    print("="*70)
    
    await test_llm_api()
    test_e2b_sandbox()
    await test_notion_integration()
    test_vector_memory()
    test_git_agent()

    print("\n" + "="*70)
    print(" 🎯 TEŞHİS (DIAGNOSTIC) TAMAMLANDI.")
    print("="*70)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
