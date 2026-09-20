import { SceneObject, SceneEnvironment, AiVisionScenePreset } from './types';

export const AI_VISION_PRESETS: AiVisionScenePreset[] = [
  {
    id: 'cyberpunk-monolith',
    title: 'Cyberpunk Neon Şehir & Monolit',
    style: 'Sci-Fi Cyberpunk',
    description: 'Neon teal ve magenta ışıklar, havada süzülen torus halkaları ve merkezi kristal veri kulesi.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    dominantColors: ['#10b981', '#06b6d4', '#ec4899', '#0f172a']
  },
  {
    id: 'zen-floating-sanctuary',
    title: 'Zen Yüzen Ada & Tapınak Küreleri',
    style: 'Minimalist Bio-Zen',
    description: 'Sıcak altın tonlar, sakin su yansımaları ve havada salınan geometrik taşlar.',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=60',
    dominantColors: ['#f59e0b', '#10b981', '#6366f1', '#1e1b4b']
  },
  {
    id: 'quantum-reactor-core',
    title: 'Kuantum Reaktör & Parçacık Halkaları',
    style: 'Quantum Tech / Web3',
    description: 'İç içe dönen torus knot rezonatörleri, zümrüt plazma akışı ve dinamik ışık halkaları.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    dominantColors: ['#3b82f6', '#8b5cf6', '#10b981', '#030712']
  },
  {
    id: 'brutalist-glass-pavilion',
    title: 'Brütalist Cam & Çelik Pavyon',
    style: 'Architectural Brutalism',
    description: 'Pürüzsüz metaller, şeffaf cam prizmalar ve yumuşak stüdyo gölgeleri.',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60',
    dominantColors: ['#94a3b8', '#38bdf8', '#cbd5e1', '#020617']
  }
];

export const DEFAULT_ENVIRONMENT: SceneEnvironment = {
  name: 'Cyberpunk Studio',
  bgColor: '#030712',
  fogEnabled: true,
  fogColor: '#030712',
  fogDensity: 0.03,
  ambientColor: '#ffffff',
  ambientIntensity: 0.45,
  keyLightColor: '#38bdf8',
  keyLightIntensity: 1.8,
  fillLightColor: '#ec4899',
  fillLightIntensity: 1.2,
  showGrid: true,
  showFloor: true
};

export const INITIAL_SCENE_OBJECTS: SceneObject[] = [
  {
    id: 'obj-1',
    name: 'Merkezi Kristal Kule',
    type: 'cylinder',
    position: [0, 2.5, 0],
    rotation: [0, 0, 0],
    scale: [1.2, 5, 1.2],
    material: {
      color: '#10b981',
      metalness: 0.85,
      roughness: 0.15,
      emissive: '#059669',
      emissiveIntensity: 0.4,
      wireframe: false,
      opacity: 1,
      transparent: false
    },
    animation: {
      enabled: true,
      type: 'spin',
      speed: 0.8,
      amplitude: 1,
      axis: 'y'
    },
    castShadow: true,
    receiveShadow: true
  },
  {
    id: 'obj-2',
    name: 'Kuantum Yörünge Halkası',
    type: 'torus',
    position: [0, 2.5, 0],
    rotation: [Math.PI / 4, 0, 0],
    scale: [3, 3, 3],
    material: {
      color: '#38bdf8',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#0284c7',
      emissiveIntensity: 0.6,
      wireframe: false,
      opacity: 0.9,
      transparent: true
    },
    animation: {
      enabled: true,
      type: 'orbit',
      speed: 1.2,
      amplitude: 1,
      axis: 'z'
    },
    castShadow: true,
    receiveShadow: false
  },
  {
    id: 'obj-3',
    name: 'Havalanan Plazma Küresi',
    type: 'sphere',
    position: [-3.5, 2, 2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: {
      color: '#a855f7',
      metalness: 0.7,
      roughness: 0.2,
      emissive: '#7e22ce',
      emissiveIntensity: 0.8,
      wireframe: false,
      opacity: 1,
      transparent: false
    },
    animation: {
      enabled: true,
      type: 'float',
      speed: 1.5,
      amplitude: 0.8,
      axis: 'y'
    },
    castShadow: true,
    receiveShadow: true
  },
  {
    id: 'obj-4',
    name: 'Altın İkozahedron Modül',
    type: 'icosahedron',
    position: [3.5, 2.2, -1],
    rotation: [0.2, 0.4, 0],
    scale: [1.2, 1.2, 1.2],
    material: {
      color: '#f59e0b',
      metalness: 0.95,
      roughness: 0.1,
      emissive: '#d97706',
      emissiveIntensity: 0.3,
      wireframe: false,
      opacity: 1,
      transparent: false
    },
    animation: {
      enabled: true,
      type: 'pulse',
      speed: 1.0,
      amplitude: 0.3,
      axis: 'y'
    },
    castShadow: true,
    receiveShadow: true
  },
  {
    id: 'obj-5',
    name: 'Kuzey Kaide Küpü',
    type: 'box',
    position: [0, 0.4, -4],
    rotation: [0, Math.PI / 6, 0],
    scale: [1.5, 0.8, 1.5],
    material: {
      color: '#06b6d4',
      metalness: 0.8,
      roughness: 0.3,
      emissive: '#0891b2',
      emissiveIntensity: 0.2,
      wireframe: true,
      opacity: 0.8,
      transparent: true
    },
    animation: {
      enabled: true,
      type: 'wave',
      speed: 0.7,
      amplitude: 0.5,
      axis: 'y'
    },
    castShadow: true,
    receiveShadow: true
  }
];
