with open("src/types.ts", "r") as f:
    content = f.read()

if "'3d-studio'" not in content:
    content = content.replace("'architecture';", "'architecture'\n  | '3d-studio';")

with open("src/types.ts", "w") as f:
    f.write(content)
