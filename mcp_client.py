import asyncio
import json
import logging
import sys
from typing import Dict, Any

logger = logging.getLogger("Onyx-Nexus.MCPClient")

class MCP3DClient:
    def __init__(self, script_path="mcp_3d_server.py"):
        self.script_path = script_path
        self.process = None
        self._req_id = 0
        self._pending_requests = {}

    async def start(self):
        self.process = await asyncio.create_subprocess_exec(
            "python3", self.script_path,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        asyncio.create_task(self._listen_stdout())
        # Initialize
        await self.send_request("initialize", {})
        
    async def _listen_stdout(self):
        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            try:
                msg = json.loads(line.decode().strip())
                if "id" in msg and msg["id"] in self._pending_requests:
                    self._pending_requests[msg["id"]].set_result(msg)
            except Exception as e:
                logger.error(f"MCP Parse error: {e}")

    async def send_request(self, method: str, params: dict) -> Dict[str, Any]:
        self._req_id += 1
        req_id = str(self._req_id)
        fut = asyncio.get_event_loop().create_future()
        self._pending_requests[req_id] = fut
        
        req = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": method,
            "params": params
        }
        
        self.process.stdin.write((json.dumps(req) + "\n").encode())
        await self.process.stdin.drain()
        
        res = await fut
        del self._pending_requests[req_id]
        
        if "error" in res:
            raise Exception(res["error"])
            
        return res["result"]

    async def init_scene(self, engine="threejs"):
        return await self.send_request("tools/call", {"name": "init_3d_scene", "arguments": {"engine": engine}})

    async def add_object(self, scene_id, shape, color, position):
        return await self.send_request("tools/call", {"name": "add_3d_object", "arguments": {"scene_id": scene_id, "shape": shape, "color": color, "position": position}})

    async def export_project(self, scene_id):
        return await self.send_request("tools/call", {"name": "export_3d_project", "arguments": {"scene_id": scene_id}})
