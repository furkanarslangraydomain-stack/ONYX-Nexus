import re

with open("main.py", "r") as f:
    content = f.read()

# I want to add more Free APIs to FreeProviderRouter._refresh_providers()
old_refresh = """    def _refresh_providers(self):
        self.providers = []
        # 1. Custom User Pool / LiteLLM Proxy (Highest Priority if set)
        if API_POOL_BASE_URL:
            endpoint = API_POOL_BASE_URL
            if not endpoint.endswith("/chat/completions"):
                endpoint = f"{endpoint}/chat/completions"
            self.providers.append({
                "name": "custom_api_pool",
                "endpoint": endpoint,
                "model": API_POOL_MODEL,
                "key": API_POOL_KEY,
                "type": "openai",
            })
        # 2. Dinamik Awesome-FreeLLM-APIs Deposu (GitHub)
        try:
            import urllib.request
            import re
            url = "https://raw.githubusercontent.com/cheems/Awesome-FreeLLM-APIs/main/README.md"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3.0) as response:
                md_text = response.read().decode('utf-8')
                urls = re.findall(r'https?://[^\s/$.?#].[^\s>)]*', md_text)
                for u in urls:
                    if "/v1/chat/completions" in u or "/chat/completions" in u:
                        self.providers.append({
                            "name": "awesome_freellm_" + u.split("//")[1].split("/")[0],
                            "endpoint": u,
                            "model": "gpt-4o-mini",  # Safe default assumption
                            "key": "",
                            "type": "openai",
                        })
        except Exception:
            pass

        # 3. Güvenilir Sabit Fallback'ler (Pollinations AI DeepSeek-V3 ve OpenAI uyumlu Uç Noktaları)
        # Sınırsız / Ücretsiz / Key Gerektirmez
        self.providers.append({
            "name": "pollinations_openai",
            "endpoint": "https://text.pollinations.ai/openai/chat/completions",
            "model": "openai", 
            "key": "",
            "type": "openai"
        })
        self.providers.append({
            "name": "pollinations_deepseek",
            "endpoint": "https://text.pollinations.ai/openai/chat/completions",
            "model": "deepseek", 
            "key": "",
            "type": "openai"
        })
        self.providers.append({
            "name": "pollinations_mistral",
            "endpoint": "https://text.pollinations.ai/openai/chat/completions",
            "model": "mistral-large",
            "key": "",
            "type": "openai"
        })"""

new_refresh = """    def _refresh_providers(self):
        self.providers = []
        # 1. Custom User Pool / LiteLLM Proxy (Highest Priority if set)
        if API_POOL_BASE_URL:
            endpoint = API_POOL_BASE_URL
            if not endpoint.endswith("/chat/completions"):
                endpoint = f"{endpoint}/chat/completions"
            self.providers.append({
                "name": "custom_api_pool",
                "endpoint": endpoint,
                "model": API_POOL_MODEL,
                "key": API_POOL_KEY,
                "type": "openai",
            })
            
        # 1.5. Check standard ENV keys to utilize native LiteLLM if available
        import os
        if os.environ.get("OPENAI_API_KEY"):
            self.providers.append({"name": "native_openai", "model": "gpt-4o", "type": "litellm_native", "key": os.environ.get("OPENAI_API_KEY"), "endpoint": ""})
        if os.environ.get("ANTHROPIC_API_KEY"):
            self.providers.append({"name": "native_anthropic", "model": "claude-3-5-sonnet-20241022", "type": "litellm_native", "key": os.environ.get("ANTHROPIC_API_KEY"), "endpoint": ""})
        if os.environ.get("GEMINI_API_KEY"):
            self.providers.append({"name": "native_gemini", "model": "gemini/gemini-1.5-pro", "type": "litellm_native", "key": os.environ.get("GEMINI_API_KEY"), "endpoint": ""})
        if os.environ.get("GROQ_API_KEY"):
            self.providers.append({"name": "native_groq", "model": "groq/llama-3.3-70b-versatile", "type": "litellm_native", "key": os.environ.get("GROQ_API_KEY"), "endpoint": ""})
        if os.environ.get("TOGETHER_API_KEY"):
            self.providers.append({"name": "native_together", "model": "together_ai/meta-llama/Llama-3-70b-chat-hf", "type": "litellm_native", "key": os.environ.get("TOGETHER_API_KEY"), "endpoint": ""})
        
        # 2. Dinamik Awesome-FreeLLM-APIs Deposu (GitHub)
        try:
            import urllib.request
            import re
            url = "https://raw.githubusercontent.com/cheems/Awesome-FreeLLM-APIs/main/README.md"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3.0) as response:
                md_text = response.read().decode('utf-8')
                urls = re.findall(r'https?://[^\s/$.?#].[^\s>)]*', md_text)
                for u in urls:
                    if "/v1/chat/completions" in u or "/chat/completions" in u:
                        self.providers.append({
                            "name": "awesome_freellm_" + u.split("//")[1].split("/")[0],
                            "endpoint": u,
                            "model": "gpt-4o-mini",  # Safe default assumption
                            "key": "",
                            "type": "openai",
                        })
        except Exception:
            pass

        # 3. YENİ GENİŞLETİLMİŞ ÜCRETSİZ HAVUZ (POLLINATIONS, DUCKDUCKGO, G4F-like Endpoints)
        # Pollinations.ai (Unlimited, Free, OpenAI format)
        self.providers.extend([
            {
                "name": "pollinations_openai",
                "endpoint": "https://text.pollinations.ai/openai/chat/completions",
                "model": "openai", 
                "key": "",
                "type": "openai"
            },
            {
                "name": "pollinations_deepseek",
                "endpoint": "https://text.pollinations.ai/openai/chat/completions",
                "model": "deepseek", 
                "key": "",
                "type": "openai"
            },
            {
                "name": "pollinations_claude",
                "endpoint": "https://text.pollinations.ai/openai/chat/completions",
                "model": "claude", 
                "key": "",
                "type": "openai"
            },
            {
                "name": "pollinations_llama",
                "endpoint": "https://text.pollinations.ai/openai/chat/completions",
                "model": "llama", 
                "key": "",
                "type": "openai"
            }
        ])
        
        # 4. DuckDuckGo Free Chat via Jmuz Free API (OpenAI Compatible)
        self.providers.extend([
             {
                "name": "jmuz_gpt4o",
                "endpoint": "https://api.jmuz.me/v1/chat/completions",
                "model": "gpt-4o",
                "key": "",
                "type": "openai"
             },
             {
                "name": "jmuz_claude",
                "endpoint": "https://api.jmuz.me/v1/chat/completions",
                "model": "claude-3-5-sonnet-20241022",
                "key": "",
                "type": "openai"
             },
             {
                "name": "jmuz_gemini",
                "endpoint": "https://api.jmuz.me/v1/chat/completions",
                "model": "gemini-1.5-pro",
                "key": "",
                "type": "openai"
             }
        ])"""

if "native_openai" not in content:
    content = content.replace(old_refresh, new_refresh)

# Now, we also need to update call_llm_with_fallback logic to handle type="litellm_native"
old_call = """        for p in self.providers:
            try:
                headers = {"Content-Type": "application/json"}
                if p["key"]:
                    headers["Authorization"] = f"Bearer {p['key']}"
                payload = {
                    "model": p["model"],
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                resp = await self.client.post(p["endpoint"], json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 5:
                        return content
            except Exception:
                continue"""

new_call = """        for p in self.providers:
            try:
                if p.get("type") == "litellm_native":
                    import litellm
                    # Use native LiteLLM capability
                    response = await litellm.acompletion(
                        model=p["model"],
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        api_key=p["key"]
                    )
                    content = response.choices[0].message.content
                    if content and len(content.strip()) > 5:
                        return content
                else:
                    # HTTP custom endpoint (OpenAI format)
                    headers = {"Content-Type": "application/json"}
                    if p["key"]:
                        headers["Authorization"] = f"Bearer {p['key']}"
                    payload = {
                        "model": p["model"],
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                    resp = await self.client.post(p["endpoint"], json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"]
                        if content and len(content.strip()) > 5:
                            return content
            except Exception as e:
                import logging
                logging.warning(f"[FreeProviderRouter] '{p['name']}' failed: {e}")
                continue"""

if "litellm_native" not in content:
    content = content.replace(old_call, new_call)

with open("main.py", "w") as f:
    f.write(content)

print("Free LLM providers expanded in main.py.")
