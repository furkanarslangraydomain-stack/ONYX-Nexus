with open("main.py", "r") as f:
    content = f.read()

init_old = """    def __init__(self):
        self.providers = []
        self._refresh_providers()"""

init_new = """    def __init__(self):
        import httpx
        self.providers = []
        self._refresh_providers()
        self.client = httpx.AsyncClient(timeout=45.0, limits=httpx.Limits(max_connections=100, max_keepalive_connections=20))"""
        
content = content.replace(init_old, init_new)

call_old = """                async with httpx.AsyncClient(timeout=45.0, limits=limits) as client:
                    if p_type in ["openai", "pollinations"]:
                        headers = {
                            "Content-Type": "application/json","""
call_new = """                # Optimized: using persistent client for HTTP connection pooling
                try:
                    client = self.client
                    if p_type in ["openai", "pollinations"]:
                        headers = {
                            "Content-Type": "application/json","""
content = content.replace(call_old, call_new)

with open("main.py", "w") as f:
    f.write(content)
print("Persistent HTTPX Client applied successfully.")
