import re

with open("main.py", "r") as f:
    content = f.read()

# Add caching decorator
if "from functools import lru_cache" not in content:
    content = content.replace("from typing import Dict", "from functools import lru_cache\nfrom typing import Dict")

# Add LRU cache to search_similar
old_search = "    def search_similar(self, query: str, limit: int = 2) -> List[Dict[str, str]]:"
new_search = "    @lru_cache(maxsize=256)\n    def search_similar(self, query: str, limit: int = 2) -> List[Dict[str, str]]:"
if new_search not in content:
    content = content.replace(old_search, new_search)

# Also let's make add_entry clear the cache or simply not clear since it's just a similarity search.
# For simplicity, we just clear the cache on add_entry.
old_add = "    def add_entry(self, prompt: str, blueprint: str, code: str, status: str, engine: str):"
new_add = """    def add_entry(self, prompt: str, blueprint: str, code: str, status: str, engine: str):
        self.search_similar.cache_clear()"""
if "self.search_similar.cache_clear()" not in content:
    content = content.replace(old_add, new_add)

with open("main.py", "w") as f:
    f.write(content)
print("Cache applied successfully.")
