import re

with open("main.py", "r") as f:
    content = f.read()

rate_limiter_code = """
import time
from collections import deque
import psutil
import gc

class LocalRateLimiter:
    def __init__(self):
        self.history = {} # provider_name -> {"reqs": deque([timestamps]), "tokens": 0, "reset_at": 0}

    def is_rate_limited(self, provider_name, rpm_limit, tpm_limit, required_tokens):
        if rpm_limit <= 0 and tpm_limit <= 0: return False
        now = time.time()
        
        if provider_name not in self.history:
            self.history[provider_name] = {"reqs": deque(), "tokens": 0, "reset_at": now + 60}
            
        prov_state = self.history[provider_name]
        
        # Reset TPM window if 60s passed
        if now > prov_state["reset_at"]:
            prov_state["tokens"] = 0
            prov_state["reset_at"] = now + 60
            
        # Clean RPM window
        while prov_state["reqs"] and now - prov_state["reqs"][0] > 60:
            prov_state["reqs"].popleft()
            
        # Check Limits
        if rpm_limit > 0 and len(prov_state["reqs"]) >= rpm_limit:
            return True
        if tpm_limit > 0 and (prov_state["tokens"] + required_tokens) > tpm_limit:
            return True
            
        return False
        
    def add_request(self, provider_name, used_tokens):
        if provider_name not in self.history:
            self.history[provider_name] = {"reqs": deque(), "tokens": 0, "reset_at": time.time() + 60}
        self.history[provider_name]["reqs"].append(time.time())
        self.history[provider_name]["tokens"] += used_tokens

rate_limiter = LocalRateLimiter()

def optimize_ram():
    process = psutil.Process()
    mem_before = process.memory_info().rss / 1024 / 1024
    gc.collect()
    mem_after = process.memory_info().rss / 1024 / 1024
    return mem_before, mem_after
"""

if "LocalRateLimiter" not in content:
    content = content.replace("class FreeProviderRouter:", rate_limiter_code + "\nclass FreeProviderRouter:")

# Update failover loop to use rate limiter
old_loop_start = """        for provider in self.providers:
            p_name = provider["name"]
            p_type = provider["type"]
            logger.info(f"[Free LLM Router] Inference via: {p_name.upper()} (Model: {provider.get('model')})")"""

new_loop_start = """        for provider in self.providers:
            p_name = provider["name"]
            p_type = provider["type"]
            p_config = provider.get("config", {})
            rpm_limit = p_config.get("rpm", 30) # Default 30 RPM
            tpm_limit = p_config.get("tpm", 20000) # Default 20k TPM
            
            # Est. tokens: roughly words * 1.5
            est_tokens = int((len(system_prompt) + len(user_prompt)) / 4) * 1.5
            
            if rate_limiter.is_rate_limited(p_name, rpm_limit, tpm_limit, est_tokens):
                logger.warning(f"[Free LLM Router] {p_name.upper()} yerel Hız Sınırına (RPM/TPM) takıldı. Diğer modele geçiliyor...")
                errors.append(f"{p_name}: Local Rate Limit")
                continue
                
            logger.info(f"[Free LLM Router] Inference via: {p_name.upper()} (Model: {provider.get('model')})")"""

if "yerel Hız Sınırına" not in content:
    content = content.replace(old_loop_start, new_loop_start)

# Register usage after success
old_success_1 = """                        if choices:
                            return choices[0]["message"]["content"].strip()"""
new_success_1 = """                        if choices:
                            rate_limiter.add_request(p_name, est_tokens + p_config.get("max_tokens", 1000))
                            return choices[0]["message"]["content"].strip()"""
content = content.replace(old_success_1, new_success_1)

old_success_2 = """                            return response.choices[0].message.content.strip()"""
new_success_2 = """                            rate_limiter.add_request(p_name, est_tokens + p_config.get("max_tokens", 1000))
                            return response.choices[0].message.content.strip()"""
content = content.replace(old_success_2, new_success_2)

old_success_3 = """                        if "candidates" in data and len(data["candidates"]) > 0:
                            return data["candidates"][0]["content"]["parts"][0]["text"].strip()"""
new_success_3 = """                        if "candidates" in data and len(data["candidates"]) > 0:
                            rate_limiter.add_request(p_name, est_tokens + p_config.get("max_tokens", 1000))
                            return data["candidates"][0]["content"]["parts"][0]["text"].strip()"""
content = content.replace(old_success_3, new_success_3)

# Update Cron job to do RAM optimization
old_cron = """            with open("keepalive.log", "a") as lf:
                lf.write(f"Ping: {time.time()}\\n")
        except Exception as e:"""
new_cron = """            with open("keepalive.log", "a") as lf:
                lf.write(f"Ping: {time.time()}\\n")
            # RAM Optimization
            mb, ma = optimize_ram()
            logger.info(f"[RAM Optimizer] Çöp toplayıcı (GC) çalıştı. RAM Kullanımı: {mb:.1f}MB -> {ma:.1f}MB")
        except Exception as e:"""
if "[RAM Optimizer]" not in content:
    content = content.replace(old_cron, new_cron)

with open("main.py", "w") as f:
    f.write(content)
print("main.py patched with Local Rate Limiter, TPM/RPM limits, and RAM Optimizer.")
