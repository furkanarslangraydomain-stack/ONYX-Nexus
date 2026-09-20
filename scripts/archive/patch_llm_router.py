import re

with open("main.py", "r") as f:
    content = f.read()

# Modify provider dict to include custom settings
old_poll_prov = """        self.providers.append({
            "name": "pollinations_deepseek",
            "endpoint": "https://text.pollinations.ai/openai/chat/completions",
            "model": "deepseek",
            "key": "",
            "type": "pollinations",
        })"""
new_poll_prov = """        self.providers.append({
            "name": "pollinations_deepseek",
            "endpoint": "https://text.pollinations.ai/openai/chat/completions",
            "model": "deepseek",
            "key": "",
            "type": "pollinations",
            "config": {"max_tokens": 8000, "temperature": 0.5, "output_format": "text"}
        })
        
        # Add a LiteLLM balancer proxy definition
        self.providers.append({
            "name": "litellm_balancer",
            "endpoint": "local",
            "model": "litellm_router",
            "key": "",
            "type": "litellm",
            "config": {"max_tokens": 4096, "temperature": 0.2, "output_format": "text"}
        })"""

if "litellm_balancer" not in content:
    content = content.replace(old_poll_prov, new_poll_prov)
    
# Modify call_llm_with_fallback
old_fallback_call = """                        payload = {
                            "model": provider["model"],
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                            "temperature": temperature,
                            "max_tokens": max_tokens,
                        }"""
new_fallback_call = """                        # Apply specific configuration for this API if exists
                        p_config = provider.get("config", {})
                        use_temp = p_config.get("temperature", temperature)
                        use_tokens = p_config.get("max_tokens", max_tokens)
                        out_format = p_config.get("output_format", None)
                        
                        payload = {
                            "model": provider["model"],
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                            "temperature": use_temp,
                            "max_tokens": use_tokens,
                        }
                        if out_format == "json":
                            payload["response_format"] = {"type": "json_object"}"""
                            
if "use_temp =" not in content:
    content = content.replace(old_fallback_call, new_fallback_call)

# Add litellm execution logic
old_gemini_start = """                    elif p_type == "gemini":"""
new_gemini_start = """                    elif p_type == "litellm":
                        try:
                            import litellm
                            # Fallback balancing using litellm router
                            router = litellm.Router(model_list=[
                                {"model": "gpt-3.5-turbo", "litellm_params": {"model": "gpt-3.5-turbo", "api_key": "dummy", "api_base": "https://text.pollinations.ai/openai"}},
                            ])
                            response = await router.acompletion(
                                model="gpt-3.5-turbo",
                                messages=[
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}
                                ]
                            )
                            return response.choices[0].message.content.strip()
                        except ImportError:
                            logger.warning("litellm not installed, skipping balancer.")
                            continue
                            
                    elif p_type == "gemini":"""
if 'elif p_type == "litellm":' not in content:
    content = content.replace(old_gemini_start, new_gemini_start)

# Add missing github extraction config
old_github_prov = """                                "name": f"awesome_freellm_{len(self.providers)}",
                                "endpoint": endpoint,
                                "model": "gpt-3.5-turbo",
                                "key": "",
                                "type": "openai"
                            })"""
new_github_prov = """                                "name": f"awesome_freellm_{len(self.providers)}",
                                "endpoint": endpoint,
                                "model": "gpt-3.5-turbo",
                                "key": "",
                                "type": "openai",
                                "config": {"max_tokens": 2048, "temperature": 0.4, "output_format": "text"}
                            })"""
if 'config": {"max_tokens": 2048' not in content:
    content = content.replace(old_github_prov, new_github_prov)


with open("main.py", "w") as f:
    f.write(content)
print("LLM Router updated with specific configurations and litellm balancer.")
