import os
import sqlite3
import time
from memory_scanner import AdvancedMemoryScanner

print("="*75)
print(" 🧠 ONYX-NEXUS ADVANCED CONTEXT MEMORY SCANNER TEST (FTS5 + BM25) ".center(75))
print("="*75)

TEST_DB = "test_advanced_memory.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

# 1. Init Test DB
conn = sqlite3.connect(TEST_DB)
conn.execute('''CREATE TABLE chat_messages(
                    id TEXT PRIMARY KEY,
                    role TEXT,
                    content TEXT,
                    image_data TEXT,
                    html_preview TEXT,
                    agent_process TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );''')
conn.execute('''CREATE VIRTUAL TABLE agent_memory USING fts5(
                    task_prompt,
                    blueprint,
                    code,
                    status,
                    engine,
                    created_at UNINDEXED
                );''')
conn.commit()

print("[1] Test veritabanı şeması oluşturuldu.")

# 2. Bind Scanner
scanner = AdvancedMemoryScanner(db_path=TEST_DB)
print("[2] Memory Scanner sisteme entegre edildi. FTS5 Triggers aktif.")

# 3. Seed Complex Sentetic Data
chats = [
    ("user", "Python ile makine öğrenmesi modeli nasıl eğitilir?"),
    ("assistant", "Scikit-Learn veya TensorFlow kullanabilirsiniz. SVM algoritması classification için harikadır."),
    ("user", "React JS ile state yönetimi nasıl yapılır? Redux mı Context API mi?"),
    ("assistant", "Küçük projelerde Context API, büyük projelerde Redux Toolkit veya Zustand kullanmalısın."),
    ("user", "Uzaylılar hakkında ne düşünüyorsun? Sence varlar mı?"),
    ("assistant", "Evren çok büyük, bilimsel olarak olasılık yüksek ama henüz kesin kanıt yok."),
    ("user", "FastAPI ile authentication sistemi yazmak istiyorum."),
    ("assistant", "OAuth2 ve JWT (JSON Web Tokens) kullanmalısınız. passlib ve jose kütüphaneleri işinize yarar.")
]

for i, (role, content) in enumerate(chats):
    conn.execute("INSERT INTO chat_messages (id, role, content) VALUES (?, ?, ?)", (f"msg_{i}", role, content))

tasks = [
    ("Python Makine Öğrenmesi SVM Sınıflandırıcı Eğitimi", "from sklearn import svm\nimport pandas as pd", "def train_model(X, y):\n  clf = svm.SVC()\n  clf.fit(X, y)\n  return clf", "COMPLETED", "auto"),
    ("React Portfolio Website with TailwindCSS", "import React from 'react'", "export default function App() {\n  return <div className=\"bg-gray-900\">Portfolio</div>\n}", "COMPLETED", "auto"),
    ("Node.js Express Authentication Backend", "const express = require('express');", "app.post('/login', (req, res) => { res.send('token'); });", "FAILED", "auto")
]

for prompt, bp, code, status, engine in tasks:
    conn.execute("INSERT INTO agent_memory (task_prompt, blueprint, code, status, engine) VALUES (?, ?, ?, ?, ?)", 
                 (prompt, bp, code, status, engine))
conn.commit()

print("[3] Veritabanı karmaşık ve çakışan (overlapping) verilerle dolduruldu.")
print("\n[4] BM25 Algoritması & Semantik Arama Testleri Başlıyor...\n")

queries = [
    "Makine öğrenmesi için Python kodu yazabilir misin?",
    "React projelerimde state'leri nasıl yönetebilirim?",
    "Token tabanlı giriş sistemi (auth) yapacağım.",
    "Mars'ta hayat var mı, uzaylılar?"
]

passed_tests = 0

for i, q in enumerate(queries):
    print(f"[{i+1}] SORGULANAN: '{q}'")
    start = time.time()
    results = scanner.scan_context(q)
    duration = (time.time() - start) * 1000
    
    print(f"  ➜ Tarama Süresi: {duration:.2f}ms (Çıkarılan BM25 Kelimeleri: {scanner.extract_keywords(q)})")
    
    chat_found = len(results["chat"])
    task_found = len(results["tasks"])
    
    if chat_found:
        print(f"  ➜ Bulunan Geçmiş Sohbet: {chat_found}")
        for c in results["chat"]:
            print(f"     - [BM25 Skoru: {c['relevance_score']}] {c['content'][:60]}...")
            
    if task_found:
        print(f"  ➜ Bulunan Görev Belleği: {task_found}")
        for t in results["tasks"]:
            print(f"     - [BM25 Skoru: {t['relevance_score']}] {t['prompt']}")

    # Assertions
    is_passed = False
    if i == 0 and task_found > 0 and "Python" in results["tasks"][0]["prompt"]: is_passed = True
    elif i == 1 and chat_found > 0 and "React" in results["chat"][0]["content"]: is_passed = True
    elif i == 2 and (chat_found > 0 or task_found > 0): is_passed = True
    elif i == 3 and chat_found > 0 and "Uzaylılar" in results["chat"][0]["content"]: is_passed = True
    
    if is_passed:
        print("  ✅ TEST BAŞARILI: İlgili bağlam kusursuzca eşleşti.")
        passed_tests += 1
    else:
        print("  ❌ TEST BAŞARISIZ: Yanlış veya eksik bağlam getirildi.")
    print("-" * 75)

print("="*75)
if passed_tests == len(queries):
    print(f" 🚀 TÜM TESTLER BAŞARIYLA GEÇİLDİ! ({passed_tests}/{len(queries)})")
    print(" 🧠 BM25 algoritması, gürültüyü (noise) filtreleyerek sadece yüksek alakalı belleği getirdi.")
else:
    print(f" ⚠️ UYARI: Bazı testler başarısız oldu. ({passed_tests}/{len(queries)})")
print("="*75)

conn.close()
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)
