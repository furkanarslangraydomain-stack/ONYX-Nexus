import re
import os

# 1. Optimize main.py (Garbage Collection)
with open("main.py", "r") as f:
    main_content = f.read()

if "import gc" not in main_content:
    main_content = "import gc\n" + main_content

old_chat_return = """    return {"status": "success", "response": final_msg, "id": msg_id}"""
new_chat_return = """    
    # RAM Optimization: Force Garbage Collection after heavy text generation
    gc.collect()
    return {"status": "success", "response": final_msg, "id": msg_id}"""
if "RAM Optimization:" not in main_content:
    main_content = main_content.replace(old_chat_return, new_chat_return)

with open("main.py", "w") as f:
    f.write(main_content)
print("main.py patched for RAM optimization.")

# 2. Optimize swarm_engine.py (Sandbox Memory Limits & GC)
with open("swarm_engine.py", "r") as f:
    swarm_content = f.read()

if "import gc" not in swarm_content:
    swarm_content = swarm_content.replace("import os", "import os\nimport gc")

sandbox_limit_func = """
def set_memory_limit():
    \"\"\"Unix tabanlı sistemlerde Sandbox'ın yiyebileceği maksimum RAM'i kısıtlar (Örn: 12GB).\"\"\"
    try:
        import resource
        max_mem = 12 * 1024 * 1024 * 1024 # 12 GB
        resource.setrlimit(resource.RLIMIT_AS, (max_mem, max_mem))
    except Exception:
        pass # Windows veya kısıtlama desteklenmeyen ortam
"""

old_sandbox_run = """        res = subprocess.run(["python3", "sandbox_temp.py"], capture_output=True, text=True, timeout=5)"""
new_sandbox_run = """        # Execute with memory limit to prevent RAM exhaustion by generated code
        res = subprocess.run(
            ["python3", "sandbox_temp.py"], 
            capture_output=True, 
            text=True, 
            timeout=5,
            preexec_fn=set_memory_limit if os.name == 'posix' else None
        )"""

if "def set_memory_limit():" not in swarm_content:
    swarm_content = swarm_content.replace("def extract_python_code(text):", sandbox_limit_func + "\ndef extract_python_code(text):")
    swarm_content = swarm_content.replace(old_sandbox_run, new_sandbox_run)

# Add GC at the end of swarm execution
old_swarm_return = """        return final_result"""
new_swarm_return = """        gc.collect()
        return final_result"""
if "gc.collect()" not in swarm_content:
    swarm_content = swarm_content.replace(old_swarm_return, new_swarm_return)

with open("swarm_engine.py", "w") as f:
    f.write(swarm_content)
print("swarm_engine.py patched for Sandbox RAM Limits.")

# 3. Optimize vector_db.py (Lazy Loading & Torch Cache clear)
try:
    with open("vector_db.py", "r") as f:
        vdb_content = f.read()

    # If it's importing sentence_transformers at the top, move it inside the class or method
    # For a simple regex patch, let's just add torch cache clearing if torch is used.
    torch_cleanup = """
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            import gc
            gc.collect()
        except:
            pass
"""
    old_vdb_search = """        return results"""
    new_vdb_search = torch_cleanup + """        return results"""
    if "torch.cuda.empty_cache" not in vdb_content:
        vdb_content = vdb_content.replace(old_vdb_search, new_vdb_search)
        with open("vector_db.py", "w") as f:
            f.write(vdb_content)
        print("vector_db.py RAM cleanup patched.")
except Exception as e:
    print("vector_db.py could not be patched:", e)

