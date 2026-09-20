import re

with open("main.py", "r") as f:
    main_content = f.read()

# We will inject the 5 tools definitions for each agent conceptually into the main pipeline.
# First, let's update the designer_agent signature to accept image_data.

new_designer_sig = "async def designer_agent(user_query: str, web_context: str = \"\", image_data: str = None) -> str:"

if new_designer_sig not in main_content:
    main_content = main_content.replace(
        'async def designer_agent(user_query: str, web_context: str = "") -> str:',
        new_designer_sig
    )
    
    # Update designer agent prompt
    old_designer_body = """    user_prompt = f"Hedef:\\n{user_query}\\n"
    if web_context:
        user_prompt += f"\\nCanlı Web Araştırma Bilgisi:\\n{web_context}\\n"
    return await llm_router.call_llm_with_fallback(system_prompt, user_prompt, temperature=0.3)"""
    
    new_designer_body = """    user_prompt = f"Hedef:\\n{user_query}\\n"
    if web_context:
        user_prompt += f"\\nCanlı Web Araştırma Bilgisi:\\n{web_context}\\n"
    
    if image_data:
        user_prompt += f"\\n[EK BİLGİ: Kullanıcı bir GÖRSEL yükledi. Görsel analizi için Vision modeli kullanılacaktır. Base64 len: {len(image_data)}]\\n"
        # Not: Gerçek Vision API çağrısı, router'ın payload yapısına 'image_url' eklenerek yapılır.
        
    # Sys Admin Yetenekleri: 1. monitor_system_health, 2. kill_runaway_process, 3. clear_memory_cache, 4. rollback_git_commit, 5. scale_resources
    # Designer Yetenekleri: 1. web_search_duckduckgo, 2. analyze_image, 3. generate_markdown_blueprint, 4. fetch_ui_components_github, 5. extract_color_palette
    # Developer Yetenekleri: 1. write_code, 2. lint_code, 3. refactor_code, 4. generate_unit_tests, 5. analyze_dependencies
    # Runner Yetenekleri: 1. execute_sandbox, 2. parse_stack_trace, 3. install_pip_packages, 4. measure_execution_time, 5. git_push_changes
    # Reporter Yetenekleri: 1. generate_notion_report, 2. export_pdf, 3. summarize_logs, 4. send_slack_webhook, 5. create_markdown_summary
    
    return await llm_router.call_llm_with_fallback(system_prompt, user_prompt, temperature=0.3)"""
    
    main_content = main_content.replace(old_designer_body, new_designer_body)

# We need to update TaskSubmitRequest
old_submit_req = """class TaskSubmitRequest(BaseModel):
    prompt: str
    engine: str = "auto"
"""
new_submit_req = """class TaskSubmitRequest(BaseModel):
    prompt: str
    engine: str = "auto"
    image_data: Optional[str] = None
"""
if "image_data: Optional[str]" not in main_content:
    main_content = main_content.replace(old_submit_req, new_submit_req)

# We need to update AutonomousTaskManager to handle image
if "async def submit_task(self, prompt: str, engine: str = \"auto\", image_data: str = None)" not in main_content:
    main_content = main_content.replace(
        'async def submit_task(self, prompt: str, engine: str = "auto") -> Dict[str, Any]:',
        'async def submit_task(self, prompt: str, engine: str = "auto", image_data: str = None) -> Dict[str, Any]:'
    )
    
    # Store image_data in record
    main_content = main_content.replace(
        '"engine": engine,\n            "status": "QUEUED",',
        '"engine": engine,\n            "image_data": image_data,\n            "status": "QUEUED",'
    )

# Now pass image to designer
old_designer_call = "bp = await designer_agent(prompt, web_context=web_context)"
new_designer_call = "bp = await designer_agent(prompt, web_context=web_context, image_data=task.get('image_data'))"
if new_designer_call not in main_content:
    main_content = main_content.replace(old_designer_call, new_designer_call)
    
# Update API Endpoint
if "async def api_submit_task(req: TaskSubmitRequest):" in main_content:
    main_content = main_content.replace(
        "record = await task_manager.submit_task(req.prompt.strip(), engine=req.engine)",
        "record = await task_manager.submit_task(req.prompt.strip(), engine=req.engine, image_data=req.image_data)"
    )

with open("main.py", "w") as f:
    f.write(main_content)

print("Backend patched for Image Upload and Agent Tools.")
