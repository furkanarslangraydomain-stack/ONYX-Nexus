import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Imports
if "from swarm_engine import SwarmEngine" not in content:
    content = content.replace("from memory_scanner import AdvancedMemoryScanner", 
"""from memory_scanner import AdvancedMemoryScanner
from swarm_engine import SwarmEngine
from scheduler_engine import CronScheduler
from vector_db import LightweightVectorDB""")

# 2. Init engines
if "swarm_engine =" not in content:
    content = content.replace("memory_scanner = AdvancedMemoryScanner()",
"""memory_scanner = AdvancedMemoryScanner()
vector_db = LightweightVectorDB()
swarm_engine = SwarmEngine(llm_router)
cron_scheduler = CronScheduler(llm_router=llm_router)""")

# 3. Add to startup event
if "cron_scheduler.run_scheduler_loop" not in content:
    old_startup = """@app.on_event("startup")
async def startup_event():
    logger.info("Başlangıç işlemleri ve Cron Job başlatılıyor...")
    asyncio.create_task(colab_keepalive_cron())"""
    new_startup = """@app.on_event("startup")
async def startup_event():
    logger.info("Başlangıç işlemleri, Keep-Alive ve Task Scheduler başlatılıyor...")
    asyncio.create_task(colab_keepalive_cron())
    asyncio.create_task(cron_scheduler.run_scheduler_loop())"""
    content = content.replace(old_startup, new_startup)

# 4. Integrate Swarm into tasks/submit
old_submit = """    if data.get("engine") == "local":
        response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, final_prompt)
    else:"""
new_submit = """    if data.get("engine") == "swarm":
        # Multi-Agent Debate
        response = await swarm_engine.execute_swarm(final_prompt)
    elif data.get("engine") == "local":
        response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, final_prompt)
    else:"""
if "engine\") == \"swarm\"" not in content:
    content = content.replace(old_submit, new_submit)
    
# 5. Integrate Vector DB to Chat Memory Trigger
old_chat = """        # Sonucu hafızaya yaz
        with agent_memory._get_connection() as conn:
            conn.execute(
                "INSERT INTO chat_messages (id, role, content, agent_process) VALUES (?, ?, ?, ?)",
                (f"cron_{int(time.time())}", "assistant", f"**[ZAMANLANMIŞ GÖREV RAPORU: {task_id}]**\\n{response}", "Cron Job Tamamlandı")
            )""" # This is in scheduler but let's actually just do it in POST /api/chat/message

new_chat_post = """@app.post("/api/chat/message")
async def api_save_chat_message(request: Request):
    try:
        data = await request.json()
        
        # Vektör DB'ye de asenkron/fire-and-forget ekle (Sadece user mesajları önemliyse)
        if data.get("role") == "user":
            vector_db.add_document(data.get("id", str(time.time())), data.get("content", ""))
            
        with agent_memory._get_connection() as conn:"""
if "vector_db.add_document" not in content:
    content = content.replace("""@app.post("/api/chat/message")
async def api_save_chat_message(request: Request):
    try:
        data = await request.json()
        with agent_memory._get_connection() as conn:""", new_chat_post)

# 6. Add API Endpoint for Scheduler
schedule_api = """
@app.post("/api/schedule")
async def api_schedule_task(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    interval = int(data.get("interval", 60))
    task_id = f"task_{int(time.time())}"
    cron_scheduler.add_task(task_id, prompt, interval)
    return {"status": "success", "task_id": task_id, "message": f"Görev her {interval} dakikada bir çalışacak."}
"""
if "@app.post(\"/api/schedule\")" not in content:
    content = content.replace("@app.get(\"/api/chat/history\")", schedule_api + "\n@app.get(\"/api/chat/history\")")


with open("main.py", "w") as f:
    f.write(content)
print("main.py patched with all 3 features.")
