with open("main.py", "r") as f:
    content = f.read()

# Fix Pollinations endpoint URL
content = content.replace("https://text.pollinations.ai/openai/chat/completions", "https://text.pollinations.ai/openai")

with open("main.py", "w") as f:
    f.write(content)
