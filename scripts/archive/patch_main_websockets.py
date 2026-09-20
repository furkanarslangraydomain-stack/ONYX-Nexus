import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Import WebSocket and new engines
if "WebSocket" not in content:
    content = content.replace("from fastapi import FastAPI, Request, HTTPException, status", 
                              "from fastapi import FastAPI, Request, HTTPException, status, WebSocket, WebSocketDisconnect")
                              
if "from deep_research import DeepResearchEngine" not in content:
    content = content.replace("from persona_engine import PersonaEngine",
"""from persona_engine import PersonaEngine
from deep_research import DeepResearchEngine
from git_agent import AutoGitAgent""")

if "deep_research_engine =" not in content:
    content = content.replace("persona_engine = PersonaEngine()",
"""persona_engine = PersonaEngine()
deep_research_engine = DeepResearchEngine()
git_agent = AutoGitAgent()""")

# 2. Add WebSocket Route for Live Collaboration
ws_route = """
# ==========================================
# WEBSOCKETS (CANLI İŞBİRLİĞİ & STREAMING)
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/collab")
async def websocket_collab_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Kullanıcıdan gelen anlık kod/metin değişikliklerini ajana ilet (Canlı Yayın)
            await manager.broadcast(f"[Canlı İşbirliği Ajanı]: Değişiklik alındı -> {data[:50]}...")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
"""
if "@app.websocket" not in content:
    content = content.replace("@app.on_event(\"startup\")", ws_route + "\n@app.on_event(\"startup\")")

with open("main.py", "w") as f:
    f.write(content)
print("main.py patched with WebSockets, Deep Research, and Git Agent.")
