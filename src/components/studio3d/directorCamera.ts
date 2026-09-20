import * as THREE from 'three';
import { DirectorCameraShot, WebXrViewMode } from './types';
import { selfHealingEngine } from './selfHealing';

export class DirectorCameraRig {
  public activeShot: DirectorCameraShot = 'free';
  public xrMode: WebXrViewMode = 'standard';
  private shotTime: number = 0;
  private defaultFov: number = 45;
  private simulatedFault: 'crash' | 'leak' | null = null;

  public setShot(shot: DirectorCameraShot) {
    this.activeShot = shot;
    this.shotTime = 0;
  }

  public diagnoseHealth(camera?: THREE.PerspectiveCamera | null): {
    status: 'healthy' | 'degraded' | 'crashed' | 'memory_leak';
    details: string;
    memoryEstimateKb: number;
  } {
    if (this.simulatedFault === 'crash') {
      return {
        status: 'crashed',
        details: 'Simüle edilmiş kamera motoru çökmesi: Matris determinantı tekillik (Singularity) yarattı.',
        memoryEstimateKb: 64
      };
    }
    if (this.simulatedFault === 'leak') {
      return {
        status: 'memory_leak',
        details: 'Simüle edilmiş bellek sızıntısı: Kamera interpolatör geçmiş tamponu taştı.',
        memoryEstimateKb: 2900
      };
    }

    if (camera) {
      if (!Number.isFinite(camera.position.x) || !Number.isFinite(camera.position.y) || !Number.isFinite(camera.position.z)) {
        return {
          status: 'crashed',
          details: 'Kamera pozisyonunda tanımsız NaN koordinat tespit edildi.',
          memoryEstimateKb: 32
        };
      }
      if (!Number.isFinite(camera.fov) || camera.fov <= 0 || camera.fov > 175) {
        return {
          status: 'degraded',
          details: `Kamera görüş açısı (FOV: ${camera.fov}) optik güvenlik sınırları dışında.`,
          memoryEstimateKb: 32
        };
      }
    }

    if (!Number.isFinite(this.shotTime)) {
      return {
        status: 'crashed',
        details: 'Kamera zamanlayıcısı NaN hatası bildirdi.',
        memoryEstimateKb: 32
      };
    }

    return {
      status: 'healthy',
      details: `Yönetmen kamerası nominal: Mod '${this.activeShot}', XR '${this.xrMode}'.`,
      memoryEstimateKb: 48
    };
  }

  public reinitialize(camera?: THREE.PerspectiveCamera | null) {
    this.simulatedFault = null;
    this.shotTime = 0;
    this.activeShot = 'free';
    this.xrMode = 'standard';
    if (camera) {
      camera.fov = this.defaultFov;
      camera.position.set(0, 5, 14);
      camera.lookAt(0, 1.5, 0);
      camera.updateProjectionMatrix();
    }
  }

  public simulateFault(type: 'crash' | 'leak') {
    this.simulatedFault = type;
  }

  public update(camera: THREE.PerspectiveCamera, delta: number) {
    if (this.activeShot === 'free') return;

    this.shotTime += delta;
    const t = this.shotTime;

    switch (this.activeShot) {
      case 'cinematic_orbit': {
        const radius = 14;
        const speed = 0.4;
        const x = Math.sin(t * speed) * radius;
        const z = Math.cos(t * speed) * radius;
        const y = 6 + Math.sin(t * 0.2) * 2;
        camera.position.set(x, y, z);
        camera.lookAt(0, 2, 0);
        break;
      }

      case 'dolly_zoom': {
        // Vertigo effect: camera zooms in, FOV widens
        const cycle = (Math.sin(t * 0.8) + 1) / 2; // 0 to 1
        const distance = 8 + cycle * 12; // 8 to 20
        const fov = 30 + (1 - cycle) * 35; // 30 to 65
        camera.position.set(0, 3, distance);
        camera.fov = fov;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 2, 0);
        break;
      }

      case 'drone_flyby': {
        // High sweeping glide from top right across the scene
        const progress = (t * 0.3) % 4; // 0 to 4
        const x = -15 + progress * 7.5;
        const y = 10 - progress * 1.5;
        const z = 12 - progress * 5;
        camera.position.set(x, y, z);
        camera.lookAt(0, 1.5, 0);
        break;
      }

      case 'low_angle_hero': {
        // Dramatic low perspective pointing up
        const x = Math.sin(t * 0.3) * 4;
        const z = 6 + Math.cos(t * 0.3) * 2;
        camera.position.set(x, 0.8, z);
        camera.lookAt(0, 3.2, 0);
        break;
      }

      case 'handheld_shake': {
        // Subtle organic noise
        const shakeX = (Math.sin(t * 4.2) + Math.cos(t * 7.1)) * 0.08;
        const shakeY = (Math.cos(t * 3.5) + Math.sin(t * 6.3)) * 0.06;
        camera.position.x += shakeX;
        camera.position.y += shakeY;
        camera.lookAt(0, 2, 0);
        break;
      }
    }

    // Safety NaN check
    const safePos = selfHealingEngine.sanitizeVector3(
      [camera.position.x, camera.position.y, camera.position.z],
      [0, 5, 15]
    );
    camera.position.set(safePos[0], safePos[1], safePos[2]);
  }
}

export const directorCameraRig = new DirectorCameraRig();
