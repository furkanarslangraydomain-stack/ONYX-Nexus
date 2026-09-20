#!/usr/bin/env python3
"""
Onyx-Nexus MCP (Model Context Protocol) Server - 3D Render Engine
Provides tools for generating, modifying, and exporting 3D scenes (Three.js, OBJ).
"""

import sys
import json
import uuid
import os
import traceback

class MCP3DServer:
    def __init__(self):
        self.scenes = {}

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
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "onyx-nexus-3d-mcp",
                        "version": "1.0.0"
                    }
                }
            }
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": [
                        {
                            "name": "init_3d_scene",
                            "description": "Initialize a new 3D scene.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "engine": {"type": "string", "description": "threejs or obj"}
                                },
                                "required": ["engine"]
                            }
                        },
                        {
                            "name": "add_3d_object",
                            "description": "Add a basic 3D object to the scene.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "scene_id": {"type": "string"},
                                    "shape": {"type": "string", "description": "cube, sphere, cylinder, plane"},
                                    "color": {"type": "string"},
                                    "position": {"type": "array", "items": {"type": "number"}}
                                },
                                "required": ["scene_id", "shape"]
                            }
                        },
                        {
                            "name": "export_3d_project",
                            "description": "Export the 3D scene as renderable code or 3D model string.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "scene_id": {"type": "string"}
                                },
                                "required": ["scene_id"]
                            }
                        }
                    ]
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
                        "content": [{"type": "text", "text": json.dumps(res)}],
                        "isError": False
                    }
                }
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": str(e)}],
                        "isError": True
                    }
                }
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": "Method not found"}
            }

    def _call_tool(self, name: str, args: dict) -> dict:
        if name == "init_3d_scene":
            scene_id = str(uuid.uuid4())
            engine = args.get("engine", "threejs")
            self.scenes[scene_id] = {"engine": engine, "objects": [], "lights": True, "camera": [0,0,5]}
            return {"scene_id": scene_id, "status": "initialized", "engine": engine}
        
        elif name == "add_3d_object":
            scene_id = args.get("scene_id")
            if scene_id not in self.scenes:
                raise ValueError("Scene not found")
            obj = {
                "shape": args.get("shape"),
                "color": args.get("color", "#ffffff"),
                "position": args.get("position", [0,0,0])
            }
            self.scenes[scene_id]["objects"].append(obj)
            return {"status": "added", "object": obj}
            
        elif name == "export_3d_project":
            scene_id = args.get("scene_id")
            if scene_id not in self.scenes:
                raise ValueError("Scene not found")
            scene = self.scenes[scene_id]
            
            if scene["engine"] == "threejs":
                # Generate Three.js HTML
                html = """<!DOCTYPE html>
<html>
<head>
    <title>Onyx-Nexus 3D Render</title>
    <style>body { margin: 0; overflow: hidden; }</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
    <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
"""
                for obj in scene["objects"]:
                    shape = obj["shape"]
                    color = obj["color"].replace("#", "0x")
                    px, py, pz = obj["position"]
                    if shape == "cube":
                        html += f"        var geom = new THREE.BoxGeometry();\n"
                    elif shape == "sphere":
                        html += f"        var geom = new THREE.SphereGeometry(1, 32, 32);\n"
                    else:
                        html += f"        var geom = new THREE.BoxGeometry();\n"
                    
                    html += f"""        var mat = new THREE.MeshStandardMaterial({{color: {color}}});
        var mesh = new THREE.Mesh(geom, mat);
        mesh.position.set({px}, {py}, {pz});
        scene.add(mesh);
"""
                cx, cy, cz = scene["camera"]
                html += f"""
        camera.position.set({cx}, {cy}, {cz});
        function animate() {{
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }}
        animate();
        
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }}
    </script>
</body>
</html>"""
                return {"format": "html", "code": html}
            else:
                return {"format": "json", "code": json.dumps(scene)}
        else:
            raise ValueError(f"Unknown tool: {name}")

    def run(self):
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                req = json.loads(line)
                res = self.handle_request(req)
                print(json.dumps(res), flush=True)
            except Exception as e:
                err_res = {
                    "jsonrpc": "2.0",
                    "error": {"code": -32700, "message": "Parse error", "data": str(e)}
                }
                print(json.dumps(err_res), flush=True)

if __name__ == "__main__":
    server = MCP3DServer()
    server.run()
