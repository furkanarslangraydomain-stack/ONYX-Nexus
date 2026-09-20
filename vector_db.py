class SQLiteAgentMemory:
    """
    Optimized SQLite Full-Text Search (FTS5) persistent memory.
    Uses WAL (Write-Ahead Logging) and busy_timeout to prevent database locks.
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

    # Yüksek bellek kapasitesi için önbellek 4096 girdiye yükseltildi
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


agent_memory = SQLiteAgentMemory()
memory_scanner = AdvancedMemoryScanner()
vector_db = LightweightVectorDB()
context_compactor = ContextCompactor(vector_db=vector_db)
mega_mcp = MegaMCPServer()
notion_reporter = NotionReporter()
persona_engine = PersonaEngine()
deep_research_engine = DeepResearchEngine()
git_agent = AutoGitAgent()
fine_tuning_engine = ContinuousFineTuningEngine(vector_db=vector_db)

integration_registry = get_integration_registry()
