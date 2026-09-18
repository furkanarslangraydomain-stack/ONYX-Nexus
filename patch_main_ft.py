import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Import
if "from fine_tuning_engine import ContinuousFineTuningEngine" not in content:
    content = content.replace("from git_agent import AutoGitAgent",
"""from git_agent import AutoGitAgent
from fine_tuning_engine import ContinuousFineTuningEngine""")

# 2. Init
if "fine_tuning_engine = ContinuousFineTuningEngine" not in content:
    content = content.replace("git_agent = AutoGitAgent()",
"""git_agent = AutoGitAgent()
fine_tuning_engine = ContinuousFineTuningEngine(vector_db=vector_db)""")

# 3. Add API Endpoint
api_route = """
@app.post("/api/learn")
async def api_learn_knowledge(request: Request):
    data = await request.json()
    topic = data.get("topic", "Genel Kural")
    content = data.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Öğretilecek içerik boş olamaz.")
    
    doc_id = fine_tuning_engine.learn(topic, content)
    return {"status": "success", "message": f"Sistem '{topic}' konusunda başarıyla eğitildi (Fine-Tuned).", "id": doc_id}
"""
if "@app.post(\"/api/learn\")" not in content:
    content = content.replace("@app.post(\"/api/schedule\")", api_route + "\n@app.post(\"/api/schedule\")")

# 4. Inject into Chat API
old_chat = """        # Inject Persona Mirroring
        persona_prompt = persona_engine.get_mirroring_prompt()
        history_str = semantic_memory + "\\n[SON 5 MESAJ (Kısa Vadeli Hafıza)]\\n" + history_str + persona_prompt"""
new_chat = """        # Inject Persona Mirroring & Fine-Tuning
        persona_prompt = persona_engine.get_mirroring_prompt()
        ft_prompt = fine_tuning_engine.get_relevant_knowledge(final_prompt)
        history_str = semantic_memory + "\\n[SON 5 MESAJ (Kısa Vadeli Hafıza)]\\n" + history_str + persona_prompt + ft_prompt"""
if "ft_prompt = fine_tuning_engine" not in content:
    content = content.replace(old_chat, new_chat)

# 5. Inject into Task API
old_task = """    if data.get("engine") == "swarm":"""
new_task = """    # Inject Fine-Tuning to Tasks
    ft_prompt = fine_tuning_engine.get_relevant_knowledge(final_prompt)
    if ft_prompt:
        final_prompt = ft_prompt + "\\n\\nKULLANICI İSTEĞİ:\\n" + final_prompt

    if data.get("engine") == "swarm":"""
if "Inject Fine-Tuning to Tasks" not in content:
    content = content.replace(old_task, new_task)

with open("main.py", "w") as f:
    f.write(content)
print("main.py patched with Fine Tuning Engine.")
