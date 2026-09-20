import * as THREE from 'three';
import { selfHealingEngine } from './selfHealing';

export class ModelAssetPipeline {
  private simulatedFault: 'crash' | 'leak' | null = null;
  private cachedGeometriesCount = 0;
  private cachedTexturesCount = 0;

  public diagnoseHealth(
    renderer?: THREE.WebGLRenderer | null,
    scene?: THREE.Scene | null
  ): {
    status: 'healthy' | 'degraded' | 'crashed' | 'memory_leak';
    details: string;
    memoryEstimateKb: number;
  } {
    if (this.simulatedFault === 'crash') {
      return {
        status: 'crashed',
        details: 'Simüle edilmiş 3D Model GLTF ayrıştırıcı çökmesi: Binary buffer corrupt.',
        memoryEstimateKb: 512
      };
    }
    if (this.simulatedFault === 'leak') {
      return {
        status: 'memory_leak',
        details: 'Simüle edilmiş bellek sızıntısı: 128 adet serbest bırakılmamış GPU VBO tamponu.',
        memoryEstimateKb: 8400
      };
    }

    if (renderer) {
      const mem = renderer.info.memory;
      this.cachedGeometriesCount = mem.geometries;
      this.cachedTexturesCount = mem.textures;

      // Leak detection: more than 150 geometries or textures
      if (mem.geometries > 120 || mem.textures > 60) {
        return {
          status: 'memory_leak',
          details: `WebGL GPU bellek sızıntısı uyarısı: ${mem.geometries} geometri, ${mem.textures} doku tamponu tutuluyor.`,
          memoryEstimateKb: Math.round(mem.geometries * 45 + mem.textures * 120)
        };
      }

      if (renderer.info.render.calls > 400) {
        return {
          status: 'degraded',
          details: `Kare başına aşırı yüksek Draw Call (${renderer.info.render.calls} calls/frame).`,
          memoryEstimateKb: 1200
        };
      }
    }

    return {
      status: 'healthy',
      details: `3D Model & GLTF varlık boru hattı stabil (${this.cachedGeometriesCount} geometri, ${this.cachedTexturesCount} doku önbellekte).`,
      memoryEstimateKb: Math.max(128, this.cachedGeometriesCount * 32 + this.cachedTexturesCount * 64)
    };
  }

  public reinitialize(
    renderer?: THREE.WebGLRenderer | null,
    scene?: THREE.Scene | null
  ) {
    this.simulatedFault = null;
    if (scene && renderer) {
      selfHealingEngine.purgeUnusedGpuBuffers(scene, renderer);
    }
    if (renderer) {
      renderer.info.reset();
    }
  }

  public simulateFault(type: 'crash' | 'leak') {
    this.simulatedFault = type;
  }
}

export const modelAssetPipeline = new ModelAssetPipeline();
