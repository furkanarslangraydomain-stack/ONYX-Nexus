import re

with open("main.py", "r") as f:
    content = f.read()

# Add chat_messages table to SQLiteAgentMemory
old_init_db = """                    CREATE VIRTUAL TABLE IF NOT EXISTS agent_memory USING fts5(
                        task_prompt,
                        blueprint,
                        code,
                        status,
                        engine,
                        created_at UNINDEXED
                    );"""
new_init_db = """                    CREATE VIRTUAL TABLE IF NOT EXISTS agent_memory USING fts5(
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
                    );"""

if "CREATE TABLE IF NOT EXISTS chat_messages" not in content:
    content = content.replace(old_init_db, new_init_db)

# Add endpoints for chat messages
endpoints_code = """
@app.get("/api/chat/history")
async def api_get_chat_history():
    try:
        with agent_memory._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, role, content, image_data, html_preview, agent_process FROM chat_messages ORDER BY created_at ASC")
            rows = cursor.fetchall()
            return [{"id": r[0], "role": r[1], "content": r[2], "imageData": r[3], "htmlPreview": r[4], "agentProcess": r[5]} for r in rows]
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        return []

@app.post("/api/chat/message")
async def api_save_chat_message(request: Request):
    try:
        data = await request.json()
        with agent_memory._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO chat_messages (id, role, content, image_data, html_preview, agent_process) VALUES (?, ?, ?, ?, ?, ?)",
                (data.get("id"), data.get("role"), data.get("content"), data.get("imageData"), data.get("htmlPreview"), data.get("agentProcess"))
            )
            conn.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        return {"status": "error", "message": str(e)}

@app.delete("/api/chat/history")
async def api_clear_chat_history():
    try:
        with agent_memory._get_connection() as conn:
            conn.execute("DELETE FROM chat_messages")
            conn.commit()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
"""

if "@app.get(\"/api/chat/history\")" not in content:
    # Insert before @app.get("/api/memory")
    content = content.replace("@app.get(\"/api/memory\")", endpoints_code + "\n@app.get(\"/api/memory\")")

with open("main.py", "w") as f:
    f.write(content)
print("Chat history endpoints injected.")
