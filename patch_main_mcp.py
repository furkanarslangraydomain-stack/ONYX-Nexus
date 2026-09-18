with open("main.py", "r") as f:
    content = f.read()

import_statement = "from mcp_orchestrator import process_3d_request\n"
if "from mcp_orchestrator" not in content:
    # Add it near the top
    content = content.replace("from typing import Dict, Any, Optional, List, Union", "from typing import Dict, Any, Optional, List, Union\n" + import_statement)

# Add 3D routing logic inside _worker_loop
old_logic = """                # 1. Orchestrate with CrewAI if requested and available"""

new_logic = """                # 0. Check for 3D Render / MCP usage
                lower_p = prompt.lower()
                is_3d_request = any(word in lower_p for word in ["3d", "render", "sahne", "scene", "obj", "threejs", "üç boyutlu"])
                if is_3d_request:
                    task["thought"] = "Executing MCP 3D Render Orchestrator..."
                    try:
                        logger.info(f"[{task_id}] Delegating to MCP 3D Server...")
                        mcp_code = await process_3d_request(prompt)
                        result_text = f"```html\\n{mcp_code}\\n```"
                        thought_text = "MCP 3D Server created the scene."
                        used_engine = "mcp_3d"
                        
                        # Save the generated code to file
                        file_path = os.path.join(task_dir, "scene.html")
                        with open(file_path, "w") as fw:
                            fw.write(mcp_code)
                            
                        task["files"] = [{"name": "scene.html", "path": file_path}]
                    except Exception as e:
                        logger.warning(f"MCP 3D execution error: {e}")
                
                # 1. Orchestrate with CrewAI if requested and available"""

if "Executing MCP 3D Render Orchestrator" not in content:
    content = content.replace(old_logic, new_logic)

with open("main.py", "w") as f:
    f.write(content)
print("MCP integration injected into main.py successfully.")
