with open("main.py", "r") as f:
    content = f.read()

content = content.replace("mcp_code = await process_3d_request(prompt)", "mcp_code = await process_3d_request(prompt, llm_router=llm_router)")

with open("main.py", "w") as f:
    f.write(content)
