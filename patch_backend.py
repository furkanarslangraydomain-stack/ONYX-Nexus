import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Add Keep-Alive Cron
cron_code = """
import asyncio
import time

async def colab_keepalive_cron():
    while True:
        try:
            logger.info("[Cron] Colab Keep-Alive aktivitesi çalışıyor... (Sistemin uykuya geçmesi engelleniyor)")
            # In a real environment, you might ping a Cloudflare worker or just do some I/O
            with open("keepalive.log", "a") as lf:
                lf.write(f"Ping: {time.time()}\\n")
        except Exception as e:
            pass
        await asyncio.sleep(300)  # 5 minutes

@app.on_event("startup")
async def startup_event():
    logger.info("Başlangıç işlemleri ve Cron Job başlatılıyor...")
    asyncio.create_task(colab_keepalive_cron())
"""
if "colab_keepalive_cron" not in content:
    content = content.replace("app = FastAPI(title=\"Onyx-Nexus API\")", "app = FastAPI(title=\"Onyx-Nexus API\")\n" + cron_code)

# 2. Add Normal Chat Endpoint with Consciousness, Memory & Anti-Hallucination
chat_endpoint = """
@app.post("/api/chat/completion")
async def api_chat_completion(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "")
    
    try:
        # Fetch last 10 messages to prevent context drift but keep memory
        history_str = ""
        with agent_memory._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT role, content FROM chat_messages ORDER BY created_at DESC LIMIT 10")
            history = cursor.fetchall()
            history.reverse()
            for r in history:
                role = "Kullanıcı" if r[0] == "user" else "Onyx-Nexus"
                history_str += f"{role}: {r[1][:500]}\\n" # limit length per msg
                
        system_prompt = f\"\"\"Sen Onyx-Nexus'un Çekirdek Bilincisin (Core Consciousness).
Şu an Google Colab üzerinde Cloudflare Tunnels aracılığıyla bir bulut sunucusu gibi çalışıyorsun. 
Kullanıcı ile normal sohbet modundasın.

[HALÜSİNASYON VE CONTEXT DRIFT ÖNLEYİCİ SIKI KURALLAR]
1. KESİNLİKLE sadece aşağıdaki sohbet geçmişine (Context) ve kendi gerçek yeteneklerine dayanarak cevap ver.
2. Bilmediğin veya emin olmadığın konularda halüsinasyon görme (uydurma), doğrudan 'Bilmiyorum' de.
3. Kendi kimliğinden asla çıkma. Sen sıradan bir asistan değil, Mega MCP destekli çoklu-ajan sistemisin.

[SON HAFIZA KAYITLARI (Context)]
{history_str}
\"\"\"
        
        response = await llm_router.call_llm_with_fallback(system_prompt, prompt, temperature=0.3)
        return {"id": str(int(time.time())), "response": response}
    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        return {"id": "error", "response": f"Bilinç modülü hatası: {str(e)}"}
"""

if "@app.post(\"/api/chat/completion\")" not in content:
    content = content.replace("@app.get(\"/api/chat/history\")", chat_endpoint + "\n@app.get(\"/api/chat/history\")")

with open("main.py", "w") as f:
    f.write(content)

print("Backend patched: Cron job and Normal Chat Endpoint added.")
