import asyncio
import json
import logging
from mcp_client import MCP3DClient

logger = logging.getLogger("Onyx-Nexus.MCP_Orchestrator")

async def process_3d_request(prompt: str, llm_router=None) -> str:
    """
    Kullanıcı talebini alır, LLM ile parse eder, MCP sunucusunu kullanarak 3D sahneyi oluşturur ve kodu döndürür.
    """
    logger.info("[MCP 3D] MCP İstemcisi başlatılıyor...")
    client = MCP3DClient()
    await client.start()
    
    system_prompt = (
        "Sen Onyx-Nexus 3D Render Uzmanısın. Kullanıcı talebini analiz et ve JSON formatında bir komut dizisi üret.\n"
        "Kurallar:\n"
        "Çıktı SADECE geçerli bir JSON array olmalıdır. Başka hiçbir metin içermemeli.\n"
        "Her eleman şu formatta olmalı:\n"
        "{\"action\": \"add_object\", \"shape\": \"cube|sphere|cylinder|plane\", \"color\": \"#RRGGBB\", \"position\": [x, y, z]}\n"
    )
    
    if llm_router:
        raw_json = await llm_router.call_llm_with_fallback(system_prompt, f"Kullanıcı Talebi: {prompt}", temperature=0.1)
    else:
        # Fallback if no router provided
        raw_json = '[{"action": "add_object", "shape": "cube", "color": "#ff0000", "position": [0, 0, 0]}]'
        
    # Clean output to ensure JSON parsing
    raw_json = raw_json.strip()
    if raw_json.startswith("```json"):
        raw_json = raw_json[7:]
    if raw_json.endswith("```"):
        raw_json = raw_json[:-3]
    raw_json = raw_json.strip()
    
    try:
        commands = json.loads(raw_json)
    except Exception as e:
        logger.warning(f"[MCP 3D] JSON parse hatası: {e}. Varsayılan nesneler ekleniyor.")
        commands = [
            {"action": "add_object", "shape": "cube", "color": "#ff0000", "position": [0, 0, 0]}
        ]
        
    try:
        # 1. Initialize Scene
        res = await client.init_scene(engine="threejs")
        scene_id = res["scene_id"]
        logger.info(f"[MCP 3D] Sahne oluşturuldu: {scene_id}")
        
        # 2. Add Objects
        for cmd in commands:
            if cmd.get("action") == "add_object":
                await client.add_object(
                    scene_id=scene_id,
                    shape=cmd.get("shape", "cube"),
                    color=cmd.get("color", "#ffffff"),
                    position=cmd.get("position", [0,0,0])
                )
                logger.info(f"[MCP 3D] Nesne eklendi: {cmd.get('shape')} - {cmd.get('color')}")
                
        # 3. Export Code
        export_res = await client.export_project(scene_id=scene_id)
        logger.info("[MCP 3D] Sahne render kodu başarıyla dışa aktarıldı.")
        
        # Cleanup process
        client.process.terminate()
        
        return export_res.get("code", "")
    except Exception as e:
        logger.error(f"[MCP 3D] Hata: {e}")
        if client.process:
            client.process.terminate()
        return f"<!-- MCP 3D Render Error: {e} -->"
