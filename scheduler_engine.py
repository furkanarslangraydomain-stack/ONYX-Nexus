import sqlite3
import time
import asyncio
import logging

logger = logging.getLogger(__name__)

class CronScheduler:
    """
    Webhook & Kullanıcı Tanımlı Zamanlayıcı (Cron Tasks)
    Belirtilen aralıklarla Otonom Ajanları tetikler.
    """
    def __init__(self, db_path="memory.db", llm_router=None):
        self.db_path = db_path
        self.router = llm_router
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path, timeout=30.0)

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cron_tasks(
                    id TEXT PRIMARY KEY,
                    prompt TEXT,
                    interval_minutes INTEGER,
                    last_run TIMESTAMP,
                    is_active BOOLEAN
                )
            """)
            conn.commit()

    def add_task(self, task_id, prompt, interval_minutes):
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO cron_tasks (id, prompt, interval_minutes, last_run, is_active) VALUES (?, ?, ?, ?, ?)",
                (task_id, prompt, interval_minutes, 0, True)
            )
            conn.commit()
        logger.info(f"[Cron Scheduler] Yeni görev eklendi: {task_id} (Her {interval_minutes} dakikada)")

    async def _execute_task(self, task_id, prompt):
        logger.info(f"[Cron Scheduler] Görev Başlıyor: {task_id}")
        if not self.router: return
        
        system_prompt = "Sen zamanlanmış bir otonom ajansın (Cron Job). Kullanıcının belirlediği periyodik görevi yerine getiriyorsun. Sadece sonucu raporla."
        response = await self.router.call_llm_with_fallback(system_prompt, prompt)
        
        # Sonucu hafızaya yaz
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO chat_messages (id, role, content, agent_process) VALUES (?, ?, ?, ?)",
                (f"cron_{int(time.time())}", "assistant", f"**[ZAMANLANMIŞ GÖREV RAPORU: {task_id}]**\n{response}", "Cron Job Tamamlandı")
            )
            conn.commit()

    async def run_scheduler_loop(self):
        while True:
            try:
                now = time.time()
                tasks_to_run = []
                with self._get_connection() as conn:
                    cursor = conn.execute("SELECT id, prompt, interval_minutes, last_run FROM cron_tasks WHERE is_active = 1")
                    for row in cursor:
                        task_id, prompt, interval_minutes, last_run = row
                        # last_run is in epoch seconds
                        if (now - last_run) >= (interval_minutes * 60):
                            tasks_to_run.append((task_id, prompt))
                            conn.execute("UPDATE cron_tasks SET last_run = ? WHERE id = ?", (now, task_id))
                    conn.commit()

                for tid, tprompt in tasks_to_run:
                    asyncio.create_task(self._execute_task(tid, tprompt))

            except Exception as e:
                logger.error(f"[Cron Scheduler] Döngü hatası: {e}")
            
            await asyncio.sleep(60) # Her 1 dakikada bir kontrol et
