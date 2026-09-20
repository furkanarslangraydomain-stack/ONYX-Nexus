import { SceneObject } from './types';

export type ObjectLibraryCategory = 
  | 'all'
  | 'cyber_robotics'
  | 'architecture_spatial'
  | 'cosmic_energy'
  | 'hardware_tech';

export interface ObjectLibraryItem {
  id: string;
  name: string;
  category: ObjectLibraryCategory;
  icon: string;
  description: string;
  tags: string[];
  partCount: number;
  featured?: boolean;
  generateObjects: (timestamp: number, options?: { colorTheme?: string; scaleMultiplier?: number }) => SceneObject[];
}

export const OBJECT_LIBRARY_CATALOG: ObjectLibraryItem[] = [
  // 1. SİBER & ROBOTİK
  {
    id: 'cyber_drone',
    name: 'Siber Keşif Dronu (Apex-4)',
    category: 'cyber_robotics',
    icon: '🛸',
    description: 'Dönen çift manyetik rotor halkası, reaktif plazma gövdesi ve süzülme animasyonu.',
    tags: ['dron', 'robotik', 'uçan', 'rotor', 'sci-fi'],
    partCount: 4,
    featured: true,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      const color = opts?.colorTheme || '#38bdf8';
      return [
        {
          id: `drone-core-${ts}`,
          name: 'Siber Dron Gövdesi',
          type: 'cylinder',
          position: [0, 2.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.6 * s, 0.4 * s, 1.6 * s],
          material: {
            color: '#1e293b',
            metalness: 0.9,
            roughness: 0.15,
            emissive: '#0f172a',
            emissiveIntensity: 0.2,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'float', speed: 1.2, amplitude: 0.35, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `drone-reactor-${ts}`,
          name: 'Plazma Reaktör Küresi',
          type: 'sphere',
          position: [0, 2.8 * s, 0],
          rotation: [0, 0, 0],
          scale: [0.75 * s, 0.75 * s, 0.75 * s],
          material: {
            color: color,
            metalness: 0.2,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.95,
            wireframe: false,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 2.0, amplitude: 0.2, axis: 'y' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `drone-rotor-1-${ts}`,
          name: 'Sol Manyetik Rotor',
          type: 'torus',
          position: [2.0 * s, 2.6 * s, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [0.9 * s, 0.9 * s, 0.9 * s],
          material: {
            color: '#10b981',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#059669',
            emissiveIntensity: 0.7,
            wireframe: false,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 3.8, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: false
        },
        {
          id: `drone-rotor-2-${ts}`,
          name: 'Sağ Manyetik Rotor',
          type: 'torus',
          position: [-2.0 * s, 2.6 * s, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [0.9 * s, 0.9 * s, 0.9 * s],
          material: {
            color: '#10b981',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#059669',
            emissiveIntensity: 0.7,
            wireframe: false,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 3.8, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: false
        }
      ];
    }
  },
  {
    id: 'combat_mech',
    name: 'Titan Meka Savaş Robotu',
    category: 'cyber_robotics',
    icon: '🤖',
    description: 'Ağır zırhlı meka gövdesi, lazer vizörü, hidrolik bacaklar ve omuz roketatar pilonları.',
    tags: ['meka', 'robot', 'savaş', 'zırh', 'lazer'],
    partCount: 5,
    featured: true,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `mech-torso-${ts}`,
          name: 'Meka Torso Zırhı',
          type: 'box',
          position: [0, 3.0 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.8 * s, 1.8 * s, 1.4 * s],
          material: {
            color: '#1e293b',
            metalness: 0.9,
            roughness: 0.25,
            emissive: '#0f172a',
            emissiveIntensity: 0.2,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'wave', speed: 0.8, amplitude: 0.15, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `mech-head-${ts}`,
          name: 'Lazer Hedefleme Vizörü',
          type: 'box',
          position: [0, 4.1 * s, 0.3 * s],
          rotation: [0, 0, 0],
          scale: [0.9 * s, 0.5 * s, 0.8 * s],
          material: {
            color: '#ef4444',
            metalness: 0.5,
            roughness: 0.2,
            emissive: '#dc2626',
            emissiveIntensity: 0.85,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 1.6, amplitude: 0.1, axis: 'y' },
          castShadow: true, receiveShadow: false
        },
        {
          id: `mech-leg-l-${ts}`,
          name: 'Sol Hidrolik Bacak',
          type: 'cylinder',
          position: [-1.0 * s, 1.3 * s, 0],
          rotation: [0, 0, 0.08],
          scale: [0.45 * s, 2.5 * s, 0.45 * s],
          material: {
            color: '#475569',
            metalness: 0.92,
            roughness: 0.18,
            emissive: '#0f172a',
            emissiveIntensity: 0.1,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `mech-leg-r-${ts}`,
          name: 'Sağ Hidrolik Bacak',
          type: 'cylinder',
          position: [1.0 * s, 1.3 * s, 0],
          rotation: [0, 0, -0.08],
          scale: [0.45 * s, 2.5 * s, 0.45 * s],
          material: {
            color: '#475569',
            metalness: 0.92,
            roughness: 0.18,
            emissive: '#0f172a',
            emissiveIntensity: 0.1,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `mech-pod-${ts}`,
          name: 'Omuz Roketatar Modülü',
          type: 'box',
          position: [1.2 * s, 4.0 * s, -0.4 * s],
          rotation: [0.1, 0, 0],
          scale: [0.7 * s, 0.7 * s, 1.2 * s],
          material: {
            color: '#f59e0b',
            metalness: 0.8,
            roughness: 0.3,
            emissive: '#d97706',
            emissiveIntensity: 0.3,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        }
      ];
    }
  },
  {
    id: 'orbital_satellite',
    name: 'Orbital İletişim Uydusu',
    category: 'cyber_robotics',
    icon: '🛰️',
    description: 'Altın fotovoltaik paneller, iyon iticisi ve dönen yüksek kazançlı çanak anten.',
    tags: ['uydu', 'uzay', 'orbital', 'güneş paneli', 'anten'],
    partCount: 4,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `sat-core-${ts}`,
          name: 'Uydu İyon Gövdesi',
          type: 'box',
          position: [0, 3.5 * s, 0],
          rotation: [0.3, 0.4, 0],
          scale: [1.2 * s, 1.4 * s, 1.2 * s],
          material: {
            color: '#e2e8f0',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#0284c7',
            emissiveIntensity: 0.3,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'orbit', speed: 0.5, amplitude: 0.8, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `sat-panel-l-${ts}`,
          name: 'Sol Güneş Paneli Dizisi',
          type: 'box',
          position: [-2.2 * s, 3.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.5 * s, 0.08 * s, 1.2 * s],
          material: {
            color: '#1e3a8a',
            metalness: 0.9,
            roughness: 0.2,
            emissive: '#1d4ed8',
            emissiveIntensity: 0.4,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'wave', speed: 0.5, amplitude: 0.1, axis: 'z' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `sat-panel-r-${ts}`,
          name: 'Sağ Güneş Paneli Dizisi',
          type: 'box',
          position: [2.2 * s, 3.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.5 * s, 0.08 * s, 1.2 * s],
          material: {
            color: '#1e3a8a',
            metalness: 0.9,
            roughness: 0.2,
            emissive: '#1d4ed8',
            emissiveIntensity: 0.4,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'wave', speed: 0.5, amplitude: 0.1, axis: 'z' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `sat-dish-${ts}`,
          name: 'Yüksek Kazançlı Çanak Anten',
          type: 'cone',
          position: [0, 4.4 * s, 0],
          rotation: [Math.PI, 0, 0],
          scale: [1.1 * s, 0.6 * s, 1.1 * s],
          material: {
            color: '#fbbf24',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#d97706',
            emissiveIntensity: 0.5,
            wireframe: true,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 1.2, amplitude: 1, axis: 'y' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },
  {
    id: 'cyber_hovercraft',
    name: 'Siberpunk Uçan Hız Aracı (Speedster)',
    category: 'cyber_robotics',
    icon: '🏎️',
    description: 'Sivri aerodinamik burun, neon alt gövde ışıltısı ve arkada çift turbo itiş egzozu.',
    tags: ['araç', 'hovercraft', 'siberpunk', 'neon', 'hız'],
    partCount: 4,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `hover-chassis-${ts}`,
          name: 'Aerodinamik Gövde',
          type: 'box',
          position: [0, 1.2 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.6 * s, 0.45 * s, 3.4 * s],
          material: {
            color: '#0f172a',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#0284c7',
            emissiveIntensity: 0.3,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'float', speed: 2.2, amplitude: 0.2, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `hover-neon-${ts}`,
          name: 'Neon Zemin Emisyon Halkası',
          type: 'plane',
          position: [0, 0.6 * s, 0],
          rotation: [-Math.PI / 2, 0, 0],
          scale: [2.0 * s, 3.8 * s, 1],
          material: {
            color: '#ec4899',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#db2777',
            emissiveIntensity: 0.9,
            wireframe: true,
            opacity: 0.7,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 3.0, amplitude: 0.3, axis: 'y' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `hover-thruster-l-${ts}`,
          name: 'Sol İtiş Türbini',
          type: 'cylinder',
          position: [-0.6 * s, 1.2 * s, -1.8 * s],
          rotation: [Math.PI / 2, 0, 0],
          scale: [0.35 * s, 0.8 * s, 0.35 * s],
          material: {
            color: '#38bdf8',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#0284c7',
            emissiveIntensity: 0.8,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 4.0, amplitude: 0.2, axis: 'z' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `hover-thruster-r-${ts}`,
          name: 'Sağ İtiş Türbini',
          type: 'cylinder',
          position: [0.6 * s, 1.2 * s, -1.8 * s],
          rotation: [Math.PI / 2, 0, 0],
          scale: [0.35 * s, 0.8 * s, 0.35 * s],
          material: {
            color: '#38bdf8',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#0284c7',
            emissiveIntensity: 0.8,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 4.0, amplitude: 0.2, axis: 'z' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },

  // 2. MİMARİ & UZAMSAL YAPILAR
  {
    id: 'stargate_portal',
    name: 'Kuantum Yıldız Geçidi (Stargate)',
    category: 'architecture_spatial',
    icon: '🌀',
    description: 'Devasa kuantum portal halkası, merkezde dönen plazma ufku ve runik güç pilonları.',
    tags: ['portal', 'geçit', 'stargate', 'kuantum', 'mimari'],
    partCount: 3,
    featured: true,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `portal-ring-${ts}`,
          name: 'Stargate Rezonans Halkası',
          type: 'torus',
          position: [0, 3.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [3.2 * s, 3.2 * s, 3.2 * s],
          material: {
            color: '#334155',
            metalness: 0.95,
            roughness: 0.15,
            emissive: '#06b6d4',
            emissiveIntensity: 0.4,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'spin', speed: 0.8, amplitude: 1, axis: 'z' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `portal-event-horizon-${ts}`,
          name: 'Olay Ufku Plazma Diski',
          type: 'cylinder',
          position: [0, 3.5 * s, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [2.6 * s, 0.05 * s, 2.6 * s],
          material: {
            color: '#06b6d4',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#0891b2',
            emissiveIntensity: 0.95,
            wireframe: true,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 2.5, amplitude: 0.3, axis: 'y' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `portal-pedestal-${ts}`,
          name: 'Bazalt Kaide Tabanı',
          type: 'box',
          position: [0, 0.4 * s, 0],
          rotation: [0, 0, 0],
          scale: [5.0 * s, 0.8 * s, 2.5 * s],
          material: {
            color: '#1e293b',
            metalness: 0.8,
            roughness: 0.3,
            emissive: '#0f172a',
            emissiveIntensity: 0.1,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        }
      ];
    }
  },
  {
    id: 'cyber_skyscraper',
    name: 'Fütüristik Mega Siber Obelisk',
    category: 'architecture_spatial',
    icon: '🏙️',
    description: 'Çok katmanlı geometrik gökdelen kulesi, siber ızgara dokusu ve tepe yönlendirici feneri.',
    tags: ['kule', 'bina', 'mimari', 'gökdelen', 'obelisk'],
    partCount: 3,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `tower-base-${ts}`,
          name: 'Kule Alt Podyumu',
          type: 'box',
          position: [0, 1.5 * s, 0],
          rotation: [0, Math.PI / 4, 0],
          scale: [2.8 * s, 3.0 * s, 2.8 * s],
          material: {
            color: '#0f172a',
            metalness: 0.9,
            roughness: 0.2,
            emissive: '#1e293b',
            emissiveIntensity: 0.2,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `tower-spire-${ts}`,
          name: 'Merkezi Cam Obelisk',
          type: 'cone',
          position: [0, 5.0 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.6 * s, 5.0 * s, 1.6 * s],
          material: {
            color: '#38bdf8',
            metalness: 0.95,
            roughness: 0.05,
            emissive: '#0284c7',
            emissiveIntensity: 0.6,
            wireframe: true,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 1.0, amplitude: 0.15, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `tower-beacon-${ts}`,
          name: 'Tepe Lazer Feneri',
          type: 'sphere',
          position: [0, 7.6 * s, 0],
          rotation: [0, 0, 0],
          scale: [0.4 * s, 0.4 * s, 0.4 * s],
          material: {
            color: '#f43f5e',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#e11d48',
            emissiveIntensity: 1.0,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 3.5, amplitude: 0.3, axis: 'y' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },
  {
    id: 'geodesic_dome',
    name: 'Geodezik Biyosfer Kubbesi',
    category: 'architecture_spatial',
    icon: '🌐',
    description: 'Yarı şeffaf kuantum geodezik kafes, içeride korunan organik yaşam küresi.',
    tags: ['kubbe', 'biyosfer', 'geodezik', 'habitat', 'ekosistem'],
    partCount: 2,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `dome-cage-${ts}`,
          name: 'Geodezik Tel Kafes',
          type: 'icosahedron',
          position: [0, 2.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [3.2 * s, 3.2 * s, 3.2 * s],
          material: {
            color: '#10b981',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#059669',
            emissiveIntensity: 0.6,
            wireframe: true,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 0.4, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `dome-biosphere-${ts}`,
          name: 'İç Biyosfer Çekirdeği',
          type: 'sphere',
          position: [0, 2.5 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.2 * s, 2.2 * s, 2.2 * s],
          material: {
            color: '#064e3b',
            metalness: 0.2,
            roughness: 0.4,
            emissive: '#047857',
            emissiveIntensity: 0.4,
            wireframe: false,
            opacity: 0.7,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 1.2, amplitude: 0.1, axis: 'y' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },

  // 3. KOZMİK & ENERJİ GEOMETRİLERİ
  {
    id: 'quantum_monolith',
    name: 'Kozmik Monolit & Rezonatör',
    category: 'cosmic_energy',
    icon: '💎',
    description: 'Icosahedron kuantum kristali ve etrafında dönen torus düğüm rezonans halkası.',
    tags: ['monolit', 'kristal', 'kuantum', 'enerji', 'torus'],
    partCount: 2,
    featured: true,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `spire-core-${ts}`,
          name: 'Kozmik Monolit Kristal',
          type: 'icosahedron',
          position: [0, 3.0 * s, 0],
          rotation: [0.4, 0.2, 0],
          scale: [1.8 * s, 2.6 * s, 1.8 * s],
          material: {
            color: '#8b5cf6',
            metalness: 0.95,
            roughness: 0.1,
            emissive: '#6d28d9',
            emissiveIntensity: 0.75,
            wireframe: false,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 1.0, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `spire-ring-${ts}`,
          name: 'Rezonatör Kuantum Halkası',
          type: 'torusKnot',
          position: [0, 3.0 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.5 * s, 2.5 * s, 2.5 * s],
          material: {
            color: '#ec4899',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#be185d',
            emissiveIntensity: 0.5,
            wireframe: true,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'orbit', speed: 1.4, amplitude: 1, axis: 'z' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },
  {
    id: 'fusion_reactor',
    name: 'Tokamak Nükleer Füzyon Reaktörü',
    category: 'cosmic_energy',
    icon: '⚛️',
    description: 'Aşırı ısınmış plazma çekirdeği, manyetik hapsetme bobinleri ve koruyucu zırh kafesi.',
    tags: ['füzyon', 'reaktör', 'tokamak', 'plazma', 'enerji'],
    partCount: 3,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `fusion-plasma-${ts}`,
          name: 'Aşırı Isı Plazma Çekirdeği',
          type: 'torus',
          position: [0, 2.6 * s, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [2.0 * s, 2.0 * s, 2.0 * s],
          material: {
            color: '#f59e0b',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#d97706',
            emissiveIntensity: 1.0,
            wireframe: false,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 4.5, amplitude: 1, axis: 'z' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `fusion-coils-${ts}`,
          name: 'Manyetik Bobin Çerçevesi',
          type: 'torusKnot',
          position: [0, 2.6 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.6 * s, 2.6 * s, 2.6 * s],
          material: {
            color: '#38bdf8',
            metalness: 0.9,
            roughness: 0.15,
            emissive: '#0284c7',
            emissiveIntensity: 0.6,
            wireframe: true,
            opacity: 0.85,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 1.8, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: false
        },
        {
          id: `fusion-base-${ts}`,
          name: 'Reaktör Taban Pilonu',
          type: 'cylinder',
          position: [0, 0.7 * s, 0],
          rotation: [0, 0, 0],
          scale: [3.0 * s, 1.4 * s, 3.0 * s],
          material: {
            color: '#1e293b',
            metalness: 0.9,
            roughness: 0.3,
            emissive: '#0f172a',
            emissiveIntensity: 0.2,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        }
      ];
    }
  },
  {
    id: 'black_hole_horizon',
    name: 'Kara Delik & Olay Ufku (Singularity)',
    category: 'cosmic_energy',
    icon: '🕳️',
    description: 'Işığı yutan mutlak kara küre, etrafında dönen ışıldayan yığılma diski (Accretion Disk).',
    tags: ['kara delik', 'tekillik', 'uzay', 'yerçekimi', 'kozmik'],
    partCount: 2,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `singularity-core-${ts}`,
          name: 'Mutlak Kara Olay Ufku',
          type: 'sphere',
          position: [0, 3.0 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.8 * s, 1.8 * s, 1.8 * s],
          material: {
            color: '#020617',
            metalness: 1.0,
            roughness: 0.9,
            emissive: '#000000',
            emissiveIntensity: 0.0,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 0.5, amplitude: 0.05, axis: 'y' },
          castShadow: true, receiveShadow: false
        },
        {
          id: `accretion-disk-${ts}`,
          name: 'Plazma Yığılma Diski (Accretion)',
          type: 'torus',
          position: [0, 3.0 * s, 0],
          rotation: [Math.PI / 3, 0, 0],
          scale: [3.8 * s, 3.8 * s, 0.4 * s],
          material: {
            color: '#f97316',
            metalness: 0.2,
            roughness: 0.1,
            emissive: '#ea580c',
            emissiveIntensity: 0.95,
            wireframe: true,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 3.2, amplitude: 1, axis: 'z' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },

  // 4. DONANIM & SANAL LABORATUVAR
  {
    id: 'quantum_supercomputer',
    name: 'Kriyojenik Kuantum Süper Bilgisayar',
    category: 'hardware_tech',
    icon: '💻',
    description: 'Tavandan sarkan altın rezonatör kademeleri, kuantum q-bit işlemci tabanı.',
    tags: ['kuantum', 'bilgisayar', 'qbit', 'çip', 'altın', 'kriyojenik'],
    partCount: 4,
    featured: true,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `quantum-stage-1-${ts}`,
          name: 'Üst Soğutma Kalkanı',
          type: 'cylinder',
          position: [0, 5.0 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.2 * s, 0.3 * s, 2.2 * s],
          material: {
            color: '#fbbf24',
            metalness: 0.98,
            roughness: 0.1,
            emissive: '#b45309',
            emissiveIntensity: 0.3,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `quantum-stage-2-${ts}`,
          name: 'Orta Bobin Avizesi',
          type: 'cylinder',
          position: [0, 3.8 * s, 0],
          rotation: [0, 0, 0],
          scale: [1.5 * s, 0.3 * s, 1.5 * s],
          material: {
            color: '#fbbf24',
            metalness: 0.98,
            roughness: 0.1,
            emissive: '#b45309',
            emissiveIntensity: 0.3,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `quantum-chip-${ts}`,
          name: 'Qubit İşlemci Çekirdeği',
          type: 'box',
          position: [0, 2.6 * s, 0],
          rotation: [0, 0, 0],
          scale: [0.8 * s, 0.4 * s, 0.8 * s],
          material: {
            color: '#06b6d4',
            metalness: 0.9,
            roughness: 0.1,
            emissive: '#0891b2',
            emissiveIntensity: 0.9,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: true, type: 'pulse', speed: 2.2, amplitude: 0.2, axis: 'y' },
          castShadow: true, receiveShadow: false
        },
        {
          id: `quantum-cable-ring-${ts}`,
          name: 'Süper İletken Veri Kabloları',
          type: 'torus',
          position: [0, 3.8 * s, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.8 * s, 1.8 * s, 1.8 * s],
          material: {
            color: '#818cf8',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#4f46e5',
            emissiveIntensity: 0.5,
            wireframe: true,
            opacity: 0.8,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 1.0, amplitude: 1, axis: 'z' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  },
  {
    id: 'hologram_pedestal',
    name: 'Taktik Veri Hologram Kaidesi',
    category: 'hardware_tech',
    icon: '🔮',
    description: 'Heksagonal taban projektörü ve havada dönen 3D siber veri küresi.',
    tags: ['hologram', 'kaide', 'proje', 'veri', 'arayüz'],
    partCount: 3,
    generateObjects: (ts, opts) => {
      const s = opts?.scaleMultiplier || 1.0;
      return [
        {
          id: `holo-base-${ts}`,
          name: 'Heksagonal Projektör Tabanı',
          type: 'cylinder',
          position: [0, 0.6 * s, 0],
          rotation: [0, 0, 0],
          scale: [2.4 * s, 1.2 * s, 2.4 * s],
          material: {
            color: '#1e293b',
            metalness: 0.9,
            roughness: 0.2,
            emissive: '#0f172a',
            emissiveIntensity: 0.2,
            wireframe: false,
            opacity: 1,
            transparent: false
          },
          animation: { enabled: false, type: 'float', speed: 1, amplitude: 1, axis: 'y' },
          castShadow: true, receiveShadow: true
        },
        {
          id: `holo-beam-${ts}`,
          name: 'Holografik Işık Konisi',
          type: 'cone',
          position: [0, 2.2 * s, 0],
          rotation: [Math.PI, 0, 0],
          scale: [1.8 * s, 2.0 * s, 1.8 * s],
          material: {
            color: '#06b6d4',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#0891b2',
            emissiveIntensity: 0.6,
            wireframe: true,
            opacity: 0.45,
            transparent: true
          },
          animation: { enabled: true, type: 'pulse', speed: 2.0, amplitude: 0.1, axis: 'y' },
          castShadow: false, receiveShadow: false
        },
        {
          id: `holo-sphere-${ts}`,
          name: 'Süzülen Holografik Matris',
          type: 'icosahedron',
          position: [0, 3.4 * s, 0],
          rotation: [0, 0, 0],
          scale: [0.9 * s, 0.9 * s, 0.9 * s],
          material: {
            color: '#38bdf8',
            metalness: 0.1,
            roughness: 0.1,
            emissive: '#0284c7',
            emissiveIntensity: 0.95,
            wireframe: true,
            opacity: 0.9,
            transparent: true
          },
          animation: { enabled: true, type: 'spin', speed: 2.0, amplitude: 1, axis: 'y' },
          castShadow: false, receiveShadow: false
        }
      ];
    }
  }
];
