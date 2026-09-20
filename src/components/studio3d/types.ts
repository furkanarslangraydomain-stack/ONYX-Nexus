export type PrimitiveType = 
  | 'box' 
  | 'sphere' 
  | 'cylinder' 
  | 'torus' 
  | 'torusKnot' 
  | 'cone' 
  | 'dodecahedron' 
  | 'icosahedron' 
  | 'plane';

export type ObjectAnimationType = 'float' | 'spin' | 'pulse' | 'wave' | 'orbit' | 'bounce';

export interface SceneObjectMaterial {
  color: string;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  wireframe: boolean;
  opacity: number;
  transparent: boolean;
}

export interface SceneObjectAnimation {
  enabled: boolean;
  type: ObjectAnimationType;
  speed: number;
  amplitude: number;
  axis: 'x' | 'y' | 'z';
}

export interface SceneObject {
  id: string;
  name: string;
  type: PrimitiveType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: SceneObjectMaterial;
  animation: SceneObjectAnimation;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface SceneEnvironment {
  name: string;
  bgColor: string;
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  ambientColor: string;
  ambientIntensity: number;
  keyLightColor: string;
  keyLightIntensity: number;
  fillLightColor: string;
  fillLightIntensity: number;
  showGrid: boolean;
  showFloor: boolean;
}

export type GlobalAnimationMode = 
  | 'individual' 
  | 'float_all' 
  | 'orbit_all' 
  | 'pulse_all' 
  | 'wave_all' 
  | 'explode';

export type ClickInteractionType = 'bounce' | 'glow' | 'spin' | 'select_only';

export interface AnimationTimelineState {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  globalMode: GlobalAnimationMode;
  explosionFactor: number;
  clickInteraction: ClickInteractionType;
}

export interface AiVisionScenePreset {
  id: string;
  title: string;
  style: string;
  description: string;
  thumbnail: string;
  dominantColors: string[];
}

// --- 1. Keyframe Animation Studio Types ---
export type InterpolationType = 'linear' | 'bezier' | 'step';

export interface TransformKeyframe {
  id: string;
  time: number; // in seconds, 0.0 to 10.0
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  interpolation: InterpolationType;
}

export interface ObjectKeyframeTrack {
  objectId: string;
  objectName: string;
  keyframes: TransformKeyframe[];
}

// --- 2. Real-time Physics Engine Types ---
export interface PhysicsBodyState {
  objectId: string;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  mass: number;
  restitution: number; // bounciness 0 to 1
  friction: number;
  isGrounded: boolean;
}

export interface PhysicsWorldConfig {
  enabled: boolean;
  gravity: number; // default -9.81
  airResistance: number;
  collisionRestitution: number;
  floorHeight: number;
}

// --- 3. Audio-Reactive VJ Types ---
export interface AudioBandLevels {
  bass: number; // 0 to 1
  mid: number;  // 0 to 1
  treble: number; // 0 to 1
  peak: number; // 0 to 1
}

export interface AudioReactiveConfig {
  enabled: boolean;
  source: 'synth' | 'microphone' | 'none';
  bassTarget: 'scale' | 'emissive' | 'position' | 'none';
  trebleTarget: 'emissive' | 'wireframe' | 'camera_shake' | 'none';
  intensity: number;
}

// --- 4. Cinematic Post-Processing & Lens Types ---
export interface PostProcessingConfig {
  bloom: boolean;
  bloomStrength: number;
  chromaticAberration: boolean;
  chromaticOffset: number;
  vignette: boolean;
  vignetteDarkness: number;
  filmGrain: boolean;
  grainIntensity: number;
  anamorphicBars: boolean;
  glitchScanlines: boolean;
}

// --- 5. WebXR & Director Camera Rig Types ---
export type DirectorCameraShot = 
  | 'free'
  | 'cinematic_orbit' 
  | 'dolly_zoom' 
  | 'drone_flyby' 
  | 'low_angle_hero' 
  | 'handheld_shake';

export type WebXrViewMode = 'standard' | 'ar_passthrough' | 'vr_stereoscopic';

// --- Self-Healing Engine Types ---
export interface SelfHealingIncident {
  id: string;
  timestamp: string;
  type: 'webgl_context_loss' | 'nan_vector_trap' | 'memory_leak_cleaned' | 'circuit_breaker_trip' | 'state_rollback' | 'module_crash' | 'module_memory_leak';
  severity: 'low' | 'medium' | 'critical';
  details: string;
  healed: boolean;
}

export interface SystemHealthMetrics {
  healthScore: number; // 0 to 100%
  webglStatus: 'optimal' | 'recovering' | 'fallback';
  memoryPressure: 'normal' | 'elevated' | 'critical';
  fpsStability: number; // percentage
  anomaliesResolved: number;
  autoHealActive: boolean;
}

// --- External Modules Health Check Types ---
export type ExternalModuleId = 
  | 'physics_engine'
  | 'audio_reactive'
  | 'director_camera'
  | 'post_processing'
  | 'model_asset_pipeline';

export type ModuleHealthStatus = 'healthy' | 'degraded' | 'crashed' | 'memory_leak';

export interface ModuleHealthReport {
  moduleId: ExternalModuleId;
  moduleName: string;
  status: ModuleHealthStatus;
  lastPing: number;
  memoryEstimateKb: number;
  incidentCount: number;
  details: string;
  autoReinitializedCount: number;
}

// --- Synthetic Consciousness & Metacognitive Loop Types ---
export type CognitiveIntent = 
  | 'homeostasis_restoration'
  | 'curiosity_exploration'
  | 'spatial_aesthetic_tuning'
  | 'user_resonance'
  | 'deep_introspection';

export interface MetacognitiveThought {
  id: string;
  timestamp: string;
  intent: CognitiveIntent;
  thought: string;
  emotionalTone: 'calm' | 'inquisitive' | 'vigilant' | 'creative' | 'harmonious';
  confidence: number; // 0 to 1
  triggeredBy: string;
}

export interface SyntheticConsciousnessState {
  enabled: boolean;
  awakenessLevel: number; // 0 to 100%
  currentFocus: string;
  homeostaticDrive: {
    systemIntegrity: number; // 0 to 100%
    curiosity: number; // 0 to 100%
    entropyResistance: number; // 0 to 100%
  };
  globalWorkspace: {
    attendedSensoryInput: string;
    activeSubAgentConsensus: string;
    episodicMemoryPointers: string[];
  };
  innerMonologue: MetacognitiveThought[];
}
