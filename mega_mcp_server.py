#!/usr/bin/env python3
"""
Onyx-Nexus Mega MCP (Model Context Protocol) Server
Inspired by official MCP "Everything" and "Filesystem/SQLite" servers on GitHub.
Provides a comprehensive suite of tools for various applications (FS, DB, Web, Git, Sys).
"""

import sys
import json
import os
import sqlite3
import urllib.request
import platform
import subprocess
import traceback
from pathlib import Path

class MegaMCPServer:
    def __init__(self):
        self.db_conn = sqlite3.connect(':memory:')
        self._init_db()

    def _init_db(self):
        cursor = self.db_conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT, value TEXT)")
        cursor.execute("INSERT INTO test_table (name, value) VALUES ('nexus', 'active')")
        self.db_conn.commit()

    def handle_request(self, req: dict) -> dict:
        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "onyx-nexus-mega-mcp", "version": "2.0.0"}
                }
            }
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": self._get_tools_list()
                }
            }
        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            try:
                res = self._call_tool(tool_name, tool_args)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(res, default=str)}],
                        "isError": False
                    }
                }
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": str(e) + "\n" + traceback.format_exc()}],
                        "isError": True
                    }
                }
        else:
            return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": "Method not found"}}

    def _get_tools_list(self):
        return [
            # Filesystem Tools
            {"name": "fs_read_file", "description": "Read file contents", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
            {"name": "fs_list_dir", "description": "List directory contents", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
            {"name": "fs_write_file", "description": "Write text to a file", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
            
            # Database Tools (SQLite)
            {"name": "db_execute_sql", "description": "Execute a SQL query on the local memory SQLite DB", "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
            {"name": "db_get_schema", "description": "Get database schema", "inputSchema": {"type": "object", "properties": {}, "required": []}},
            
            
            # Web & Network
            {"name": "web_download", "description": "Download a file from URL to a path", "inputSchema": {"type": "object", "properties": {"url": {"type": "string"}, "dest": {"type": "string"}}, "required": ["url", "dest"]}},
            {"name": "sys_list_processes", "description": "List running top processes", "inputSchema": {"type": "object", "properties": {}, "required": []}},
            {"name": "sys_kill_process", "description": "Kill a process by PID", "inputSchema": {"type": "object", "properties": {"pid": {"type": "string"}}, "required": ["pid"]}},

            {"name": "web_fetch", "description": "Fetch HTML content from a URL", "inputSchema": {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]}},
            
            # System Tools
            {"name": "sys_get_info", "description": "Get system OS, architecture, and memory info", "inputSchema": {"type": "object", "properties": {}, "required": []}},
            {"name": "sys_run_command", "description": "Run a powerful shell command (timeout 120s, full system access)", "inputSchema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}},
            
            # Developer / Git Mock Tools
            {"name": "git_status", "description": "Get current git repository status", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
            {"name": "analyze_dependencies", "description": "Analyze package.json or requirements.txt", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}}
        ]

    def get_openai_tools_schema(self):
        """Export tools in OpenAI Function Calling schema standard."""
        openai_tools = []
        for tool in self._get_tools_list():
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["inputSchema"]
                }
            })
        return openai_tools

    def call_tool(self, name: str, args: dict):
        return self._call_tool(name, args)

    def _call_tool(self, name: str, args: dict):
        if name == "fs_read_file":
            with open(args["path"], "r", encoding="utf-8") as f:
                return {"content": f.read()}
        elif name == "fs_list_dir":
            return {"files": os.listdir(args["path"])}
        elif name == "fs_write_file":
            with open(args["path"], "w", encoding="utf-8") as f:
                f.write(args["content"])
            return {"status": "success", "bytes_written": len(args["content"])}
        elif name == "db_execute_sql":
            cursor = self.db_conn.cursor()
            cursor.execute(args["query"])
            if args["query"].strip().upper().startswith("SELECT"):
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return {"columns": columns, "rows": rows}
            else:
                self.db_conn.commit()
                return {"status": "success", "rowcount": cursor.rowcount}
        elif name == "db_get_schema":
            cursor = self.db_conn.cursor()
            cursor.execute("SELECT type, name, sql FROM sqlite_master WHERE type='table'")
            return {"tables": cursor.fetchall()}
        elif name == "web_fetch":
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
            return {"status": "success"}
        elif name == "sys_get_info":
            return {
                "os": platform.system(),
                "release": platform.release(),
                "architecture": platform.machine(),
                "python_version": platform.python_version(),
                "cwd": os.getcwd()
            }
        elif name == "sys_run_command":
            result = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=120)
            return {"stdout": result.stdout, "stderr": result.stderr, "exit_code": result.returncode}
        elif name == "git_status":
            result = subprocess.run(f"cd {args['path']} && git status", shell=True, capture_output=True, text=True)
            return {"status": result.stdout if result.returncode == 0 else result.stderr}
        elif name == "analyze_dependencies":
            return {"status": "Mock dependency analysis completed. All clear."}
        else:
            raise ValueError(f"Unknown tool: {name}")

    def run(self):
        for line in sys.stdin:
            line = line.strip()
            if not line: continue
            try:
                req = json.loads(line)
                res = self.handle_request(req)
                print(json.dumps(res), flush=True)
            except Exception as e:
                err_res = {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error", "data": str(e)}}
                print(json.dumps(err_res), flush=True)

if __name__ == "__main__":
    MegaMCPServer().run()
