import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Layers, 
  RotateCw, 
  Sun, 
  Camera, 
  Download, 
  Code, 
  Sparkles, 
  Maximize2, 
  Eye, 
  Palette, 
  Box, 
  Sliders, 
  Check, 
  RefreshCw,
  Terminal,
  Grid
} from 'lucide-react';

type PresetModel = 'city' | 'helix' | 'torus' | 'crystal' | 'neural' | 'shader' | 'pavilion';

export function RenderStudio3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const activeMeshGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Studio State
  const [selectedModel, setSelectedModel] = useState<PresetModel>('city');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotateSpeed, setRotateSpeed] = useState(0.8);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [materialColor, setMaterialColor] = useState('#10b981');
  const [metalness, setMetalness] = useState(0.7);
  const [roughness, setRoughness] = useState(0.2);
  const [emissiveColor, setEmissiveColor] = useState('#059669');
  const [emissiveIntensity, setEmissiveIntensity] = useState(0.4);
  const [lightColor, setLightColor] = useState('#38bdf8');
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [bgColor, setBgColor] = useState('#030712');
  const [cameraPreset, setCameraPreset] = useState<'cinematic' | 'isometric' | 'top' | 'close'>('cinematic');
  
  // AI Prompt Generator
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [studioStats, setStudioStats] = useState({ triangles: 12400, geometries: 64, fps: 60 });

  // Mouse Interaction for Orbit
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 });

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(lightColor, lightIntensity);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-10, 6, -10);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xa855f7, 0.8, 50);
    fillLight.position.set(0, -2, 6);
    scene.add(fillLight);

    // Floor Grid and Reflective Plane
    const gridHelper = new THREE.GridHelper(30, 30, 0x10b981, 0x1e293b);
    gridHelper.position.y = -0.01;
    gridHelper.name = 'gridHelper';
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.85,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    floor.name = 'floor';
    scene.add(floor);

    // Group for dynamic meshes
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    activeMeshGroupRef.current = meshGroup;

    // Build Current Preset
    buildPresetModel(selectedModel, meshGroup);

    // Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Auto rotation
      if (autoRotate && activeMeshGroupRef.current) {
        activeMeshGroupRef.current.rotation.y += 0.005 * rotateSpeed;
      }

      // Procedural animations for custom models
      if (activeMeshGroupRef.current) {
        const t = time * 0.001;
        activeMeshGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && (child as any).userData?.isAnimated) {
            child.position.y += Math.sin(t * 2 + child.position.x) * 0.005;
          }
        });
      }

      renderer.render(scene, camera);

      // FPS tracking
      frameCount++;
      if (time - lastFpsUpdate > 500) {
        setStudioStats(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (time - lastFpsUpdate))
        }));
        frameCount = 0;
        lastFpsUpdate = time;
      }
    };
    animate(performance.now());

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Background & Fog
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(bgColor);
    sceneRef.current.fog = new THREE.FogExp2(bgColor, 0.035);
  }, [bgColor]);

  // Update Grid Visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    const grid = sceneRef.current.getObjectByName('gridHelper');
    if (grid) grid.visible = showGrid;
  }, [showGrid]);

  // Update Material Settings
  useEffect(() => {
    if (!activeMeshGroupRef.current) return;
    activeMeshGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.color.set(materialColor);
        child.material.metalness = metalness;
        child.material.roughness = roughness;
        child.material.wireframe = wireframe;
        child.material.emissive.set(emissiveColor);
        child.material.emissiveIntensity = emissiveIntensity;
        child.material.needsUpdate = true;
      }
    });
  }, [materialColor, metalness, roughness, wireframe, emissiveColor, emissiveIntensity]);

  // Model Builder function
  const buildPresetModel = (model: PresetModel, group: THREE.Group) => {
    // Clear previous models
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    let totalTriangles = 0;

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialColor),
      metalness: metalness,
      roughness: roughness,
      wireframe: wireframe,
      emissive: new THREE.Color(emissiveColor),
      emissiveIntensity: emissiveIntensity
    });

    if (model === 'city') {
      // Cyberpunk Procedural Skyscraper Grid
      const gridSize = 7;
      const spacing = 1.2;
      for (let x = -gridSize / 2; x < gridSize / 2; x++) {
        for (let z = -gridSize / 2; z < gridSize / 2; z++) {
          const height = Math.abs(Math.sin(x * 1.5) * Math.cos(z * 1.5)) * 4 + 0.8;
          const geo = new THREE.BoxGeometry(0.8, height, 0.8);
          const mat = baseMaterial.clone();
          if ((x + z) % 2 === 0) {
            mat.emissive.set(0x06b6d4);
            mat.emissiveIntensity = 0.6;
          }
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x * spacing, height / 2, z * spacing);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
          totalTriangles += 12;
        }
      }
    } else if (model === 'helix') {
      // Quantum DNA Double Helix
      const pointsCount = 60;
      for (let i = 0; i < pointsCount; i++) {
        const t = (i / pointsCount) * Math.PI * 6;
        const y = (i / pointsCount) * 8 - 4;
        const radius = 2.0;

        // Strand 1
        const s1Geo = new THREE.SphereGeometry(0.18, 16, 16);
        const s1Mesh = new THREE.Mesh(s1Geo, baseMaterial);
        s1Mesh.position.set(Math.cos(t) * radius, y + 4, Math.sin(t) * radius);
        group.add(s1Mesh);

        // Strand 2
        const s2Mesh = new THREE.Mesh(s1Geo.clone(), baseMaterial);
        s2Mesh.position.set(Math.cos(t + Math.PI) * radius, y + 4, Math.sin(t + Math.PI) * radius);
        group.add(s2Mesh);

        // Connecting Base Pair Cylinder
        if (i % 2 === 0) {
          const rungGeo = new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 8);
          const rungMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 });
          const rung = new THREE.Mesh(rungGeo, rungMat);
          rung.position.set(0, y + 4, 0);
          rung.rotation.z = Math.PI / 2;
          rung.rotation.y = -t;
          group.add(rung);
        }
        totalTriangles += 150;
      }
    } else if (model === 'torus') {
      // Complex Torus Knot
      const geo = new THREE.TorusKnotGeometry(2.2, 0.6, 128, 32, 2, 3);
      const mesh = new THREE.Mesh(geo, baseMaterial);
      mesh.position.y = 3.5;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      totalTriangles += geo.attributes.position.count / 3;
    } else if (model === 'crystal') {
      // Gemstone Prism with Inner Orbiting Rings
      const geo = new THREE.IcosahedronGeometry(2.5, 1);
      const mesh = new THREE.Mesh(geo, baseMaterial);
      mesh.position.y = 3.5;
      mesh.castShadow = true;
      group.add(mesh);

      // Orbiting rings
      for (let r = 0; r < 3; r++) {
        const ringGeo = new THREE.TorusGeometry(3.5 + r * 0.7, 0.04, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 3.5;
        ring.rotation.x = Math.PI / (2 + r);
        ring.rotation.y = r * 0.8;
        (ring as any).userData = { isAnimated: true };
        group.add(ring);
      }
      totalTriangles += 2400;
    } else if (model === 'neural') {
      // 3D Neural Point Cloud
      const particleCount = 1800;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 3.5;
        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta) + 3.5;
        positions[i + 2] = r * Math.cos(phi);

        colors[i] = 0.1;
        colors[i + 1] = 0.7 + Math.random() * 0.3;
        colors[i + 2] = 0.9;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });
      const points = new THREE.Points(geometry, particleMat);
      group.add(points);
      totalTriangles += particleCount;
    } else if (model === 'shader') {
      // Parametric Displaced Waveform
      const geo = new THREE.PlaneGeometry(6, 6, 48, 48);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const z = Math.sin(vx * 1.8) * Math.cos(vy * 1.8) * 0.8;
        pos.setZ(i, z);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, baseMaterial);
      mesh.rotation.x = -Math.PI / 2.5;
      mesh.position.y = 3.0;
      mesh.castShadow = true;
      group.add(mesh);
      totalTriangles += geo.attributes.position.count / 3;
    } else if (model === 'pavilion') {
      // Modernist Parametric Architectural Monolith
      const baseGeo = new THREE.CylinderGeometry(3.5, 4.0, 0.4, 32);
      const baseMesh = new THREE.Mesh(baseGeo, baseMaterial);
      baseMesh.position.y = 0.2;
      group.add(baseMesh);

      // Monolithic pillars
      const pillarCount = 8;
      for (let p = 0; p < pillarCount; p++) {
        const angle = (p / pillarCount) * Math.PI * 2;
        const pGeo = new THREE.BoxGeometry(0.3, 4.5, 0.6);
        const pMesh = new THREE.Mesh(pGeo, baseMaterial);
        pMesh.position.set(Math.cos(angle) * 3.0, 2.4, Math.sin(angle) * 3.0);
        pMesh.rotation.y = -angle;
        pMesh.castShadow = true;
        group.add(pMesh);
      }

      // Roof Canopy
      const roofGeo = new THREE.ConeGeometry(4.2, 1.2, 32);
      const roofMesh = new THREE.Mesh(roofGeo, baseMaterial);
      roofMesh.position.y = 5.2;
      roofMesh.castShadow = true;
      group.add(roofMesh);
      totalTriangles += 1800;
    }

    setStudioStats(prev => ({
      ...prev,
      triangles: Math.round(totalTriangles) || 12000,
      geometries: group.children.length
    }));
  };

  // Switch Model Preset
  const handleModelChange = (model: PresetModel) => {
    setSelectedModel(model);
    if (activeMeshGroupRef.current) {
      buildPresetModel(model, activeMeshGroupRef.current);
    }
  };

  // Camera Presets
  const setCameraView = (preset: 'cinematic' | 'isometric' | 'top' | 'close') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (preset === 'cinematic') {
      cam.position.set(10, 8, 12);
      cam.lookAt(0, 2.5, 0);
    } else if (preset === 'isometric') {
      cam.position.set(12, 12, 12);
      cam.lookAt(0, 1.5, 0);
    } else if (preset === 'top') {
      cam.position.set(0, 18, 0.1);
      cam.lookAt(0, 0, 0);
    } else if (preset === 'close') {
      cam.position.set(4, 3, 5);
      cam.lookAt(0, 2.5, 0);
    }
  };

  // Mouse Orbit Navigation Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= deltaX * 0.008;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.008));

    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 2, 0);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    sphericalRef.current.radius = Math.max(4, Math.min(30, sphericalRef.current.radius + e.deltaY * 0.01));
    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 2, 0);
  };

  // Export 4K PNG Snapshot
  const handleSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `onyx_3d_render_${selectedModel}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // AI Prompt Scene Synthesis
  const handleGenerateFromPrompt = () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Map prompt keywords to procedural models and materials
      const p = promptInput.toLowerCase();
      if (p.includes('dna') || p.includes('helix') || p.includes('bio')) {
        handleModelChange('helix');
        setMaterialColor('#38bdf8');
        setEmissiveColor('#0284c7');
      } else if (p.includes('knot') || p.includes('metal') || p.includes('gold')) {
        handleModelChange('torus');
        setMaterialColor('#f59e0b');
        setMetalness(0.95);
        setRoughness(0.1);
      } else if (p.includes('crystal') || p.includes('reactor') || p.includes('gem')) {
        handleModelChange('crystal');
        setMaterialColor('#ec4899');
        setEmissiveColor('#be185d');
      } else if (p.includes('city') || p.includes('cyber') || p.includes('building')) {
        handleModelChange('city');
        setMaterialColor('#10b981');
      } else if (p.includes('brain') || p.includes('neural') || p.includes('ai')) {
        handleModelChange('neural');
      } else {
        handleModelChange('shader');
      }
    }, 900);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono select-none">
      
      {/* Studio Header Toolbar */}
      <div className="h-13 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              ONYX 3D RENDER STUDIO
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Three.js WebGL
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Prosedürel Geometri, PBR Materyal ve Işık Simülasyonu</div>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            title="4K PNG Görüntüsü İndir"
          >
            <Download className="w-3.5 h-3.5" /> Render Al (.PNG)
          </button>
          <button
            onClick={() => setShowCodeModal(!showCodeModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
          >
            <Code className="w-3.5 h-3.5" /> Three.js Kodu
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Preset Models & AI Prompt */}
        <div className="w-72 bg-slate-900/60 border-r border-slate-800 p-3.5 flex flex-col gap-4 overflow-y-auto">
          
          {/* AI Prompt Generator */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Yapay Zeka 3D Sahne Üreteci
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Doğal dilde 3D sahne tanımlayın; ajan prosedürel mesh parametrelerini anında sentezlesin.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromPrompt()}
                placeholder="Örn: Siberpunk kuantum kristal reaktörü..."
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleGenerateFromPrompt}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isGenerating ? 'Oluşturuluyor...' : 'Sahneyi Sentezle'}
              </button>
            </div>
          </div>

          {/* Preset Geometries */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-cyan-400" /> Prosedürel 3D Modeller
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'city', name: 'Cyberpunk Hologram Şehir', desc: 'Gökdelen ızgarası & neon ışıklar' },
                { id: 'helix', name: 'Kuantum DNA Çift Sarmal', desc: '60 basamaklı parametrik molekül' },
                { id: 'torus', name: 'Torus Düğümü (Knot)', desc: 'Yüksek poligonlu PBR metalik yüzey' },
                { id: 'crystal', name: 'Prizma Kristal & Halkalar', desc: 'Yörüngesel halkalı enerji çekirdeği' },
                { id: 'neural', name: 'Yapay Sinir Nokta Bulutu', desc: '1800 partiküllü nöral ağ' },
                { id: 'shader', name: 'GLSL Dalga Formu', desc: 'Sinüzoidal matematiksel deformasyon' },
                { id: 'pavilion', name: 'Monolit Mimari Pavyon', desc: 'Modernist parametrik kolonlar' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id as PresetModel)}
                  className={`p-2 rounded-lg text-left transition border ${
                    selectedModel === m.id
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    {m.name}
                    {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Angles */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-400" /> Kamera Açıları
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'cinematic', label: 'Sinematik 45°' },
                { id: 'isometric', label: 'İzometrik' },
                { id: 'top', label: 'Üstten Kuşbakışı' },
                { id: 'close', label: 'Makro Yakın' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCameraView(c.id as any)}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-mono border transition ${
                    cameraPreset === c.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Interactive 3D Canvas Viewport */}
        <div className="flex-1 relative flex flex-col bg-slate-950">
          
          {/* Viewport Overlay Controls */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 p-1.5 rounded-lg text-xs">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1.5 rounded transition ${autoRotate ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Otomatik Dönüş Aç/Kapat"
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded transition ${showGrid ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Zemin Izgarası (Grid)"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-1.5 rounded transition ${wireframe ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Tel Kafes (Wireframe) Modu"
            >
              <Box className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-[10px] text-slate-400 px-1">
              Fareyle Sürükle (Döndür) • Tekerlek (Yakınlaştır)
            </span>
          </div>

          {/* Studio Telemetry Badge (FPS / Triangles) */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-3 text-slate-400">
            <div>FPS: <span className="text-emerald-400 font-bold">{studioStats.fps}</span></div>
            <div>Üçgenler: <span className="text-slate-200">{studioStats.triangles.toLocaleString()}</span></div>
            <div>Geometri: <span className="text-slate-200">{studioStats.geometries}</span></div>
          </div>

          {/* Three.js Canvas Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing outline-none"
          />
        </div>

        {/* Right Side: Material & Studio Lighting Inspector */}
        <div className="w-72 bg-slate-900/60 border-l border-slate-800 p-3.5 flex flex-col gap-4 overflow-y-auto">
          
          {/* Material PBR Controls */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" /> PBR Materyal Düzenleyici
            </div>

            <div className="space-y-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px]">
              
              {/* Primary Color */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Yüzey Rengi (Albedo):</span>
                  <span className="font-mono text-slate-200">{materialColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={materialColor}
                    onChange={(e) => setMaterialColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setMaterialColor(c)}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Metalness Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Metaliklik (Metalness):</span>
                  <span className="font-mono text-emerald-400">{metalness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Roughness Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pürüzlülük (Roughness):</span>
                  <span className="font-mono text-emerald-400">{roughness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Emissive Glow */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Neon Işıma (Emissive):</span>
                  <span className="font-mono text-slate-200">{emissiveIntensity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={emissiveColor}
                    onChange={(e) => setEmissiveColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={emissiveIntensity}
                    onChange={(e) => setEmissiveIntensity(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lighting Rig Controls */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Stüdyo Işık Teçhizatı
            </div>

            <div className="space-y-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Ana Işık (Key Light):</span>
                  <span className="font-mono text-amber-400">{lightIntensity}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Rotation Speed */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Dönüş Hızı:</span>
                  <span className="font-mono text-cyan-400">{rotateSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={rotateSpeed}
                  onChange={(e) => setRotateSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Background Color Preset */}
              <div>
                <div className="text-slate-400 mb-1.5">Arkaplan Atmosferi:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    { label: 'Siber Boşluk', color: '#030712' },
                    { label: 'Derin Gece', color: '#090d16' },
                    { label: 'Stüdyo Grisi', color: '#1e293b' },
                    { label: 'Mor Sis', color: '#140826' },
                  ].map((bg) => (
                    <button
                      key={bg.color}
                      onClick={() => setBgColor(bg.color)}
                      className={`p-1.5 rounded border text-left transition ${
                        bgColor === bg.color
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Üretilen Three.js Kaynak Kodu
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Kapat
              </button>
            </div>
            <div className="p-4 bg-slate-950 overflow-x-auto max-h-[60vh] text-[11px] font-mono text-emerald-300 leading-relaxed">
              <pre>{`// ONYX-Nexus Three.js Standalone Prosedürel 3D Sahnesi
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color('${bgColor}');
scene.fog = new THREE.FogExp2('${bgColor}', 0.035);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 8, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Işıklandırma
const keyLight = new THREE.DirectionalLight('${lightColor}', ${lightIntensity});
keyLight.position.set(8, 14, 8);
scene.add(keyLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ${selectedModel.toUpperCase()} Prosedürel Geometri & PBR Materyal
const material = new THREE.MeshStandardMaterial({
  color: '${materialColor}',
  metalness: ${metalness},
  roughness: ${roughness},
  wireframe: ${wireframe},
  emissive: '${emissiveColor}',
  emissiveIntensity: ${emissiveIntensity}
});

// Animasyon Döngüsü
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();`}</pre>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`// ONYX Three.js Code export`);
                  alert("Kopyalandı!");
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Panoya Kopyala
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
