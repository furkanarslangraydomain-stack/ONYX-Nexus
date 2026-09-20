import re

with open("mega_mcp_server.py", "r") as f:
    content = f.read()

# Add missing handlers in _call_tool
old_web_fetch = """        elif name == "web_fetch":
            req = urllib.request.Request(args["url"], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                return {"content": response.read().decode('utf-8')[:5000]} # Limit to 5k chars"""

new_web_fetch = """        elif name == "web_fetch":
            req = urllib.request.Request(args["url"], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                return {"content": response.read().decode('utf-8')} # Removed 5k limit to increase capability
        elif name == "web_download":
            urllib.request.urlretrieve(args["url"], args["dest"])
            return {"status": "success", "dest": args["dest"]}
        elif name == "sys_list_processes":
            result = subprocess.run("ps aux --sort=-%cpu | head -n 20", shell=True, capture_output=True, text=True)
            return {"processes": result.stdout}
        elif name == "sys_kill_process":
            result = subprocess.run(f"kill -9 {args['pid']}", shell=True, capture_output=True, text=True)
            return {"status": "success" if result.returncode == 0 else "error", "message": result.stderr}
        elif name == "fs_mkdir":
            os.makedirs(args["path"], exist_ok=True)
            return {"status": "success"}"""

if "web_download" not in content.split("def _call_tool")[1]:
    content = content.replace(old_web_fetch, new_web_fetch)

# Add missing tools to _get_tools_list
old_list = """            {"name": "analyze_dependencies", "description": "Analyze package.json or requirements.txt", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}}
        ]"""
new_list = """            {"name": "analyze_dependencies", "description": "Analyze package.json or requirements.txt", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
            {"name": "fs_mkdir", "description": "Create a new directory", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}}
        ]"""

if "fs_mkdir" not in content:
    content = content.replace(old_list, new_list)

with open("mega_mcp_server.py", "w") as f:
    f.write(content)

print("MCP server capabilities enhanced.")
