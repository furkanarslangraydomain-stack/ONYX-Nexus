import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Remove installation and unnecessary side buttons, just keep "Yeni Sohbet"
new_sidebar = """
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-3">
          <button className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Plus className="w-4 h-4" /> Yeni Sohbet
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2">Kayıtlı İşlemler</div>
          <div className="px-2 text-[10px] text-slate-600">Geçmiş sqlite'dan yükleniyor...</div>
        </div>
      </div>
"""

old_sidebar_regex = r"\{\/\*\s*Sidebar\s*\*\/\}.*?\{\/\*\s*Main Content Area\s*\*\/\}"
content = re.sub(old_sidebar_regex, new_sidebar + "\n      {/* Main Content Area */}", content, flags=re.DOTALL)

# Remove Modals logic and imports
content = re.sub(r"import \{ ColabControlCenter \}.*?\n", "", content)
content = re.sub(r"import \{ CloudDeployGuide \}.*?\n", "", content)
content = re.sub(r"import \{ DiagnosticPanel \}.*?\n", "", content)
content = re.sub(r"import \{ ArchitectureDiagram \}.*?\n", "", content)
content = re.sub(r"import \{ CodeViewer \}.*?\n", "", content)
content = re.sub(r"type ModalView = .*?\n", "", content)
content = re.sub(r"const \[activeModal, setActiveModal\] = useState.*?;\n", "", content)

# Remove Modal UI
old_modal_regex = r"\{\/\*\s*Modals for old functionality\s*\*\/\}.*?\)\}"
content = re.sub(old_modal_regex, "", content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("App.tsx cleaned up. Installation guides removed.")
