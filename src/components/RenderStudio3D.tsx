import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Camera, 
  Download, 
  Layers, 
  RotateCw, 
  Sun, 
  Box, 
  Eye, 
  Code, 
  Share2, 
  Maximize2, 
  RefreshCw, 
  Check, 
  Sliders,
  Grid,
  Palette,
  ShieldCheck
} from 'lucide-react';
import { 
  SceneObject, 
  SceneEnvironment, 
  PrimitiveType, 
  AnimationTimelineState,
  ObjectKeyframeTrack,
  TransformKeyframe,
  PhysicsWorldConfig,
  AudioReactiveConfig,
  PostProcessingConfig,
  DirectorCameraShot,
  WebXrViewMode,
  SystemHealthMetrics
} from './studio3d/types';
import { 
  INITIAL_SCENE_OBJECTS, 
  DEFAULT_ENVIRONMENT 
} from './studio3d/defaultScenes';
import { SceneDesignerPanel } from './studio3d/SceneDesignerPanel';
import { AiVisionSceneModal } from './studio3d/AiVisionSceneModal';
import { AnimationTimelineBar } from './studio3d/AnimationTimelineBar';
import { KeyframeStudio } from './studio3d/KeyframeStudio';
import { AdvancedStudioToolbar } from './studio3d/AdvancedStudioToolbar';
import { ModelLibraryModal } from './studio3d/ModelLibraryModal';
import { SelfHealingSentinel } from './studio3d/SelfHealingSentinel';
import { SelfHealingBoundary } from './studio3d/SelfHealingBoundary';
import { selfHealingEngine } from './studio3d/selfHealing';
import { physicsEngine } from './studio3d/physicsEngine';
import { audioReactiveEngine } from './studio3d/audioReactive';
import { directorCameraRig } from './studio3d/directorCamera';
import { defaultPostProcessingConfig } from './studio3d/postProcessing';
import { KeyframeInterpolator } from './studio3d/keyframeInterpolator';
import { useModuleHealthCheck } from './studio3d/useModuleHealthCheck';
import { consciousnessEngine } from './studio3d/consciousnessEngine';

export function RenderStudio3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const originalPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const bounceEffectsRef = useRef<Map<string, { startTime: number, height: number, originalY: number }>>(new Map());
  const spinEffectsRef = useRef<Map<string, { startTime: number, startRotationY: number }>>(new Map());

  // MediaRecorder Ref for Animation Video Export
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Scene State
  const [sceneTitle, setSceneTitle] = useState('Cyberpunk Studio & Kuantum Odası');
  const [objects, setObjects] = useState<SceneObject[]>(INITIAL_SCENE_OBJECTS);
  const [selectedId, setSelectedId] = useState<string | null>('obj-1');
  const [environment, setEnvironment] = useState<SceneEnvironment>(DEFAULT_ENVIRONMENT);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isModelLibraryOpen, setIsModelLibraryOpen] = useState(false);
  const [isSelfHealingOpen, setIsSelfHealingOpen] = useState(false);
  const [isKeyframeStudioOpen, setIsKeyframeStudioOpen] = useState(false);
  const [studioStats, setStudioStats] = useState({ triangles: 14200, geometries: 5, fps: 60 });
  const [designerOpen, setDesignerOpen] = useState(true);
  const [healthScore, setHealthScore] = useState(98);

  // Standard Timeline State
  const [timelineState, setTimelineState] = useState<AnimationTimelineState>({
    isPlaying: true,
    speed: 1.0,
    currentTime: 0,
    globalMode: 'individual',
    explosionFactor: 0,
    clickInteraction: 'bounce'
  });

  // Professional Keyframe Tracks State
  const [keyframeTracks, setKeyframeTracks] = useState<ObjectKeyframeTrack[]>(() => {
    return INITIAL_SCENE_OBJECTS.map((obj, i) => ({
      objectId: obj.id,
      objectName: obj.name,
      keyframes: [
        {
          id: `kf-${obj.id}-0`,
          time: 0.0,
          position: [...obj.position] as [number, number, number],
          rotation: [...obj.rotation] as [number, number, number],
          scale: [...obj.scale] as [number, number, number],
          interpolation: 'bezier'
        },
        {
          id: `kf-${obj.id}-1`,
          time: 5.0,
          position: [obj.position[0], obj.position[1] + (i % 2 === 0 ? 1.5 : -0.8), obj.position[2]] as [number, number, number],
          rotation: [obj.rotation[0], obj.rotation[1] + Math.PI, obj.rotation[2]] as [number, number, number],
          scale: [obj.scale[0] * 1.2, obj.scale[1] * 1.2, obj.scale[2] * 1.2] as [number, number, number],
          interpolation: 'bezier'
        },
        {
          id: `kf-${obj.id}-2`,
          time: 10.0,
          position: [...obj.position] as [number, number, number],
          rotation: [obj.rotation[0], obj.rotation[1] + Math.PI * 2, obj.rotation[2]] as [number, number, number],
          scale: [...obj.scale] as [number, number, number],
          interpolation: 'bezier'
        }
      ]
    }));
  });

  const [keyframeTime, setKeyframeTime] = useState(0);
  const [isKeyframePlaying, setIsKeyframePlaying] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);

  // 5 Advanced Features States
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsWorldConfig>(physicsEngine.config);
  const [audioConfig, setAudioConfig] = useState<AudioReactiveConfig>(audioReactiveEngine.config);
  const [postProcessing, setPostProcessing] = useState<PostProcessingConfig>(defaultPostProcessingConfig);
  const [cameraShot, setCameraShot] = useState<DirectorCameraShot>('free');
  const [xrMode, setXrMode] = useState<WebXrViewMode>('standard');
  const [sentinelTab, setSentinelTab] = useState<'modules' | 'sentinel' | 'consciousness'>('modules');

  // Periodic Health Check hook scanning 5 external modules with automated recovery
  const healthCheck = useModuleHealthCheck({
    enabled: true,
    scanIntervalMs: 2500,
    autoReinitOnFailure: true,
    objects,
    cameraRef,
    rendererRef,
    sceneRef,
    postProcessingConfig: postProcessing,
    onPostProcessingReset: setPostProcessing,
    onReinitialized: (modId, reason) => {
      consciousnessEngine.perceiveEnvironment({
        objectCount: objects.length,
        healthScore,
        audioActive: audioConfig.enabled,
        physicsActive: physicsConfig.enabled,
        recentIncident: `${modId}: ${reason}`
      });
    }
  });

  // Mouse Orbit Camera
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 });

  // References for lights & floor to update dynamically
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.PointLight | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);

  // Subscribe to Self-Healing Health Metrics
  useEffect(() => {
    const unsub = selfHealingEngine.subscribeToHealth((m) => {
      setHealthScore(m.healthScore);
    });
    return unsub;
  }, []);

  // Sync physics objects
  useEffect(() => {
    physicsEngine.initOrSyncObjects(objects);
  }, [objects]);

  // Periodic Snapshot for Zero-Loss Recovery
  useEffect(() => {
    selfHealingEngine.saveSnapshot(objects, environment);
    const interval = setInterval(() => {
      selfHealingEngine.saveSnapshot(objects, environment);
    }, 12000);
    return () => clearInterval(interval);
  }, [objects, environment]);

  // Helper: Create Three.js Geometry based on type
  const createGeometry = (type: PrimitiveType): THREE.BufferGeometry => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 1, 32);
      case 'torus':
        return new THREE.TorusGeometry(1, 0.35, 24, 64);
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(0.8, 0.28, 96, 24);
      case 'cone':
        return new THREE.ConeGeometry(1, 2, 32);
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(1, 0);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(1, 0);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Helper: Create Three.js Material based on object material
  const createMaterial = (mat: SceneObject['material'], isSelected: boolean): THREE.Material => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(mat.color),
      metalness: Number.isFinite(mat.metalness) ? mat.metalness : 0.7,
      roughness: Number.isFinite(mat.roughness) ? mat.roughness : 0.2,
      emissive: new THREE.Color(isSelected ? '#38bdf8' : mat.emissive),
      emissiveIntensity: isSelected ? Math.max(0.6, mat.emissiveIntensity) : mat.emissiveIntensity,
      wireframe: mat.wireframe,
      transparent: mat.transparent,
      opacity: Number.isFinite(mat.opacity) ? mat.opacity : 1.0,
      side: THREE.DoubleSide
    });
  };

  // Camera Helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    const safePos = selfHealingEngine.sanitizeVector3([x, y, z], [0, 5, 14]);
    cameraRef.current.position.set(safePos[0], safePos[1], safePos[2]);
    cameraRef.current.lookAt(0, 1.5, 0);
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(environment.bgColor);
    if (environment.fogEnabled) {
      scene.fog = new THREE.FogExp2(environment.fogColor, environment.fogDensity);
    }
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup Autonomous WebGL Context Loss Shield
    const removeContextShield = selfHealingEngine.setupContextLossShield(
      renderer.domElement,
      () => {
        // Automatically re-render and rebind on context restored
        handlePurgeAndRestore();
      }
    );

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(environment.ambientColor, environment.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(environment.keyLightColor, environment.keyLightIntensity);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.PointLight(environment.fillLightColor, environment.fillLightIntensity, 25);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 5. Studio Floor & Grid
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      metalness: 0.85,
      roughness: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);
    floorMeshRef.current = floor;

    const grid = new THREE.GridHelper(30, 30, 0x10b981, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // 6. Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // 7. Master Render & Animation Loop with Autonomous Self-Healing Protection
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const currentTimestamp = typeof time === 'number' && Number.isFinite(time) ? time : performance.now();
      const deltaSeconds = Math.min((currentTimestamp - lastTime) * 0.001, 0.1);
      lastTime = currentTimestamp;

      const speed = Number.isFinite(timelineState.speed) ? timelineState.speed : 1.0;
      const isPlaying = timelineState.isPlaying;

      // --- A. Director Camera Rig Update ---
      if (cameraRef.current) {
        directorCameraRig.update(cameraRef.current, deltaSeconds);
      }

      // --- B. Audio-Reactive Frequency Extraction ---
      let audioBands = { bass: 0, mid: 0, treble: 0, peak: 0 };
      if (audioConfig.enabled) {
        audioBands = audioReactiveEngine.getLevels();
      }

      // --- C. Physics Engine Step ---
      if (physicsConfig.enabled) {
        const simulatedObjects = physicsEngine.step(objects, deltaSeconds);
        // Sync simulated positions to Three.js meshes
        simulatedObjects.forEach(sObj => {
          const mesh = meshMapRef.current.get(sObj.id);
          if (mesh) {
            mesh.position.set(sObj.position[0], sObj.position[1], sObj.position[2]);
            mesh.rotation.set(sObj.rotation[0], sObj.rotation[1], sObj.rotation[2]);
          }
        });
      }

      // --- D. Keyframe Studio Playback & Interpolation ---
      if (isKeyframePlaying) {
        setKeyframeTime(prev => {
          const next = prev + deltaSeconds * speed;
          return next > 10 ? 0 : next;
        });
      }

      // Animate 3D Meshes (if physics not overriding)
      if (!physicsConfig.enabled && isPlaying && objectsGroupRef.current) {
        const t = currentTimestamp * 0.001 * speed;

        // Global mode animations
        if (timelineState.globalMode === 'orbit_all') {
          objectsGroupRef.current.rotation.y += 0.008 * speed;
        }

        // Animate individual objects
        objects.forEach((obj, idx) => {
          const mesh = meshMapRef.current.get(obj.id);
          const origPos = originalPositionsRef.current.get(obj.id);
          if (!mesh || !origPos) return;

          // Check if undergoing interactive bounce
          const activeBounce = bounceEffectsRef.current.get(obj.id);
          if (activeBounce) {
            const elapsed = (currentTimestamp - activeBounce.startTime) * 0.001;
            if (elapsed < 0.6) {
              const bounceY = Math.sin(elapsed * Math.PI / 0.6) * activeBounce.height;
              mesh.position.y = activeBounce.originalY + bounceY;
            } else {
              mesh.position.y = activeBounce.originalY;
              bounceEffectsRef.current.delete(obj.id);
            }
          }

          // Check if undergoing interactive spin
          const activeSpin = spinEffectsRef.current.get(obj.id);
          if (activeSpin) {
            const elapsed = (currentTimestamp - activeSpin.startTime) * 0.001;
            if (elapsed < 0.5) {
              mesh.rotation.y = activeSpin.startRotationY + (elapsed / 0.5) * Math.PI * 2;
            } else {
              mesh.rotation.y = activeSpin.startRotationY + Math.PI * 2;
              spinEffectsRef.current.delete(obj.id);
            }
          }

          // Audio-reactive visual modulation
          if (audioConfig.enabled && audioBands.peak > 0.05) {
            const bassMod = 1 + audioBands.bass * 0.45;
            mesh.scale.set(obj.scale[0] * bassMod, obj.scale[1] * bassMod, obj.scale[2] * bassMod);
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.emissiveIntensity = Math.min(2.5, obj.material.emissiveIntensity + audioBands.treble * 1.6);
            }
          }

          // Global modes overrides
          if (timelineState.globalMode === 'explode') {
            const factor = Number.isFinite(timelineState.explosionFactor) ? timelineState.explosionFactor : 0;
            mesh.position.x = origPos.x + origPos.x * factor * 1.5;
            mesh.position.y = origPos.y + origPos.y * factor * 1.2;
            mesh.position.z = origPos.z + origPos.z * factor * 1.5;
          } else if (timelineState.globalMode === 'float_all' && !activeBounce) {
            mesh.position.y = origPos.y + Math.sin(t * 2 + idx * 0.8) * 0.4;
          } else if (timelineState.globalMode === 'pulse_all' && !audioConfig.enabled) {
            const pulse = 1 + Math.sin(t * 3 + idx) * 0.15;
            mesh.scale.set(obj.scale[0] * pulse, obj.scale[1] * pulse, obj.scale[2] * pulse);
          } else if (timelineState.globalMode === 'wave_all' && !activeBounce) {
            mesh.position.y = origPos.y + Math.sin(t * 2.5 + origPos.x * 0.8) * 0.5;
          } else if (timelineState.globalMode === 'individual' && obj.animation.enabled) {
            const objSpeed = Number.isFinite(obj.animation.speed) ? obj.animation.speed : 1;
            const amp = Number.isFinite(obj.animation.amplitude) ? obj.animation.amplitude : 1;
            
            if (obj.animation.type === 'spin') {
              mesh.rotation.y += 0.015 * objSpeed * speed;
            } else if (obj.animation.type === 'float' && !activeBounce) {
              mesh.position.y = origPos.y + Math.sin(t * 2 * objSpeed + idx) * 0.4 * amp;
            } else if (obj.animation.type === 'pulse' && !audioConfig.enabled) {
              const p = 1 + Math.sin(t * 3 * objSpeed) * 0.2 * amp;
              mesh.scale.set(obj.scale[0] * p, obj.scale[1] * p, obj.scale[2] * p);
            } else if (obj.animation.type === 'wave' && !activeBounce) {
              mesh.position.y = origPos.y + Math.cos(t * 2.5 * objSpeed + origPos.x) * 0.3 * amp;
            } else if (obj.animation.type === 'orbit') {
              const radius = Math.sqrt(origPos.x * origPos.x + origPos.z * origPos.z) || 3;
              const angle = Math.atan2(origPos.z, origPos.x) + t * 0.8 * objSpeed;
              mesh.position.x = Math.cos(angle) * radius;
              mesh.position.z = Math.sin(angle) * radius;
            }
          }
        });
      }

      // WebGL Render Call
      try {
        renderer.render(scene, camera);
      } catch (renderErr: any) {
        selfHealingEngine.recordIncident(
          'nan_vector_trap',
          'critical',
          `Render döngüsü hatası: ${renderErr?.message || 'Bilinmeyen shader hatası'}. Sahne otomatik sıfırlandı.`
        );
      }

      // FPS tracking with robust checks
      frameCount++;
      const elapsed = currentTimestamp - lastFpsUpdate;
      if (elapsed >= 500) {
        const measuredFps = Math.round((frameCount * 1000) / elapsed);
        setStudioStats(prev => ({
          ...prev,
          fps: Number.isFinite(measuredFps) && measuredFps > 0 ? measuredFps : 60
        }));
        frameCount = 0;
        lastFpsUpdate = currentTimestamp;
      }
    };
    animate(performance.now());

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 550;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      removeContextShield();
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Sync evaluated keyframes to scene when Keyframe Studio is active
  useEffect(() => {
    if (isKeyframeStudioOpen && keyframeTracks.length > 0) {
      const evaluated = KeyframeInterpolator.evaluateTracks(objects, keyframeTracks, keyframeTime);
      evaluated.forEach(eObj => {
        const mesh = meshMapRef.current.get(eObj.id);
        if (mesh) {
          mesh.position.set(eObj.position[0], eObj.position[1], eObj.position[2]);
          mesh.rotation.set(eObj.rotation[0], eObj.rotation[1], eObj.rotation[2]);
          mesh.scale.set(eObj.scale[0], eObj.scale[1], eObj.scale[2]);
        }
      });
    }
  }, [keyframeTime, isKeyframeStudioOpen, keyframeTracks]);

  // Update Three.js Meshes when `objects` or `selectedId` state changes
  useEffect(() => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;

    // Clear old meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else if (child.material) child.material.dispose();
    }
    meshMapRef.current.clear();
    originalPositionsRef.current.clear();

    let totalTriangles = 0;

    // Build new meshes from `objects`
    objects.forEach((obj) => {
      const isSelected = obj.id === selectedId;
      const geo = createGeometry(obj.type);
      const mat = createMaterial(obj.material, isSelected);
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
      mesh.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
      mesh.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);

      mesh.castShadow = obj.castShadow;
      mesh.receiveShadow = obj.receiveShadow;
      mesh.userData = { id: obj.id, name: obj.name };

      group.add(mesh);
      meshMapRef.current.set(obj.id, mesh);
      originalPositionsRef.current.set(obj.id, new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]));

      if (geo.index) {
        totalTriangles += geo.index.count / 3;
      } else if (geo.attributes.position) {
        totalTriangles += geo.attributes.position.count / 3;
      }
    });

    setStudioStats(prev => ({
      ...prev,
      triangles: Math.round(totalTriangles) || 12000,
      geometries: objects.length
    }));
  }, [objects, selectedId]);

  // Update Environment & Lighting
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    scene.background = new THREE.Color(environment.bgColor);
    if (environment.fogEnabled) {
      scene.fog = new THREE.FogExp2(environment.fogColor, environment.fogDensity);
    } else {
      scene.fog = null;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color = new THREE.Color(environment.ambientColor);
      ambientLightRef.current.intensity = environment.ambientIntensity;
    }
    if (keyLightRef.current) {
      keyLightRef.current.color = new THREE.Color(environment.keyLightColor);
      keyLightRef.current.intensity = environment.keyLightIntensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color = new THREE.Color(environment.fillLightColor);
      fillLightRef.current.intensity = environment.fillLightIntensity;
    }
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = environment.showGrid;
    }
    if (floorMeshRef.current) {
      floorMeshRef.current.visible = environment.showFloor;
    }
  }, [environment]);

  // Mouse Handlers for 3D Viewport Interaction & Raycaster Selection
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || cameraShot !== 'free') return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    sphericalRef.current.theta -= deltaX * 0.008;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.008));

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cameraShot !== 'free') return;
    sphericalRef.current.radius = Math.max(4, Math.min(40, sphericalRef.current.radius + e.deltaY * 0.015));
    updateCameraPosition();
  };

  // Canvas Click: Raycast to select object and trigger tactile animation response
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    if (objectsGroupRef.current) {
      const intersects = raycaster.intersectObjects(objectsGroupRef.current.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const objectId = hit.userData?.id;
        if (objectId) {
          setSelectedId(objectId);

          // If physics enabled and click, apply throw impulse!
          if (physicsConfig.enabled) {
            physicsEngine.applyImpulse(objectId, [
              (Math.random() - 0.5) * 3,
              4.5 + Math.random() * 2,
              (Math.random() - 0.5) * 3
            ]);
          }

          // Trigger click interaction response
          const interaction = timelineState.clickInteraction;
          if (interaction === 'bounce') {
            bounceEffectsRef.current.set(objectId, {
              startTime: performance.now(),
              height: 1.2,
              originalY: hit.position.y
            });
          } else if (interaction === 'spin') {
            spinEffectsRef.current.set(objectId, {
              startTime: performance.now(),
              startRotationY: hit.rotation.y
            });
          } else if (interaction === 'glow') {
            if (hit.material instanceof THREE.MeshStandardMaterial) {
              const origIntensity = hit.material.emissiveIntensity;
              hit.material.emissiveIntensity = 2.0;
              setTimeout(() => {
                if (hit.material instanceof THREE.MeshStandardMaterial) {
                  hit.material.emissiveIntensity = origIntensity;
                }
              }, 400);
            }
          }
        }
      }
    }
  };

  // Scene CRUD Operations
  const handleAddObject = (type: PrimitiveType) => {
    const newId = `obj-${Date.now()}`;
    const newObj: SceneObject = {
      id: newId,
      name: `Yeni ${type.toUpperCase()}`,
      type,
      position: [
        (Math.random() - 0.5) * 6,
        1.5 + Math.random() * 2,
        (Math.random() - 0.5) * 6
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#38bdf8',
        metalness: 0.8,
        roughness: 0.2,
        emissive: '#0284c7',
        emissiveIntensity: 0.4,
        wireframe: false,
        opacity: 1,
        transparent: false
      },
      animation: {
        enabled: true,
        type: 'float',
        speed: 1.0,
        amplitude: 0.5,
        axis: 'y'
      },
      castShadow: true,
      receiveShadow: true
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedId(newId);
  };

  const handleUpdateObject = (updated: SceneObject) => {
    setObjects(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleDeleteObject = (id: string) => {
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateObject = (id: string) => {
    const target = objects.find(o => o.id === id);
    if (!target) return;
    const newId = `obj-${Date.now()}`;
    const clone: SceneObject = {
      ...target,
      id: newId,
      name: `${target.name} (Kopya)`,
      position: [target.position[0] + 1.2, target.position[1], target.position[2] + 1.2]
    };
    setObjects(prev => [...prev, clone]);
    setSelectedId(newId);
  };

  const handleResetSceneTransforms = () => {
    if (objectsGroupRef.current) {
      objectsGroupRef.current.rotation.set(0, 0, 0);
    }
    setTimelineState(prev => ({ ...prev, explosionFactor: 0 }));
    sphericalRef.current = { radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 };
    updateCameraPosition();
  };

  // Self-Healing Rollback Action
  const handleRollbackSnapshot = () => {
    const snap = selfHealingEngine.rollbackToHealthySnapshot();
    if (snap) {
      setObjects(snap.objects);
      setEnvironment(snap.environment);
      setSelectedId(snap.objects[0]?.id || null);
    }
  };

  // Self-Healing GPU Memory Purge
  const handlePurgeAndRestore = () => {
    if (sceneRef.current && rendererRef.current) {
      selfHealingEngine.purgeUnusedGpuBuffers(sceneRef.current, rendererRef.current);
    }
  };

  // Throw selected object physics impulse
  const handleThrowSelected = () => {
    if (selectedId) {
      physicsEngine.applyImpulse(selectedId, [
        (Math.random() - 0.5) * 4,
        6.5,
        (Math.random() - 0.5) * 4
      ]);
    }
  };

  // Add Keyframe to current object at keyframeTime
  const handleAddKeyframe = (objId: string, time: number) => {
    const target = objects.find(o => o.id === objId);
    if (!target) return;

    setKeyframeTracks(prev => {
      const existing = prev.find(t => t.objectId === objId);
      const newKf: TransformKeyframe = {
        id: `kf-${objId}-${Date.now()}`,
        time: parseFloat(time.toFixed(2)),
        position: [...target.position],
        rotation: [...target.rotation],
        scale: [...target.scale],
        interpolation: 'bezier'
      };

      if (!existing) {
        return [...prev, { objectId: objId, objectName: target.name, keyframes: [newKf] }];
      }

      const filtered = existing.keyframes.filter(k => Math.abs(k.time - time) > 0.05);
      const updatedTrack = {
        ...existing,
        keyframes: [...filtered, newKf].sort((a, b) => a.time - b.time)
      };
      return prev.map(t => t.objectId === objId ? updatedTrack : t);
    });
  };

  const handleRemoveKeyframe = (objId: string, kfId: string) => {
    setKeyframeTracks(prev => prev.map(t => {
      if (t.objectId !== objId) return t;
      return { ...t, keyframes: t.keyframes.filter(k => k.id !== kfId) };
    }));
  };

  // Choreography Presets
  const handleApplyChoreography = (preset: 'cosmic' | 'helix' | 'mech') => {
    setKeyframeTracks(objects.map((obj, i) => {
      const isLeader = i === 0;
      let kfs: TransformKeyframe[] = [];

      if (preset === 'cosmic') {
        kfs = [
          { id: `c-0-${obj.id}`, time: 0, position: [...obj.position], rotation: [0, 0, 0], scale: [1, 1, 1], interpolation: 'bezier' },
          { id: `c-1-${obj.id}`, time: 3.3, position: [obj.position[0] * 1.5, obj.position[1] + 2.5, obj.position[2] * 1.5], rotation: [0, Math.PI, 0], scale: [1.3, 1.3, 1.3], interpolation: 'bezier' },
          { id: `c-2-${obj.id}`, time: 6.6, position: [obj.position[0] * 0.7, obj.position[1] + 4.0, obj.position[2] * 0.7], rotation: [Math.PI, Math.PI * 2, 0], scale: [0.8, 0.8, 0.8], interpolation: 'bezier' },
          { id: `c-3-${obj.id}`, time: 10, position: [...obj.position], rotation: [0, Math.PI * 2, 0], scale: [1, 1, 1], interpolation: 'bezier' }
        ];
      } else if (preset === 'helix') {
        const angle = (i / objects.length) * Math.PI * 2;
        kfs = [
          { id: `h-0-${obj.id}`, time: 0, position: [Math.cos(angle) * 4, 1.5, Math.sin(angle) * 4], rotation: [0, angle, 0], scale: [1, 1, 1], interpolation: 'bezier' },
          { id: `h-1-${obj.id}`, time: 5, position: [Math.cos(angle + Math.PI) * 5, 4.0, Math.sin(angle + Math.PI) * 5], rotation: [0, angle + Math.PI, 0], scale: [1.2, 1.2, 1.2], interpolation: 'bezier' },
          { id: `h-2-${obj.id}`, time: 10, position: [Math.cos(angle) * 4, 1.5, Math.sin(angle) * 4], rotation: [0, angle + Math.PI * 2, 0], scale: [1, 1, 1], interpolation: 'bezier' }
        ];
      } else {
        // Mech Launch
        kfs = [
          { id: `m-0-${obj.id}`, time: 0, position: [...obj.position], rotation: [0, 0, 0], scale: [1, 1, 1], interpolation: 'bezier' },
          { id: `m-1-${obj.id}`, time: 2, position: [obj.position[0], 0.4, obj.position[2]], rotation: [0.2, 0, 0], scale: [1.1, 0.8, 1.1], interpolation: 'bezier' },
          { id: `m-2-${obj.id}`, time: 4.5, position: [obj.position[0], 6.5, obj.position[2]], rotation: [-0.3, 0, 0], scale: [0.9, 1.3, 0.9], interpolation: 'bezier' },
          { id: `m-3-${obj.id}`, time: 10, position: [...obj.position], rotation: [0, 0, 0], scale: [1, 1, 1], interpolation: 'bezier' }
        ];
      }

      return {
        objectId: obj.id,
        objectName: obj.name,
        keyframes: kfs
      };
    }));

    setIsKeyframeStudioOpen(true);
    setIsKeyframePlaying(true);
  };

  // Video Recording from Canvas
  const handleRecordVideo = () => {
    if (!rendererRef.current) return;
    const canvas = rendererRef.current.domElement;

    if (isRecordingVideo) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVideo(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onyx_3d_animation_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);

      // Auto-stop after 8 seconds of recording
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecordingVideo(false);
        }
      }, 8000);
    } catch (err) {
      console.warn('Video recorder error:', err);
      selfHealingEngine.recordIncident(
        'circuit_breaker_trip',
        'low',
        'Video kaydı başlatılamadı, fallback PNG ekran görüntüsü alındı.'
      );
      handleTakeSnapshot();
    }
  };

  // Snapshot capture
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${sceneTitle.toLowerCase().replace(/\s+/g, '_')}_render.png`;
    link.href = dataUrl;
    link.click();
  };

  // JSON Export
  const handleExportJson = () => {
    const sceneData = {
      scene_title: sceneTitle,
      environment,
      objects,
      keyframeTracks,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onyx_3d_scene_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SelfHealingBoundary fallbackSnapshot={handleRollbackSnapshot}>
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
        
        {/* Top Action Toolbar */}
        <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/70 backdrop-blur shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shadow-md">
                3D
              </div>
              <span className="font-bold text-xs text-slate-100 font-mono tracking-tight truncate max-w-xs">
                {sceneTitle}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Studio Pro • 60 FPS Engine</span>
            </div>
          </div>

          {/* Toolbar Buttons */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setIsVisionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-purple-950/40 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Görselden AI Sahne Üret</span>
              <span className="md:hidden">AI Sahne</span>
            </button>

            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Yüksek Çözünürlüklü Ekran Görüntüsü Al"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Render Al</span>
            </button>

            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Sahneyi JSON Olarak Dışa Aktar"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={() => setDesignerOpen(!designerOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                designerOpen
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tasarım Paneli</span>
            </button>
          </div>
        </div>

        {/* 5 Advanced Modules Sub-Toolbar */}
        <AdvancedStudioToolbar
          onOpenModelLibrary={() => setIsModelLibraryOpen(true)}
          onOpenSelfHealing={() => {
            setSentinelTab('sentinel');
            setIsSelfHealingOpen(true);
          }}
          onOpenModulesHealth={() => {
            setSentinelTab('modules');
            setIsSelfHealingOpen(true);
          }}
          onOpenConsciousness={() => {
            setSentinelTab('consciousness');
            setIsSelfHealingOpen(true);
          }}
          modulesHealthStatus={healthCheck.overallStatus}
          totalReinitCount={healthCheck.totalReinitCount}
          onToggleKeyframeStudio={() => setIsKeyframeStudioOpen(!isKeyframeStudioOpen)}
          isKeyframeStudioOpen={isKeyframeStudioOpen}
          physicsConfig={physicsConfig}
          onUpdatePhysics={(cfg) => {
            setPhysicsConfig(prev => {
              const next = { ...prev, ...cfg };
              physicsEngine.config = next;
              return next;
            });
          }}
          onThrowSelected={handleThrowSelected}
          hasSelectedObject={!!selectedId}
          audioConfig={audioConfig}
          onToggleAudio={(source) => {
            if (source === 'synth') {
              audioReactiveEngine.startSynthwave();
            } else if (source === 'microphone') {
              audioReactiveEngine.startMicrophone();
            } else {
              audioReactiveEngine.stopAudio();
            }
            setAudioConfig({ ...audioReactiveEngine.config });
            consciousnessEngine.perceiveEnvironment({
              objectCount: objects.length,
              healthScore,
              audioActive: source !== 'none',
              physicsActive: physicsConfig.enabled
            });
          }}
          postProcessing={postProcessing}
          onUpdatePostProcessing={(cfg) => setPostProcessing(prev => ({ ...prev, ...cfg }))}
          cameraShot={cameraShot}
          onChangeCameraShot={(shot) => {
            setCameraShot(shot);
            directorCameraRig.setShot(shot);
          }}
          xrMode={xrMode}
          onChangeXrMode={setXrMode}
          healthScore={healthScore}
        />

        {/* Main Viewport Container */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          
          {/* Three.js Canvas Viewport Area */}
          <div className="flex-1 flex flex-col relative h-full min-w-0">
            
            {/* Cinematic Anamorphic Scope Bars (2.39:1) */}
            {postProcessing.anamorphicBars && (
              <>
                <div className="absolute top-0 left-0 right-0 h-10 bg-black z-30 pointer-events-none shadow-md" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-black z-30 pointer-events-none shadow-md" />
              </>
            )}

            {/* Cinematic Vignette Overlay */}
            {postProcessing.vignette && (
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85), inset 0 0 180px rgba(0,0,0,0.65)'
                }}
              />
            )}

            {/* Cyberpunk Glitch Scanlines */}
            {postProcessing.glitchScanlines && (
              <div 
                className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"
              />
            )}

            {/* WebXR AR HUD Overlay */}
            {xrMode === 'ar_passthrough' && (
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-between p-6">
                <div className="flex items-center justify-between w-full font-mono text-[10px] text-emerald-400">
                  <div className="px-2 py-1 bg-black/60 rounded border border-emerald-500/40">
                    [AR PASSTHROUGH ACTIVE] • 6-DOF TRACKING
                  </div>
                  <div className="px-2 py-1 bg-black/60 rounded border border-emerald-500/40">
                    SURFACE DETECTED: PLANE Y=0.0
                  </div>
                </div>

                {/* Reticle Target */}
                <div className="w-16 h-16 rounded-full border border-dashed border-emerald-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                <div className="font-mono text-[10px] text-emerald-400/80 bg-black/60 px-3 py-1 rounded">
                  Dokunmatik yüzeyle 3D nesneleri gerçek dünyaya sabitleyin
                </div>
              </div>
            )}

            {/* WebXR VR Stereoscopic Split Indicator */}
            {xrMode === 'vr_stereoscopic' && (
              <div className="absolute inset-0 z-20 pointer-events-none flex">
                <div className="flex-1 border-r-2 border-slate-900/80 relative flex items-center justify-center">
                  <span className="absolute top-4 left-4 text-[10px] font-mono text-cyan-400 bg-black/70 px-2 py-0.5 rounded">
                    VR SOL GÖZ (IPD: 64mm)
                  </span>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  <span className="absolute top-4 right-4 text-[10px] font-mono text-cyan-400 bg-black/70 px-2 py-0.5 rounded">
                    VR SAĞ GÖZ
                  </span>
                </div>
              </div>
            )}

            {/* Telemetry Overlay Badge */}
            <div className="absolute top-3 left-3 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono flex items-center gap-3 text-slate-300 shadow-xl pointer-events-none">
              <div>FPS: <span className="text-emerald-400 font-bold">{Number.isFinite(studioStats.fps) ? studioStats.fps : 60}</span></div>
              <div>Üçgenler: <span className="text-cyan-400">{Number.isFinite(studioStats.triangles) ? studioStats.triangles.toLocaleString() : '14,200'}</span></div>
              <div>Nesneler: <span className="text-amber-400">{objects.length} 3D Mesh</span></div>
              {isRecordingVideo && (
                <div className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  REC (WebM)
                </div>
              )}
            </div>

            {/* Quick Interaction Hint */}
            <div className="absolute top-3 right-3 z-20 bg-slate-900/60 backdrop-blur border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 pointer-events-none hidden sm:block">
              Fareyle Döndür • Tekerlek (Zoom) • Nesneye Tıkla ({physicsConfig.enabled ? 'Fizik İmpuls Fırlat' : 'Zıplat'})
            </div>

            {/* 3D WebGL Canvas */}
            <div
              ref={containerRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className="flex-1 w-full h-full cursor-grab active:cursor-grabbing outline-none bg-slate-950"
              style={{
                filter: postProcessing.bloom 
                  ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45)) contrast(108%)' 
                  : postProcessing.chromaticAberration 
                    ? 'contrast(120%) saturate(125%)' 
                    : 'none'
              }}
            />

            {/* Standard Animation Timeline Bar (When Keyframe Studio is closed) */}
            {!isKeyframeStudioOpen && (
              <AnimationTimelineBar
                timelineState={timelineState}
                onUpdateTimelineState={setTimelineState}
                onResetSceneTransforms={handleResetSceneTransforms}
              />
            )}

            {/* Professional Keyframe & Dope Sheet Studio (When toggled open) */}
            {isKeyframeStudioOpen && (
              <KeyframeStudio
                isOpen={isKeyframeStudioOpen}
                onClose={() => setIsKeyframeStudioOpen(false)}
                objects={objects}
                selectedObjectId={selectedId}
                onSelectObject={setSelectedId}
                currentTime={keyframeTime}
                duration={10.0}
                isPlaying={isKeyframePlaying}
                onTimeChange={setKeyframeTime}
                onTogglePlay={() => setIsKeyframePlaying(!isKeyframePlaying)}
                tracks={keyframeTracks}
                onAddKeyframe={handleAddKeyframe}
                onRemoveKeyframe={handleRemoveKeyframe}
                onApplyChoreography={handleApplyChoreography}
                onRecordVideo={handleRecordVideo}
                isRecordingVideo={isRecordingVideo}
              />
            )}
          </div>

          {/* Right Side: Scene Designer Panel */}
          {designerOpen && (
            <div className="w-80 h-full shrink-0 animate-fadeIn z-20">
              <SceneDesignerPanel
                objects={objects}
                selectedId={selectedId}
                onSelectObject={setSelectedId}
                onAddObject={handleAddObject}
                onUpdateObject={handleUpdateObject}
                onDeleteObject={handleDeleteObject}
                onDuplicateObject={handleDuplicateObject}
                environment={environment}
                onUpdateEnvironment={setEnvironment}
              />
            </div>
          )}
        </div>

        {/* AI Vision to 3D Scene Modal */}
        <AiVisionSceneModal
          isOpen={isVisionModalOpen}
          onClose={() => setIsVisionModalOpen(false)}
          onApplyGeneratedScene={(data) => {
            setSceneTitle(data.sceneTitle);
            setEnvironment(data.environment);
            setObjects(data.objects);
            setSelectedId(data.objects[0]?.id || null);
          }}
        />

        {/* 3D Model & GLTF/GLB Library Modal */}
        <ModelLibraryModal
          isOpen={isModelLibraryOpen}
          onClose={() => setIsModelLibraryOpen(false)}
          onInsertModel={(newObjs) => {
            setObjects(prev => [...prev, ...newObjs]);
            setSelectedId(newObjs[0]?.id || null);
          }}
        />

        {/* Autonomous Self-Healing Sentinel Modal */}
        <SelfHealingSentinel
          isOpen={isSelfHealingOpen}
          onClose={() => setIsSelfHealingOpen(false)}
          onTriggerRollback={handleRollbackSnapshot}
          onPurgeMemory={handlePurgeAndRestore}
          healthCheck={healthCheck}
          initialTab={sentinelTab}
        />

      </div>
    </SelfHealingBoundary>
  );
}
