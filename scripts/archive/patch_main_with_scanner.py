import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Import and init Scanner
if "from memory_scanner import AdvancedMemoryScanner" not in content:
    content = content.replace("import time\nimport asyncio", "import time\nimport asyncio\nfrom memory_scanner import AdvancedMemoryScanner")
    content = content.replace("agent_memory = SQLiteAgentMemory()", "agent_memory = SQLiteAgentMemory()\nmemory_scanner = AdvancedMemoryScanner()")

# 2. Integrate into Chat Completion Endpoint
old_chat = """        # Fetch last 10 messages to prevent context drift but keep memory
        history_str = ""
        with agent_memory._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT role, content FROM chat_messages ORDER BY created_at DESC LIMIT 10")
            history = cursor.fetchall()
            history.reverse()
            for r in history:
                role = "Kullanıcı" if r[0] == "user" else "Onyx-Nexus"
                history_str += f"{role}: {r[1][:500]}\\n" # limit length per msg"""

new_chat = """        # Akıllı Bellek Taraması ve BM25 ile Geçmiş Bağlam (Context) Yüklemesi
        # Sadece son 5 kronolojik mesajı alıp, geri kalan eksik bilgiyi BM25 ile tamamlarız
        history_str = ""
        with agent_memory._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT role, content FROM chat_messages ORDER BY created_at DESC LIMIT 5")
            history = cursor.fetchall()
            history.reverse()
            for r in history:
                role = "Kullanıcı" if r[0] == "user" else "Onyx-Nexus"
                history_str += f"{role}: {r[1][:400]}\\n"
        
        # Otonom Tarayıcı ile Uzun Vadeli Semantik Hafıza (Long-Term Semantic Memory) Çağrısı
        semantic_memory = memory_scanner.build_context_string(prompt)
        
        history_str = semantic_memory + "\\n[SON 5 MESAJ (Kısa Vadeli Hafıza)]\\n" + history_str"""

if "Akıllı Bellek Taraması" not in content:
    content = content.replace(old_chat, new_chat)


with open("main.py", "w") as f:
    f.write(content)
print("main.py başarıyla yeni Memory Scanner'a bağlandı.")
