import sys
import os
from unittest.mock import MagicMock
import sqlite3

print("="*75)
print(" 🧬 ONYX-NEXUS ULTIMATE ARCHITECTURAL UNIT TEST SUITE ".center(75))
print("="*75)

class MockModule(MagicMock): pass

mock_fastapi_mod = MockModule()
mock_fastapi_mod.FastAPI = lambda *args, **kwargs: MagicMock(
    post=lambda *a, **k: lambda f: f,
    get=lambda *a, **k: lambda f: f,
    on_event=lambda *a, **k: lambda f: f
)
mock_fastapi_mod.Request = MagicMock()
mock_fastapi_mod.HTTPException = Exception
mock_fastapi_mod.status = MagicMock()

class MockPydantic(MagicMock):
    class BaseModel: pass

sys.modules['fastapi'] = mock_fastapi_mod
sys.modules['fastapi.responses'] = MockModule()
sys.modules['fastapi.middleware'] = MockModule()
sys.modules['fastapi.middleware.cors'] = MockModule()
sys.modules['uvicorn'] = MockModule()
sys.modules['httpx'] = MagicMock(Limits=MagicMock())
sys.modules['litellm'] = MockModule()
sys.modules['psutil'] = MockModule()
sys.modules['sentence_transformers'] = MockModule()
sys.modules['pydantic'] = MockPydantic()

try:
    import main
    import memory_scanner
    import swarm_engine
    import scheduler_engine
    import vector_db
    import mega_mcp_server
    print("✅ Tüm Python Modülleri Başarıyla Yüklendi (Syntax Hatası Yok!).\n")
except Exception as e:
    print(f"❌ Modül Yükleme Hatası: {e}")
    sys.exit(1)

passed_tests = 0
total_tests = 5

def run_test(name, func):
    global passed_tests
    print(f"[{passed_tests+1}] TEST: {name}")
    try:
        func()
        print("  ➜ SONUÇ: ✅ GEÇTİ\n")
        passed_tests += 1
    except Exception as e:
        print(f"  ➜ SONUÇ: ❌ BAŞARISIZ ({e})\n")

def test_rate_limiter():
    rl = main.LocalRateLimiter()
    rl.add_request("openai", 100)
    assert not rl.is_rate_limited("openai", rpm_limit=2, tpm_limit=200, required_tokens=50), "Hatalı limit tetiklemesi"
    rl.add_request("openai", 60)
    assert rl.is_rate_limited("openai", rpm_limit=2, tpm_limit=200, required_tokens=10), "RPM Limiti çalışmıyor!"

def test_memory_scanner():
    db_path = "test_fts5_scanner.db"
    if os.path.exists(db_path): os.remove(db_path)
    scanner = memory_scanner.AdvancedMemoryScanner(db_path)
    with sqlite3.connect(db_path) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS chat_messages(id TEXT, role TEXT, content TEXT)")
        conn.execute("INSERT INTO chat_messages VALUES ('1', 'user', 'Merhaba Mars')")
        conn.commit()
    scanner._ensure_fts_tables()
    res = scanner.scan_context("Mars")
    assert len(res["chat"]) > 0, "FTS5 Arama sonuç getirmedi!"
    if os.path.exists(db_path): os.remove(db_path)

def test_vector_db():
    db_path = "test_vec.db"
    if os.path.exists(db_path): os.remove(db_path)
    vdb = vector_db.LightweightVectorDB(db_path)
    emb = vdb.get_embedding("yapay zeka")
    assert len(emb) == 384, "Embedding boyutu hatalı!"
    assert sum(emb) == 0.0, "Fallback mantığı devreye girmedi!"
    vdb.add_document("doc1", "yapay zeka")
    res = vdb.search("zeka")
    assert len(res) == 0, "Fallback modunda arama boş dönmeli"
    if os.path.exists(db_path): os.remove(db_path)

def test_swarm():
    se = swarm_engine.SwarmEngine(None)
    assert hasattr(se, 'execute_swarm'), "Swarm Engine methodu eksik"

def test_cron():
    db_path = "test_cron.db"
    if os.path.exists(db_path): os.remove(db_path)
    cron = scheduler_engine.CronScheduler(db_path, None)
    cron.add_task("task1", "Özetle", 60)
    with sqlite3.connect(db_path) as conn:
        cursor = conn.execute("SELECT interval_minutes FROM cron_tasks WHERE id='task1'")
        assert cursor.fetchone()[0] == 60, "Cron görevi DB'ye yazılamadı"
    if os.path.exists(db_path): os.remove(db_path)

run_test("Local Rate Limiter Algoritması (RPM/TPM)", test_rate_limiter)
run_test("FTS5+BM25 Memory Scanner Tetikleyicileri", test_memory_scanner)
run_test("Vector DB (SentenceTransformers) Fallback Mantığı", test_vector_db)
run_test("Swarm Engine Sınıf ve Metod Yapısı", test_swarm)
run_test("Cron Scheduler SQLite İşlemleri", test_cron)

print("="*75)
if passed_tests == total_tests:
    print(f" 🌟 MÜKEMMEL! TÜM KOD BİRİMLERİ (UNIT TESTS) {passed_tests}/{total_tests} BAŞARIYLA GEÇTİ!".center(75))
else:
    print(f" ⚠️ DİKKAT! BAZI TESTLER BAŞARISIZ OLDU ({passed_tests}/{total_tests}).".center(75))
print("="*75)
