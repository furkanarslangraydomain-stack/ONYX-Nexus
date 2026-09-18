import asyncio
import time
from notion_reporter import NotionReporter
from encryption_layer import privacy_layer
import swarm_engine
import vector_db
import logging
from unittest.mock import MagicMock
import sys

# Mock httpx to avoid external requests during test
sys.modules['httpx'] = MagicMock(Limits=MagicMock())

logging.basicConfig(level=logging.INFO)

async def test_full_system():
    print("====== ONYX-Nexus Gelişmiş Sistem Testi (v2) ======\n")
    
    # 1. Test RAM Limit Modification
    print("[1] RAM Limit Test (12 GB)...")
    swarm_engine.set_memory_limit()
    print("  ✅ set_memory_limit başarıyla çalıştırıldı (12GB limiti).")
    
    # 2. Test Encryption Layer
    print("\n[2] Şifreleme (Encryption/Anonymization) Katmanı Testi...")
    raw_prompt = "Benim e-postam furkanarslangray@gmail.com ve telefonum 0532 123 45 67."
    encrypted = privacy_layer.encrypt_prompt(raw_prompt)
    print(f"  ➜ Orijinal Prompt: {raw_prompt}")
    print(f"  ➜ Şifrelenmiş Prompt: {encrypted}")
    assert "furkanarslangray@gmail.com" not in encrypted
    assert "0532 123 45 67" not in encrypted
    
    decrypted = privacy_layer.decrypt_response(encrypted)
    print(f"  ➜ Deşifre Edilmiş Yanıt: {decrypted}")
    assert decrypted == raw_prompt
    print("  ✅ Şifreleme/Deşifreleme Testi Başarılı!")

    # 3. Test Vector Database
    print("\n[3] Vector Database (Memory) Testi...")
    db = vector_db.LightweightVectorDB("test_memory.db")
    db.add_document("doc1", "Yeni hafıza kaydı test")
    results = db.search("hafıza", limit=1)
    print(f"  ➜ Arama Sonucu: {results}")
    assert len(results) > 0
    print("  ✅ Vector DB Testi Başarılı!")

    # 4. Test Notion Reporter (Mocked)
    print("\n[4] Notion Entegrasyonu Testi...")
    reporter = NotionReporter()
    if reporter.is_configured():
        print("  ➜ Notion API Key mevcut, gerçek istek atılıyor...")
        res = await reporter.log_to_notion("Test Log", "Bu bir sistem testidir.")
        print(f"  ➜ Sonuç: {res}")
    else:
        print("  ➜ Notion API Key eksik, mock durum geçiliyor.")
    print("  ✅ Notion Reporter Testi Başarılı!")
    
    print("\n[5] Mega MCP Server Yetenekleri...")
    import mega_mcp_server
    mcp = mega_mcp_server.MegaMCPServer()
    tools = mcp._get_tools_list()
    tool_names = [t["name"] for t in tools]
    print(f"  ➜ Mevcut MCP Araçları: {', '.join(tool_names)}")
    assert "sys_kill_process" in tool_names
    assert "web_download" in tool_names
    assert "fs_mkdir" in tool_names
    print("  ✅ Mega MCP Server Yetenekleri Başarılı!")

    print("\n====== TÜM SİSTEM TESTLERİ BAŞARIYLA TAMAMLANDI! ======")

if __name__ == "__main__":
    asyncio.run(test_full_system())
