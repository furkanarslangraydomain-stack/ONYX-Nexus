with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

content = content.replace("const res = await fetch(`${apiUrl}/api/tasks/submit`", "const taskRes = await fetch(`${apiUrl}/api/tasks/submit`")
content = content.replace("const data = await taskRes.json();", "") # clean old reference if any
content = content.replace("const data = await res.json();", "const data = await taskRes.json();")

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
