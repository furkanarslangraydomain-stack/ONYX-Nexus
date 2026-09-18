import sqlite3
import json
import time
import logging

logger = logging.getLogger(__name__)

class ContinuousFineTuningEngine:
    """
    Sistemi herhangi bir konuda 'eğitmek' (Fine-Tuning) için dinamik RAG tabanlı öğrenme motoru.
    Kullanıcı sisteme yeni kurallar veya bilgiler öğrettiğinde, bu bilgiler vektör uzayına
    kaydedilir ve ilgili bir konu açıldığında LLM'in ana promptuna 'Mutlak Kural' olarak enjekte edilir.
    """
    def __init__(self, vector_db, db_path="memory.db"):
        self.vdb = vector_db
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS fine_tuned_knowledge(
                    id TEXT PRIMARY KEY,
                    topic TEXT,
                    content TEXT,
                    vector TEXT
                )
            """)
            conn.commit()

    def learn(self, topic: str, content: str) -> str:
        """Yeni bir bilgi veya kural öğrenir."""
        vec = self.vdb.get_embedding(topic + " " + content)
        doc_id = f"ft_{int(time.time())}"
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO fine_tuned_knowledge (id, topic, content, vector) VALUES (?, ?, ?, ?)",
                (doc_id, topic, content, json.dumps(vec))
            )
            conn.commit()
        logger.info(f"[Fine-Tuning] Yeni bilgi öğrenildi: {topic}")
        return doc_id

    def get_relevant_knowledge(self, query: str, top_k: int = 2) -> str:
        """Sorguyla eşleşen öğrenilmiş kuralları getirir."""
        q_vec = self.vdb.get_embedding(query)
        if sum(q_vec) == 0.0:
            return "" # Fallback mode active, no vector math possible
            
        results = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT topic, content, vector FROM fine_tuned_knowledge")
            for row in cursor:
                vec = json.loads(row[2])
                sim = self.vdb.cosine_similarity(q_vec, vec)
                results.append({"topic": row[0], "content": row[1], "score": sim})
                
        results.sort(key=lambda x: x["score"], reverse=True)
        
        # Sadece belirli bir benzerlik eşiğini geçen kuralları al (ör. 0.25)
        filtered_results = [r for r in results if r["score"] > 0.25][:top_k]
        
        if not filtered_results:
            return ""
            
        context = "\n[KULLANICI TARAFINDAN ÖĞRETİLEN ÖZEL KURALLAR (CONTINUOUS FINE-TUNING)]\nBu kurallar senin ana eğitiminin önüne geçer, MÜTLAK UYMALISIN:\n"
        for r in filtered_results:
            context += f"- Konu ({r['topic']}): {r['content']}\n"
        return context

if __name__ == "__main__":
    print("Fine Tuning Engine loaded.")
