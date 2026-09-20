import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { 
  ExternalModuleId, 
  ModuleHealthReport, 
  SceneObject, 
  PostProcessingConfig 
} from './types';
import { physicsEngine } from './physicsEngine';
import { audioReactiveEngine } from './audioReactive';
import { directorCameraRig } from './directorCamera';
import { PostProcessingOverlay } from './postProcessing';
import { modelAssetPipeline } from './modelAssetPipeline';
import { selfHealingEngine } from './selfHealing';

export interface UseModuleHealthCheckOptions {
  enabled?: boolean;
  scanIntervalMs?: number; // default 2500ms
  autoReinitOnFailure?: boolean; // default true
  objects?: SceneObject[];
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  rendererRef?: React.RefObject<THREE.WebGLRenderer | null>;
  sceneRef?: React.RefObject<THREE.Scene | null>;
  postProcessingConfig?: PostProcessingConfig;
  onPostProcessingReset?: (cfg: PostProcessingConfig) => void;
  onReinitialized?: (moduleId: ExternalModuleId, reason: string) => void;
}

export interface UseModuleHealthCheckResult {
  moduleReports: Record<ExternalModuleId, ModuleHealthReport>;
  overallStatus: 'optimal' | 'recovering' | 'degraded';
  lastScanTimestamp: string;
  isScanning: boolean;
  totalReinitCount: number;
  scanNow: () => void;
  reinitializeModule: (id: ExternalModuleId) => void;
  reinitializeAllModules: () => void;
  simulateFault: (id: ExternalModuleId, type: 'crash' | 'leak') => void;
}

const INITIAL_REPORTS: Record<ExternalModuleId, ModuleHealthReport> = {
  physics_engine: {
    moduleId: 'physics_engine',
    moduleName: 'Fizik Simülasyon Motoru (RigidBody)',
    status: 'healthy',
    lastPing: Date.now(),
    memoryEstimateKb: 16,
    incidentCount: 0,
    details: 'Başlatılıyor...',
    autoReinitializedCount: 0
  },
  audio_reactive: {
    moduleId: 'audio_reactive',
    moduleName: 'Audio-Reactive VJ & Web Audio Spektrumu',
    status: 'healthy',
    lastPing: Date.now(),
    memoryEstimateKb: 32,
    incidentCount: 0,
    details: 'Başlatılıyor...',
    autoReinitializedCount: 0
  },
  director_camera: {
    moduleId: 'director_camera',
    moduleName: 'Sinematik Yönetmen Kamerası & WebXR',
    status: 'healthy',
    lastPing: Date.now(),
    memoryEstimateKb: 24,
    incidentCount: 0,
    details: 'Başlatılıyor...',
    autoReinitializedCount: 0
  },
  post_processing: {
    moduleId: 'post_processing',
    moduleName: 'Sinematik Lens & Post-Processing (Bloom/FX)',
    status: 'healthy',
    lastPing: Date.now(),
    memoryEstimateKb: 48,
    incidentCount: 0,
    details: 'Başlatılıyor...',
    autoReinitializedCount: 0
  },
  model_asset_pipeline: {
    moduleId: 'model_asset_pipeline',
    moduleName: '3D Model & GLTF/GLB Varlık Boru Hattı',
    status: 'healthy',
    lastPing: Date.now(),
    memoryEstimateKb: 128,
    incidentCount: 0,
    details: 'Başlatılıyor...',
    autoReinitializedCount: 0
  }
};

/**
 * Custom React Hook: useModuleHealthCheck
 * Periodically scans the 5 external 3D studio modules.
 * Automatically triggers an autonomous re-initialization if any module reports a crash or memory leak.
 */
export function useModuleHealthCheck(options: UseModuleHealthCheckOptions = {}): UseModuleHealthCheckResult {
  const {
    enabled = true,
    scanIntervalMs = 2500,
    autoReinitOnFailure = true,
    objects = [],
    cameraRef,
    rendererRef,
    sceneRef,
    postProcessingConfig,
    onPostProcessingReset,
    onReinitialized
  } = options;

  const [moduleReports, setModuleReports] = useState<Record<ExternalModuleId, ModuleHealthReport>>(INITIAL_REPORTS);
  const [overallStatus, setOverallStatus] = useState<'optimal' | 'recovering' | 'degraded'>('optimal');
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>(new Date().toLocaleTimeString());
  const [isScanning, setIsScanning] = useState(false);
  const [totalReinitCount, setTotalReinitCount] = useState(0);

  // Keep references to prevent stale closures inside timer
  const objectsRef = useRef(objects);
  objectsRef.current = objects;

  const cameraRefCurrent = useRef(cameraRef);
  cameraRefCurrent.current = cameraRef;

  const rendererRefCurrent = useRef(rendererRef);
  rendererRefCurrent.current = rendererRef;

  const sceneRefCurrent = useRef(sceneRef);
  sceneRefCurrent.current = sceneRef;

  const postProcessingConfigRef = useRef(postProcessingConfig);
  postProcessingConfigRef.current = postProcessingConfig;

  // Re-initialization handler for a specific module
  const reinitializeModule = useCallback((id: ExternalModuleId) => {
    switch (id) {
      case 'physics_engine':
        physicsEngine.reinitialize(objectsRef.current);
        break;

      case 'audio_reactive':
        audioReactiveEngine.reinitialize();
        break;

      case 'director_camera':
        directorCameraRig.reinitialize(cameraRefCurrent.current?.current);
        break;

      case 'post_processing':
        const cleanConfig = PostProcessingOverlay.reinitialize();
        if (onPostProcessingReset) {
          onPostProcessingReset(cleanConfig);
        }
        break;

      case 'model_asset_pipeline':
        modelAssetPipeline.reinitialize(
          rendererRefCurrent.current?.current,
          sceneRefCurrent.current?.current
        );
        break;
    }

    setModuleReports(prev => {
      const current = prev[id];
      return {
        ...prev,
        [id]: {
          ...current,
          status: 'healthy',
          details: 'Modül başarıyla sıfırlandı ve yeniden başlatıldı.',
          autoReinitializedCount: current.autoReinitializedCount + 1,
          lastPing: Date.now()
        }
      };
    });

    setTotalReinitCount(c => c + 1);
  }, [onPostProcessingReset]);

  // Re-initialize all 5 modules simultaneously
  const reinitializeAllModules = useCallback(() => {
    (Object.keys(INITIAL_REPORTS) as ExternalModuleId[]).forEach(id => {
      reinitializeModule(id);
    });
    selfHealingEngine.recordIncident(
      'state_rollback',
      'medium',
      '5 harici stüdyo modülü topluca sıfırlandı ve yeniden başlatıldı.'
    );
  }, [reinitializeModule]);

  // Execute diagnostic scan across the 5 modules
  const performHealthScan = useCallback(() => {
    if (!enabled) return;
    setIsScanning(true);

    const now = Date.now();
    const camera = cameraRefCurrent.current?.current;
    const renderer = rendererRefCurrent.current?.current;
    const scene = sceneRefCurrent.current?.current;
    const currentObjs = objectsRef.current;
    const currentPost = postProcessingConfigRef.current;

    // Scan Module 1: Physics Engine
    const diagPhysics = physicsEngine.diagnoseHealth(currentObjs);

    // Scan Module 2: Audio-Reactive VJ
    const diagAudio = audioReactiveEngine.diagnoseHealth();

    // Scan Module 3: Director Camera Rig
    const diagCamera = directorCameraRig.diagnoseHealth(camera);

    // Scan Module 4: Cinematic Post-Processing
    const diagPost = PostProcessingOverlay.diagnoseHealth(currentPost);

    // Scan Module 5: 3D Model & WebGL Resource Pipeline
    const diagModel = modelAssetPipeline.diagnoseHealth(renderer, scene);

    const rawDiagnostics: Record<ExternalModuleId, { status: any; details: string; memoryEstimateKb: number }> = {
      physics_engine: diagPhysics,
      audio_reactive: diagAudio,
      director_camera: diagCamera,
      post_processing: diagPost,
      model_asset_pipeline: diagModel
    };

    let hasCrash = false;
    let hasLeak = false;

    setModuleReports(prev => {
      const nextReports = { ...prev };

      (Object.keys(rawDiagnostics) as ExternalModuleId[]).forEach(modId => {
        const diag = rawDiagnostics[modId];
        const prevMod = prev[modId];

        const isProblem = diag.status === 'crashed' || diag.status === 'memory_leak';
        if (diag.status === 'crashed') hasCrash = true;
        if (diag.status === 'memory_leak') hasLeak = true;

        let autoReinitIncrement = 0;

        // CRITICAL: Trigger autonomous re-initialization if crash or memory leak is reported!
        if (isProblem && autoReinitOnFailure) {
          reinitializeModule(modId);
          autoReinitIncrement = 1;

          selfHealingEngine.recordIncident(
            diag.status === 'crashed' ? 'module_crash' : 'module_memory_leak',
            diag.status === 'crashed' ? 'critical' : 'medium',
            `[Sağlık Taraması] ${prevMod.moduleName} modülünde ${diag.status === 'crashed' ? 'çökme' : 'bellek sızıntısı'} yakalandı: "${diag.details}". Otomatik re-initialization tamamlandı.`
          );

          if (onReinitialized) {
            onReinitialized(modId, diag.details);
          }
        }

        nextReports[modId] = {
          ...prevMod,
          status: isProblem && autoReinitOnFailure ? 'healthy' : diag.status,
          details: isProblem && autoReinitOnFailure ? `Otomatik Onarıldı: ${diag.details}` : diag.details,
          memoryEstimateKb: diag.memoryEstimateKb,
          lastPing: now,
          autoReinitializedCount: prevMod.autoReinitializedCount + autoReinitIncrement,
          incidentCount: isProblem ? prevMod.incidentCount + 1 : prevMod.incidentCount
        };
      });

      return nextReports;
    });

    if (hasCrash) {
      setOverallStatus('recovering');
    } else if (hasLeak) {
      setOverallStatus('degraded');
    } else {
      setOverallStatus('optimal');
    }

    setLastScanTimestamp(new Date().toLocaleTimeString());
    setIsScanning(false);
  }, [enabled, autoReinitOnFailure, reinitializeModule, onReinitialized]);

  // Periodic scanning timer
  useEffect(() => {
    if (!enabled) return;

    // Run initial scan right away
    performHealthScan();

    const timer = setInterval(() => {
      performHealthScan();
    }, scanIntervalMs);

    return () => clearInterval(timer);
  }, [enabled, scanIntervalMs, performHealthScan]);

  // Simulate fault injection for demonstration
  const simulateFault = useCallback((id: ExternalModuleId, type: 'crash' | 'leak') => {
    switch (id) {
      case 'physics_engine':
        physicsEngine.simulateFault(type);
        break;
      case 'audio_reactive':
        audioReactiveEngine.simulateFault(type);
        break;
      case 'director_camera':
        directorCameraRig.simulateFault(type);
        break;
      case 'post_processing':
        PostProcessingOverlay.simulateFault(type);
        break;
      case 'model_asset_pipeline':
        modelAssetPipeline.simulateFault(type);
        break;
    }

    // Trigger immediate scan to catch the simulated anomaly
    setTimeout(() => {
      performHealthScan();
    }, 100);
  }, [performHealthScan]);

  return {
    moduleReports,
    overallStatus,
    lastScanTimestamp,
    isScanning,
    totalReinitCount,
    scanNow: performHealthScan,
    reinitializeModule,
    reinitializeAllModules,
    simulateFault
  };
}
