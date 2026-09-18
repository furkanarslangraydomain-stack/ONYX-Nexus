with open("src/App.tsx", "r") as f:
    content = f.read()

if "ThreeDStudio" not in content:
    # Add import
    content = content.replace(
        "import { ColabControlCenter } from './components/ColabControlCenter';",
        "import { ColabControlCenter } from './components/ColabControlCenter';\nimport { ThreeDStudio } from './components/ThreeDStudio';"
    )
    
    # Add tab button
    old_arch_tab = """            onClick={() => setActiveMainTab('architecture')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
              activeMainTab === 'architecture'"""
    
    new_studio_tab = """            onClick={() => setActiveMainTab('3d-studio')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
              activeMainTab === '3d-studio'
                ? 'text-emerald-400 bg-slate-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wider uppercase">3D Stüdyo</span>
          </button>
          
          <button """
          
    content = content.replace("          <button \n            onClick={() => setActiveMainTab('architecture')}", new_studio_tab + "\n            onClick={() => setActiveMainTab('architecture')}")
    
    # Add tab content
    old_arch_content = "{activeMainTab === 'architecture' && <ArchitectureDiagram />}"
    new_studio_content = "{activeMainTab === 'architecture' && <ArchitectureDiagram />}\n        {activeMainTab === '3d-studio' && <ThreeDStudio />}"
    content = content.replace(old_arch_content, new_studio_content)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("App.tsx patched.")
