import re

with open("main.py", "r") as f:
    content = f.read()

# 1. Imports
if "from persona_engine import PersonaEngine" not in content:
    content = content.replace("from vector_db import LightweightVectorDB", 
"""from vector_db import LightweightVectorDB
from persona_engine import PersonaEngine""")

# 2. Init
if "persona_engine = PersonaEngine()" not in content:
    content = content.replace("vector_db = LightweightVectorDB()",
"""vector_db = LightweightVectorDB()
persona_engine = PersonaEngine()""")

# 3. Inject into prompt
old_history = """        history_str = semantic_memory + "\\n[SON 5 MESAJ (Kısa Vadeli Hafıza)]\\n" + history_str"""
new_history = """        # Inject Persona Mirroring
        persona_prompt = persona_engine.get_mirroring_prompt()
        history_str = semantic_memory + "\\n[SON 5 MESAJ (Kısa Vadeli Hafıza)]\\n" + history_str + persona_prompt"""

if "persona_prompt = persona_engine" not in content:
    content = content.replace(old_history, new_history)

with open("main.py", "w") as f:
    f.write(content)
print("main.py patched with Persona Engine.")
