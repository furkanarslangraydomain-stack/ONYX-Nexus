import re

with open("main.py", "r") as f:
    content = f.read()

# Replace the specific payload mapping to inject failover context
old_payload = """                        payload = {
                            "model": provider["model"],
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                            "temperature": use_temp,
                            "max_tokens": use_tokens,
                        }"""

new_payload = """                        # FAILOVER CONTEXT INJECTION (STATEFUL FAILOVER)
                        current_system_prompt = system_prompt
                        if len(errors) > 0:
                            failover_msg = f"\\n\\n[ACİL SİSTEM BİLDİRİMİ: Önceki API havuzu modelleri rate-limit ({', '.join(errors)}) yedi veya başarısız oldu. Görevi şu an sen devralıyorsun. Lütfen kaldığı yerden, eksiksiz bir şekilde tamamla.]"
                            current_system_prompt += failover_msg
                            
                        payload = {
                            "model": provider["model"],
                            "messages": [
                                {"role": "system", "content": current_system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                            "temperature": use_temp,
                            "max_tokens": use_tokens,
                        }"""

if "ACİL SİSTEM BİLDİRİMİ" not in content:
    content = content.replace(old_payload, new_payload)

# Replace the litellm routing as well to support failover injection
old_litellm = """                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}"""
new_litellm = """                                    {"role": "system", "content": current_system_prompt if 'current_system_prompt' in locals() else system_prompt},
                                    {"role": "user", "content": user_prompt}"""
content = content.replace(old_litellm, new_litellm)

# Add graceful backoff sleep for 429
old_429 = """                        if resp.status_code == 429:
                            logger.warning(f"[Free LLM Router] {p_name} 429 Rate Limit. Failing over...")
                            errors.append(f"{p_name}: 429")
                            continue"""
new_429 = """                        if resp.status_code == 429:
                            logger.warning(f"[Free LLM Router] {p_name} 429 Rate Limit. Failing over to next pool in 2s...")
                            errors.append(f"{p_name}: 429 Rate Limit")
                            import asyncio
                            await asyncio.sleep(2) # Graceful backoff
                            continue"""

if "Graceful backoff" not in content:
    content = content.replace(old_429, new_429)

with open("main.py", "w") as f:
    f.write(content)
print("Router failover statefulness patched.")
