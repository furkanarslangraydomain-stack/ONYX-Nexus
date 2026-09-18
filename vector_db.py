import sqlite3
import json
import math
import logging

logger = logging.getLogger(__name__)

class LightweightVectorDB:
    """
    Yerel (Local) Vektör Veritabanı ve Embeddings Motoru.
    Pinecone/Milvus gerektirmez. HuggingFace 'sentence-transformers' kütüphanesini kullanır.
    """
    def __init__(self, db_path="memory.db"):
        self.db_path = db_path
        self.model = None
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS vector_memory(
                    id TEXT PRIMARY KEY,
                    content TEXT,
                    vector TEXT
                )
            """)
            conn.commit()

    def _load_model(self):
        if not self.model:
            try:
                from sentence_transformers import SentenceTransformer
                # all-MiniLM-L6-v2 is extremely fast and lightweight (~80MB)
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("[Vector DB] SentenceTransformer modeli başarıyla yüklendi.")
            except ImportError:
                logger.warning("[Vector DB] 'sentence-transformers' kütüphanesi yok. Vektör işlemleri pasif/sahte modda çalışacak.")
                self.model = "fallback"

    def get_embedding(self, text: str) -> list:
        self._load_model()
        if self.model == "fallback":
            return [0.0] * 384
        return self.model.encode(text).tolist()

    def add_document(self, doc_id: str, content: str):
        vec = self.get_embedding(content)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO vector_memory (id, content, vector) VALUES (?, ?, ?)",
                (doc_id, content, json.dumps(vec))
            )
            conn.commit()

    def cosine_similarity(self, v1, v2):
        dot = sum(a*b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a*a for a in v1))
        norm2 = math.sqrt(sum(b*b for b in v2))
        if norm1 == 0 or norm2 == 0: return 0.0
        return dot / (norm1 * norm2)

    def search(self, query: str, top_k=2):
        q_vec = self.get_embedding(query)
        if sum(q_vec) == 0.0: # Fallback mode
            return []

        results = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT id, content, vector FROM vector_memory")
            for row in cursor:
                vec = json.loads(row[2])
                sim = self.cosine_similarity(q_vec, vec)
                results.append({"id": row[0], "content": row[1], "score": sim})
                
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)

        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            import gc
            gc.collect()
        except:
            pass
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

        # Sistem mesajını ayır
        system_msgs = [m for m in messages if (m.get("role") if isinstance(m, dict) else getattr(m, "role", "")) == "system"]
        non_system = [m for m in messages if (m.get("role") if isinstance(m, dict) else getattr(m, "role", "")) != "system"]

        if len(non_system) <= keep_recent:
            return messages, False, ""

        to_compress = non_system[:-keep_recent]
        recent_to_keep = non_system[-keep_recent:]

        # Sıkıştırılacak bağlamdan kilit noktaları çıkar
        summary_lines = []
        for idx, m in enumerate(to_compress):
            role = m.get("role") if isinstance(m, dict) else getattr(m, "role", "user")
            content = m.get("content", "") if isinstance(m, dict) else getattr(m, "content", "")
            if not isinstance(content, str):
                content = str(content)
            # Kod blokları veya kısa özet
            has_code = "```" in content
            first_line = content.strip().split("\n")[0][:100]
            summary_lines.append(f"Turn {idx+1} ({role}): {first_line}{' [KOD İÇERİR]' if has_code else ''}")

        summary_text = (
            "--- [OTOMATİK SIKIŞTIRILMIŞ BAĞLAM (COMPACTED CONTEXT)] ---\n"
            + f"Önceki {len(to_compress)} mesaj jeton tasarrufu için özetlendi:\n"
            + "\n".join(summary_lines[:15])
            + "\n----------------------------------------------------------"
        )

        # Vektör veritabanına bağlamı kaydet (Gerektiğinde anlamsal aranabilir)
        if self.vector_db:
            try:
                import time
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

if __name__ == "__main__":
    db = LightweightVectorDB("test_vector.db")
    compactor = ContextCompactor(vector_db=db)
    print("Vector DB & Context Compactor Module initialized.")
