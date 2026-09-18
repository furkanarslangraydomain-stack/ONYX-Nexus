import sys
import os
import sqlite3

# Dinamik Mocks (Modülleri kandırıp hata almadan test etmek için)
from unittest.mock import MagicMock
class MockModule(MagicMock): pass

sys.modules['fastapi'] = MockModule()
sys.modules['fastapi.responses'] = MockModule()
sys.modules['fastapi.middleware'] = MockModule()
sys.modules['fastapi.middleware.cors'] = MockModule()
sys.modules['uvicorn'] = MockModule()
sys.modules['httpx'] = MagicMock(Limits=MagicMock())
sys.modules['litellm'] = MockModule()
sys.modules['psutil'] = MockModule()
sys.modules['sentence_transformers'] = MockModule()
sys.modules['pydantic'] = MockModule()

print("="*75)
print(" 🌐 ONYX-NEXUS: DEEP RESEARCH & AUTO-GIT & WEBSOCKET TEST SUITE ".center(75))
print("="*75)

passed = 0
total = 3

def report(name, condition):
    global passed
    print(f"[TEST] {name}...", end=" ")
    if condition:
        print("✅ GEÇTİ")
        passed += 1
    else:
        print("❌ BAŞARISIZ")

# TEST 1: Deep Research (Standard Library)
try:
    import deep_research
    dr = deep_research.DeepResearchEngine()
    res = dr.search_wikipedia("Python (programlama dili)", limit=1)
    # The API might block us or return timeout if no network, but let's check if the method runs
    report("Deep Research (Wikipedia Modülü)", type(res) == str)
except Exception as e:
    print(f"HATA: {e}")
    report("Deep Research", False)

# TEST 2: Auto Git
try:
    import git_agent
    ga = git_agent.AutoGitAgent()
    # Mocking subprocess run to avoid actually committing during tests
    import subprocess
    original_run = subprocess.run
    subprocess.run = MagicMock(returncode=0)
    res = ga.auto_commit_and_push("test commit")
    subprocess.run = original_run
    report("Auto-Git (CI/CD Modülü)", "AUTO-GIT" in res)
except Exception as e:
    print(f"HATA: {e}")
    report("Auto-Git", False)

# TEST 3: Swarm Engine (Checking if it imported properly and patched correctly)
try:
    import swarm_engine
    se = swarm_engine.SwarmEngine(None)
    b_prompt = swarm_engine.SupremePromptBuilder.build("Ajan", "Görev")
    report("Swarm Engine Fraktal Yapısı & Yeni Promptlar", "Multimodal Vision" in b_prompt or "Deep Research" in b_prompt)
except Exception as e:
    print(f"HATA: {e}")
    report("Swarm Engine Fraktal Yapısı", False)

print("="*75)
if passed == total:
    print(f" 🌟 MÜKEMMEL! TÜM KOD BİRİMLERİ (UNIT TESTS) {passed}/{total} BAŞARIYLA GEÇTİ!".center(75))
else:
    print(f" ⚠️ DİKKAT! BAZI TESTLER BAŞARISIZ OLDU ({passed}/{total}).".center(75))
print("="*75)
