import sqlite3
import re
import time
from typing import List, Dict

class AdvancedMemoryScanner:
    """
    Kusursuz Bağlam Belleği Tarayıcısı (Advanced Context Memory Scanner)
    SQLite FTS5 ve BM25 algoritması ile gelişmiş tam metin semantik arama yapar.
    """
    def __init__(self, db_path="memory.db"):
        self.db_path = db_path
        self._ensure_fts_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_fts_tables(self):
        with self._get_connection() as conn:
            try:
                # chat_messages için FTS5 (Full Text Search) sanal tablosunu oluştur
                conn.execute("""
                    CREATE VIRTUAL TABLE IF NOT EXISTS chat_messages_fts USING fts5(
                        id UNINDEXED,
                        role UNINDEXED,
                        content,
                        content='chat_messages',
                        content_rowid='rowid'
                    );
                """)
                # İçeriği her zaman güncel tutmak için veritabanı tetikleyicileri (Triggers)
                conn.executescript("""
                    CREATE TRIGGER IF NOT EXISTS chat_messages_ai AFTER INSERT ON chat_messages BEGIN
                        INSERT INTO chat_messages_fts(rowid, content) VALUES (new.rowid, new.content);
                    END;
                    CREATE TRIGGER IF NOT EXISTS chat_messages_ad AFTER DELETE ON chat_messages BEGIN
                        INSERT INTO chat_messages_fts(chat_messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
                    END;
                    CREATE TRIGGER IF NOT EXISTS chat_messages_au AFTER UPDATE ON chat_messages BEGIN
                        INSERT INTO chat_messages_fts(chat_messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
                        INSERT INTO chat_messages_fts(rowid, content) VALUES (new.rowid, new.content);
                    END;
                """)
                # Mevcut verileri senkronize et (Eğer boşsa)
                cursor = conn.execute("SELECT count(*) FROM chat_messages_fts")
                if cursor.fetchone()[0] == 0:
                    conn.execute("INSERT INTO chat_messages_fts(rowid, content) SELECT rowid, content FROM chat_messages")
                conn.commit()
            except Exception as e:
                print(f"FTS Senkronizasyon Hatası: {e}")

    def extract_keywords(self, text: str) -> str:
        # Türkçe ve İngilizce stop-word'leri filtrele
        stopwords = {"bir", "ve", "ile", "için", "bu", "şu", "o", "mi", "mu", "ne", "nasıl", "neden", "bana", "yaz", "yap", "et", "the", "a", "an", "is", "in", "on", "at", "to"}
        words = re.findall(r'\w+', text.lower())
        keywords = [w for w in words if w not in stopwords and len(w) > 2]
        
        # Sadece OR (Veya) mantığı ile çoklu kelime taraması
        return " OR ".join(keywords) if keywords else ""

    def scan_context(self, query: str, limit: int = 5) -> Dict[str, List[Dict]]:
        fts_query = self.extract_keywords(query)
        results = {"chat": [], "tasks": []}
        if not fts_query:
            return results

        with self._get_connection() as conn:
            # 1. Sohbet Geçmişi BM25 Taraması
            try:
                chat_cursor = conn.execute(f"""
                    SELECT c.role, c.content, c.created_at, rank as score
                    FROM chat_messages_fts f
                    JOIN chat_messages c ON f.rowid = c.rowid
                    WHERE chat_messages_fts MATCH ?
                    ORDER BY rank LIMIT ?
                """, (fts_query, limit))
                
                for row in chat_cursor:
                    results["chat"].append({
                        "role": row["role"],
                        "content": row["content"],
                        "created_at": row["created_at"] if "created_at" in row.keys() else "",
                        "relevance_score": round(row["score"], 4)
                    })
            except Exception as e:
                pass # Match sözdizimi hatasını yok say

            # 2. Görev ve Kod Belleği BM25 Taraması
            try:
                task_cursor = conn.execute(f"""
                    SELECT task_prompt, code, status, rank as score
                    FROM agent_memory
                    WHERE agent_memory MATCH ?
                    ORDER BY rank LIMIT ?
                """, (fts_query, limit))
                
                for row in task_cursor:
                    code_str = str(row["code"]) if row["code"] else ""
                    results["tasks"].append({
                        "prompt": row["task_prompt"],
                        "code_snippet": code_str[:150] + "..." if len(code_str) > 150 else code_str,
                        "status": row["status"],
                        "relevance_score": round(row["score"], 4)
                    })
            except Exception as e:
                pass

        return results
        
    def build_context_string(self, query: str) -> str:
        scanned = self.scan_context(query)
        context = ""
        
        if scanned["chat"]:
            context += "[BM25 İLGİLİ GEÇMİŞ SOHBETLER]\n"
            for c in scanned["chat"]:
                role = "Kullanıcı" if c["role"] == "user" else "Onyx-Nexus"
                context += f"{role}: {c['content']}\\n"
                
        if scanned["tasks"]:
            context += "\n[BM25 İLGİLİ GÖREV VE KOD BELLEĞİ]\n"
            for t in scanned["tasks"]:
                context += f"Görev: {t['prompt']}\\nDurum: {t['status']}\\nKod: {t['code_snippet']}\\n"
        
        return context

if __name__ == "__main__":
    scanner = AdvancedMemoryScanner()
    print("Memory Scanner Module Loaded.")
