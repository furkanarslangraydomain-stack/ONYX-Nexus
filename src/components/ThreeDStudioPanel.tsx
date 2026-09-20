import React, { useState } from 'react';
import { Box, Play, RotateCcw, Download, Eye, Sparkles, Layers } from 'lucide-react';

const DEFAULT_3D_SCENE = `<!DOCTYPE html>
<html>
<head>
    <title>Three.js 3D Sahne</title>
    <style>body { margin: 0; overflow: hidden; background: #020617; }</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Ambient & Directional Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // Core Glowing Wireframe Mesh
        const geometry = new THREE.IcosahedronGeometry(2.2, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            wireframe: true,
            roughness: 0.2,
            metalness: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Inner glowing core
        const innerGeom = new THREE.SphereGeometry(1.2, 32, 32);
        const innerMat = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            roughness: 0.1,
            metalness: 0.9
        });
        const innerMesh = new THREE.Mesh(innerGeom, innerMat);
        scene.add(innerMesh);

        camera.position.z = 6;

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.008;
            innerMesh.rotation.y -= 0.01;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>`;

export const ThreeDStudioPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('Merkezi yeşil wireframe icosahedron ve içinde dönen mor küre olan Three.js sahnesi hazırla');
  const [sceneHtml, setSceneHtml] = useState(DEFAULT_3D_SCENE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('onyx_api_url') || 'http://127.0.0.1:8000');

  const generateScene = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const cleanUrl = apiUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/api/3d/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.html) {
          setSceneHtml(data.html);
        }
      }
    } catch (e) {
      console.error("3D Render hatası:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([sceneHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threejs_scene_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Three.js 3D Sahne & Model Stüdyosu
              <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                MCP 3D WebGL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Doğal dil açıklamalarından canlı Three.js WebGL sahneleri, PBR materyaller ve OrbitControls kameraları üretin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadHtml}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition border border-slate-700"
          >
            <Download className="w-4 h-4" /> HTML İndir
          </button>
          <button
            onClick={generateScene}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-cyan-600/20"
          >
            {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Sahne Üretiliyor...' : '3D Sahne Oluştur'}</span>
          </button>
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateScene()}
          placeholder="Oluşturmak istediğiniz 3D sahneyi tarif edin (örn: 'Güneş sistemi, etrafında dönen gezegenler ve parçacık efekti')..."
          className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none px-2"
        />
      </div>

      {/* 3D Canvas Preview Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between backdrop-blur">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-slate-300">Canlı WebGL 3D Görüntüleyici (Mouse ile Çevrilebilir)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Three.js r128 + OrbitControls
          </span>
        </div>

        <div className="w-full h-[520px] bg-black">
          <iframe
            key={sceneHtml.length}
            srcDoc={sceneHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="3D Canvas View"
          />
        </div>
      </div>
    </div>
  );
};
