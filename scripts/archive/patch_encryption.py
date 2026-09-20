import re

with open("main.py", "r") as f:
    content = f.read()

if "from encryption_layer import privacy_layer" not in content:
    content = content.replace("from notion_reporter import NotionReporter", "from notion_reporter import NotionReporter\nfrom encryption_layer import privacy_layer")

old_submit = """    if data.get("engine") == "swarm":
        # Multi-Agent Debate
        response = await swarm_engine.execute_swarm(final_prompt)
    elif data.get("engine") == "local":
        response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, final_prompt)
    else:"""

new_submit = """    
    # ŞİFRELEME KATMANI: API sağlayıcıya gitmeden önce PII/Hassas veriyi şifrele
    encrypted_prompt = privacy_layer.encrypt_prompt(final_prompt)
    
    if data.get("engine") == "swarm":
        # Multi-Agent Debate
        raw_response = await swarm_engine.execute_swarm(encrypted_prompt)
    elif data.get("engine") == "local":
        raw_response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, encrypted_prompt)
    else:"""

old_else_submit = """        raw_response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, final_prompt)
    
    return {"status": "success", "response": raw_response}"""
    
new_else_submit = """        raw_response = await llm_router.call_llm_with_fallback(SYSTEM_PROMPT, encrypted_prompt)
    
    # ŞİFRE ÇÖZME KATMANI: API'den gelen cevapta şifreli bloklar varsa geri aç
    decrypted_response = privacy_layer.decrypt_response(raw_response)
    
    return {"status": "success", "response": decrypted_response}"""

if "privacy_layer.encrypt_prompt" not in content:
    content = content.replace(old_submit, new_submit)
    content = content.replace(old_else_submit, new_else_submit)
    with open("main.py", "w") as f:
        f.write(content)
    print("Encryption patch applied.")
