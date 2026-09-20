import re

with open("mega_mcp_server.py", "r") as f:
    content = f.read()

# 1. Increase timeout and add more robust sys command
old_sys = 'result = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=5)'
new_sys = 'result = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=120)'
if old_sys in content:
    content = content.replace(old_sys, new_sys)
    content = content.replace('"description": "Run a safe shell command (timeout 5s)"', '"description": "Run a powerful shell command (timeout 120s, full system access)"')

# 2. Add System Process Management Tools to tools list
new_tools = """
            # Web & Network
            {"name": "web_download", "description": "Download a file from URL to a path", "inputSchema": {"type": "object", "properties": {"url": {"type": "string"}, "dest": {"type": "string"}}, "required": ["url", "dest"]}},
            {"name": "sys_list_processes", "description": "List running top processes", "inputSchema": {"type": "object", "properties": {}, "required": []}},
            {"name": "sys_kill_process", "description": "Kill a process by PID", "inputSchema": {"type": "object", "properties": {"pid": {"type": "string"}}, "required": ["pid"]}},
"""
if "sys_list_processes" not in content:
    content = content.replace("# Web & Network", new_tools)

# 3. Implement new tools logic
new_tools_logic = """
        elif name == "web_download":
            urllib.request.urlretrieve(args["url"], args["dest"])
            return {"status": "success", "file": args["dest"]}
        elif name == "sys_list_processes":
            result = subprocess.run("ps aux --sort=-%mem | head -n 15", shell=True, capture_output=True, text=True)
            return {"processes": result.stdout}
        elif name == "sys_kill_process":
            result = subprocess.run(f"kill -9 {args['pid']}", shell=True, capture_output=True, text=True)
            return {"status": "success", "pid": args["pid"]}
"""
if "web_download" not in content:
    content = content.replace("elif name == \"sys_get_info\":", new_tools_logic + "        elif name == \"sys_get_info\":")


with open("mega_mcp_server.py", "w") as f:
    f.write(content)
print("Mega MCP Server patched with extended privileges.")
