import os

with open("src/components/PipelineSimulator.tsx", "r") as f:
    content = f.read()

# Find the textarea and add an image upload button next to it
upload_btn_jsx = """
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Görev Tanımı & Özel İstekler
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 min-h-[120px]"
              placeholder="Örn: SQLite kullanarak bir yapılacaklar listesi uygulaması yaz ve Colab'da test et..."
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Görsel Yükle
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          {imageData && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
              <Check className="w-4 h-4" /> Görsel eklendi, Designer ajanı Vision analizini kullanacak.
            </div>
          )}
        </div>
"""

if "handleImageUpload" not in content:
    # Add state for image
    content = content.replace(
        "const [prompt, setPrompt] = useState('Bana Python ile gelişmiş bir HTTP brute force aracı yaz ve Colab sandbox üzerinde test et.');",
        "const [prompt, setPrompt] = useState('Bana Python ile gelişmiş bir HTTP brute force aracı yaz ve Colab sandbox üzerinde test et.');\n  const [imageData, setImageData] = useState<string | null>(null);"
    )
    
    # Add handleImageUpload function
    handler_func = """
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
"""
    content = content.replace("const handleStartSimulation = async () => {", handler_func + "\n  const handleStartSimulation = async () => {")
    
    # Update payload
    content = content.replace(
        "body: JSON.stringify({ prompt, engine: 'auto' }),",
        "body: JSON.stringify({ prompt, engine: 'auto', image_data: imageData }),"
    )
    
    # Replace textarea section
    old_textarea = """        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Görev Tanımı & Özel İstekler
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 min-h-[120px]"
            placeholder="Örn: SQLite kullanarak bir yapılacaklar listesi uygulaması yaz ve Colab'da test et..."
          />
        </div>"""
    
    content = content.replace(old_textarea, upload_btn_jsx)

with open("src/components/PipelineSimulator.tsx", "w") as f:
    f.write(content)

print("Frontend PipelineSimulator patched for Image Upload.")
