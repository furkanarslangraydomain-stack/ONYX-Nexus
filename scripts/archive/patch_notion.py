import re

with open("main.py", "r") as f:
    content = f.read()

if "from notion_reporter import NotionReporter" not in content:
    content = content.replace("from vector_db import LightweightVectorDB", "from vector_db import LightweightVectorDB\nfrom notion_reporter import NotionReporter")

if "notion_reporter =" not in content:
    content = content.replace("vector_db = LightweightVectorDB()", "vector_db = LightweightVectorDB()\nnotion_reporter = NotionReporter()")


new_chat_post = """@app.post("/api/chat/message")
async def api_save_chat_message(request: Request):
    try:
        data = await request.json()
        
        # Vektör DB'ye de asenkron/fire-and-forget ekle (Sadece user mesajları önemliyse)
        if data.get("role") == "user":
            vector_db.add_document(data.get("id", str(time.time())), data.get("content", ""))
            
            # NOTION ENTEGRASYONU: Tüm kayıtları Notion'a kaydet (Şifreleme uygulanmış hali için)
            if notion_reporter.is_configured():
                asyncio.create_task(notion_reporter.log_to_notion(f"User Message: {data.get('id', str(time.time()))}", data.get("content", "")))
        
        elif data.get("role") == "assistant":
            # Asistan cevaplarını da kaydet
            if notion_reporter.is_configured():
                asyncio.create_task(notion_reporter.log_to_notion(f"Assistant Response: {data.get('id', str(time.time()))}", data.get("content", "")))
        
        with agent_memory._get_connection() as conn:"""

old_chat_post = """@app.post("/api/chat/message")
async def api_save_chat_message(request: Request):
    try:
        data = await request.json()
        
        # Vektör DB'ye de asenkron/fire-and-forget ekle (Sadece user mesajları önemliyse)
        if data.get("role") == "user":
            vector_db.add_document(data.get("id", str(time.time())), data.get("content", ""))
            
        with agent_memory._get_connection() as conn:"""

if "notion_reporter.is_configured" not in content:
    content = content.replace(old_chat_post, new_chat_post)

with open("main.py", "w") as f:
    f.write(content)

print("Notion patch applied.")
