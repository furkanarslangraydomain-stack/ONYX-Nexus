import os
import re
import time
import json
import math
import sqlite3
import logging
from functools import lru_cache
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Optional Upstream Integrations (Safe Fallback)
try:
    from integrations.memory_backends import optional_memory_backend, optional_vector_backend
    from integrations.optional_backends import get_integration_registry
except Exception:
    def optional_memory_backend():
        return None
    def optional_vector_backend():
        return None
    def get_integration_registry():
        return None


class LightweightVectorDB:
    """
    Yerel (Local) Vektör Veritabanı ve Embeddings Motoru.
    Pinecone/Milvus gerektirmez. HuggingFace 'sentence-transformers' kütüphanesini kullanır.
    İsteğe bağlı olarak LanceDB (VECTOR_BACKEND=lancedb) ile sorunsuz hibrit çalışır.
    """
    def __init__(self, db_path: str = "memory.db"):
        self.db_path = db_path
        self.model = None
        self.lancedb_backend = optional_vector_backend() if os.getenv("VECTOR_BACKEND", "sqlite").lower() == "lancedb" else None
        self._init_db()

    def _init_db(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS vector_memory(
                        id TEXT PRIMARY KEY,
                        content TEXT,
                        vector TEXT
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.warning(f"[Vector DB] SQLite vector_memory init warning: {e}")

    def _load_model(self):
        if not self.model:
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("[Vector DB] SentenceTransformer modeli başarıyla yüklendi.")
            except ImportError:
                logger.warning("[Vector DB] 'sentence-transformers' kütüphanesi yok. Pasif modda çalışacak.")
                self.model = "fallback"

    def get_embedding(self, text: str) -> list:
        self._load_model()
        if self.model == "fallback":
            return [0.0] * 384
        try:
            return self.model.encode(text).tolist()
        except Exception:
            return [0.0] * 384

    def add_document(self, doc_id: str, content: str):
        vec = self.get_embedding(content)
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO vector_memory (id, content, vector) VALUES (?, ?, ?)",
                    (doc_id, content, json.dumps(vec))
                )
                conn.commit()
        except Exception as e:
            logger.warning(f"[Vector DB] Insert failed: {e}")

        if self.lancedb_backend is not None:
            try:
                self.lancedb_backend.add(doc_id, content, vec)
            except Exception as exc:
                logger.warning(f"[Vector DB] LanceDB add fallback failed: {exc}")

    def cosine_similarity(self, v1, v2):
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    def search(self, query: str, top_k: int = 2):
        q_vec = self.get_embedding(query)
        if sum(q_vec) == 0.0:
            # Fallback mode
            return []

        if self.lancedb_backend is not None:
            try:
                results = self.lancedb_backend.search(q_vec, top_k=top_k)
                if results:
                    return results
            except Exception as exc:
                logger.warning(f"[Vector DB] LanceDB search fallback failed: {exc}")

        results = []
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("SELECT id, content, vector FROM vector_memory")
                for row in cursor:
                    vec = json.loads(row[2])
                    sim = self.cosine_similarity(q_vec, vec)
                    results.append({"id": row[0], "content": row[1], "score": sim})
            results.sort(key=lambda x: x["score"], reverse=True)
        except Exception as e:
            logger.warning(f"[Vector DB] Search query error: {e}")

        return results[:top_k]


class ContextCompactor:
    """
    Otomatik Bağlam Sıkıştırma Motoru (Memory Context Compactor).
    Sohbet ve ajan adımları uzadığında token aşımını önlemek için geçmişi kayıpsız
    özetler, önemli teknik kararları ve kod bloklarını koruyarak vektör tabanına indeksler.
    """
    def __init__(self, vector_db: LightweightVectorDB = None, max_token_limit: int = 3500):
        self.vector_db = vector_db
        self.max_token_limit = max_token_limit

    def estimate_tokens(self, text_or_messages) -> int:
        if isinstance(text_or_messages, str):
            return max(1, len(text_or_messages) // 4)
        total = 0
        for m in text_or_messages:
            content = m.get("content", "") if isinstance(m, dict) else getattr(m, "content", "")
            if isinstance(content, str):
                total += len(content) // 4
            elif isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and "text" in part:
                        total += len(part["text"]) // 4
        return max(1, total)

    def compact_messages(self, messages: list, keep_recent: int = 4) -> tuple:
        """
        Gerektiğinde eski mesajları sıkıştırır.
        Dönen değer: (compacted_messages, is_compacted, summary_text)
        """
        token_count = self.estimate_tokens(messages)
        if token_count <= self.max_token_limit or len(messages) <= (keep_recent + 1):
            return messages, False, ""

        system_msgs = [m for m in messages if (m.get("role") if isinstance(m, dict) else getattr(m, "role", "")) == "system"]
        non_system = [m for m in messages if (m.get("role") if isinstance(m, dict) else getattr(m, "role", "")) != "system"]

        if len(non_system) <= keep_recent:
            return messages, False, ""

        to_compress = non_system[:-keep_recent]
        recent_to_keep = non_system[-keep_recent:]

        summary_lines = []
        for idx, m in enumerate(to_compress):
            role = m.get("role") if isinstance(m, dict) else getattr(m, "role", "user")
            content = m.get("content", "") if isinstance(m, dict) else getattr(m, "content", "")
            if not isinstance(content, str):
                content = str(content)
            has_code = "```" in content
            first_line = content.strip().split("\n")[0][:100]
            summary_lines.append(f"Turn {idx+1} ({role}): {first_line}{' [KOD İÇERİR]' if has_code else ''}")

        summary_text = (
            "--- [OTOMATİK SIKIŞTIRILMIŞ BAĞLAM (COMPACTED CONTEXT)] ---\n"
            + f"Önceki {len(to_compress)} mesaj jeton tasarrufu için özetlendi:\n"
            + "\n".join(summary_lines[:15])
            + "\n----------------------------------------------------------"
        )

        if self.vector_db:
            try:
                doc_id = f"compact_{int(time.time())}"
                full_to_compress_text = "\n".join([str(m) for m in to_compress])
                self.vector_db.add_document(doc_id, full_to_compress_text)
            except Exception as e:
                logger.warning(f"Bağlam vektör tabanına kaydedilemedi: {e}")

        compacted_entry = {
            "role": "system",
            "content": f"Önceki konuşma bağlam özeti:\n{summary_text}"
        }

        result = system_msgs + [compacted_entry] + recent_to_keep
        return result, True, summary_text


class SQLiteAgentMemory:
    """
    Optimized SQLite Full-Text Search (FTS5) persistent memory.
    Uses WAL (Write-Ahead Logging) and busy_timeout to prevent database locks.
    İsteğe bağlı olarak Mem0 (MEMORY_BACKEND=mem0) adaptörü ile çift katmanlı çalışır.
    """
    def __init__(self, db_path: str = "memory.db"):
        self.db_path = db_path
        self.mem0_backend = optional_memory_backend() if os.getenv("MEMORY_BACKEND", "sqlite").lower() == "mem0" else None
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def _init_db(self):
        try:
            with self._get_connection() as conn:
                conn.executescript("""
                    CREATE VIRTUAL TABLE IF NOT EXISTS agent_memory USING fts5(
                        task_prompt,
                        blueprint,
                        code,
                        status,
                        engine,
                        created_at UNINDEXED
                    );
                    CREATE TABLE IF NOT EXISTS chat_messages(
                        id TEXT PRIMARY KEY,
                        role TEXT,
                        content TEXT,
                        image_data TEXT,
                        html_preview TEXT,
                        agent_process TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                conn.commit()
        except Exception as e:
            logger.warning(f"SQLite FTS5 init warning: {e}")

    def add_entry(self, prompt: str, blueprint: str, code: str, status: str, engine: str):
        self.search_similar.cache_clear()
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO agent_memory (task_prompt, blueprint, code, status, engine, created_at)
                    VALUES (?, ?, ?, ?, ?, ?);
                """, (prompt, blueprint, code, status, engine, str(int(time.time()))))
                conn.commit()
        except Exception as e:
            logger.warning(f"Failed to record to SQLite memory: {e}")

        if self.mem0_backend is not None:
            try:
                self.mem0_backend.add([
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": blueprint + "\n" + code},
                ], user_id=os.getenv("MEMORY_USER_ID", "onyx-user"))
            except Exception as exc:
                logger.warning(f"Mem0 add_entry fallback failed: {exc}")

    @lru_cache(maxsize=4096)
    def search_similar(self, query: str, limit: int = 5) -> List[Dict[str, str]]:
        clean_q = re.sub(r'[^a-zA-Z0-9_\s]', ' ', query).strip()
        tokens = [t for t in clean_q.split() if len(t) > 3][:4]
        if not tokens:
            return []
        match_query = " OR ".join(tokens)

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT task_prompt, code, status FROM agent_memory
                    WHERE agent_memory MATCH ? AND status = 'SUCCESS'
                    ORDER BY rank LIMIT ?;
                """, (match_query, limit))
                rows = cursor.fetchall()
                if rows:
                    return [{"prompt": r[0], "code": r[1], "status": r[2]} for r in rows]
        except Exception:
            pass

        if self.mem0_backend is not None:
            try:
                raw = self.mem0_backend.search(query, user_id=os.getenv("MEMORY_USER_ID", "onyx-user"), limit=limit)
                if isinstance(raw, list):
                    mapped = []
                    for item in raw:
                        content = item.get("memory") or item.get("content") or item.get("text") or ""
                        if content:
                            mapped.append({"prompt": query, "code": content, "status": "SUCCESS"})
                    if mapped:
                        return mapped
                elif isinstance(raw, dict):
                    memory = raw.get("memory") or raw.get("content") or raw.get("text") or ""
                    if memory:
                        return [{"prompt": query, "code": memory, "status": "SUCCESS"}]
            except Exception as exc:
                logger.warning(f"Mem0 search fallback failed: {exc}")

        return []

    def get_recent_entries(self, limit: int = 20) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT rowid, task_prompt, status, engine, created_at FROM agent_memory
                    ORDER BY rowid DESC LIMIT ?;
                """, (limit,))
                rows = cursor.fetchall()
                return [
                    {
                        "id": r[0],
                        "prompt": r[1],
                        "status": r[2],
                        "engine": r[3],
                        "created_at": r[4],
                    }
                    for r in rows
                ]
        except Exception:
            return []

    def clear_all(self) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM agent_memory;")
                conn.commit()
            return True
        except Exception:
            return False


if __name__ == "__main__":
    db = LightweightVectorDB("test_vector.db")
    compactor = ContextCompactor(vector_db=db)
    mem = SQLiteAgentMemory("test_memory.db")
    print("ONYX-Nexus Vector DB & Context Compactor & SQLite FTS5 Memory successfully initialized.")
