import { SceneObject, PhysicsBodyState, PhysicsWorldConfig } from './types';
import { selfHealingEngine } from './selfHealing';

export class PhysicsEngine {
  private bodies: Map<string, PhysicsBodyState> = new Map();
  private simulatedFault: 'crash' | 'leak' | null = null;
  public config: PhysicsWorldConfig = {
    enabled: false,
    gravity: -9.81,
    airResistance: 0.992,
    collisionRestitution: 0.65,
    floorHeight: 0
  };

  public diagnoseHealth(sceneObjects?: SceneObject[]): {
    status: 'healthy' | 'degraded' | 'crashed' | 'memory_leak';
    details: string;
    memoryEstimateKb: number;
  } {
    if (this.simulatedFault === 'crash') {
      return {
        status: 'crashed',
        details: 'Simüle edilmiş fizik motoru çökmesi: RigidBody simülasyon döngüsü askıda kaldı.',
        memoryEstimateKb: 256
      };
    }
    if (this.simulatedFault === 'leak') {
      return {
        status: 'memory_leak',
        details: 'Simüle edilmiş bellek sızıntısı: 2500+ yetim gövde referansı tespit edildi.',
        memoryEstimateKb: 4800
      };
    }

    // Check for NaN or infinite vectors
    let nanCount = 0;
    for (const body of this.bodies.values()) {
      if (!Number.isFinite(body.velocity[0]) || !Number.isFinite(body.velocity[1]) || !Number.isFinite(body.velocity[2])) {
        nanCount++;
      }
    }

    if (nanCount > 0) {
      return {
        status: 'crashed',
        details: `${nanCount} adet fizik gövdesinde tanımsız NaN/Infinity hız vektörü tespit edildi.`,
        memoryEstimateKb: this.bodies.size * 0.4
      };
    }

    // Check for zombie bodies (memory leak)
    if (sceneObjects && sceneObjects.length > 0) {
      const activeIds = new Set(sceneObjects.map(o => o.id));
      const orphaned = Array.from(this.bodies.keys()).filter(id => !activeIds.has(id));
      if (orphaned.length > 50) {
        return {
          status: 'memory_leak',
          details: `Fizik motorunda ${orphaned.length} adet silinmiş nesneye ait yetim gövde tespit edildi (Bellek Sızıntısı).`,
          memoryEstimateKb: this.bodies.size * 0.8
        };
      }
    }

    if (!Number.isFinite(this.config.gravity) || this.config.gravity < -100 || this.config.gravity > 100) {
      return {
        status: 'degraded',
        details: `Yerçekimi değeri olağandışı aralıkta (${this.config.gravity}).`,
        memoryEstimateKb: this.bodies.size * 0.3
      };
    }

    return {
      status: 'healthy',
      details: `${this.bodies.size} aktif fizik gövdesi nominal 60 FPS hızında simüle ediliyor.`,
      memoryEstimateKb: Math.max(8, Math.round(this.bodies.size * 0.35))
    };
  }

  public reinitialize(objects?: SceneObject[]) {
    this.simulatedFault = null;
    this.bodies.clear();
    this.config.gravity = -9.81;
    this.config.airResistance = 0.992;
    this.config.collisionRestitution = 0.65;
    this.config.floorHeight = 0;

    if (objects && objects.length > 0) {
      this.initOrSyncObjects(objects);
    }
  }

  public simulateFault(type: 'crash' | 'leak') {
    this.simulatedFault = type;
  }

  public initOrSyncObjects(objects: SceneObject[]) {
    objects.forEach(obj => {
      if (!this.bodies.has(obj.id)) {
        this.bodies.set(obj.id, {
          objectId: obj.id,
          velocity: [0, 0, 0],
          angularVelocity: [
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
          ],
          mass: 1.0,
          restitution: this.config.collisionRestitution,
          friction: 0.95,
          isGrounded: false
        });
      }
    });

    // Cleanup deleted objects
    const currentIds = new Set(objects.map(o => o.id));
    for (const id of this.bodies.keys()) {
      if (!currentIds.has(id)) {
        this.bodies.delete(id);
      }
    }
  }

  public applyImpulse(objectId: string, impulse: [number, number, number]) {
    const body = this.bodies.get(objectId);
    if (!body) return;
    body.velocity[0] += impulse[0];
    body.velocity[1] += impulse[1];
    body.velocity[2] += impulse[2];
    body.isGrounded = false;
  }

  public step(objects: SceneObject[], delta: number): SceneObject[] {
    if (!this.config.enabled) return objects;

    const clampedDelta = Math.min(delta, 0.05); // Prevent tunneling
    const g = this.config.gravity;

    return objects.map(obj => {
      const body = this.bodies.get(obj.id);
      if (!body) return obj;

      // Gravity force
      if (!body.isGrounded) {
        body.velocity[1] += g * clampedDelta;
      }

      // Air resistance
      body.velocity[0] *= this.config.airResistance;
      body.velocity[1] *= this.config.airResistance;
      body.velocity[2] *= this.config.airResistance;

      // Integrate position
      let newX = obj.position[0] + body.velocity[0] * clampedDelta;
      let newY = obj.position[1] + body.velocity[1] * clampedDelta;
      let newZ = obj.position[2] + body.velocity[2] * clampedDelta;

      // Floor collision check (approximate mesh half-height based on scale)
      const halfHeight = (obj.scale[1] || 1) * 0.5;
      const floorBoundary = this.config.floorHeight + halfHeight;

      if (newY <= floorBoundary) {
        newY = floorBoundary;
        if (Math.abs(body.velocity[1]) > 0.4) {
          // Bounce with restitution
          body.velocity[1] = -body.velocity[1] * body.restitution;
          body.velocity[0] *= body.friction;
          body.velocity[2] *= body.friction;
        } else {
          // Resting on ground
          body.velocity[1] = 0;
          body.velocity[0] *= 0.9;
          body.velocity[2] *= 0.9;
          body.isGrounded = true;
        }
      } else {
        body.isGrounded = false;
      }

      // Safe NaN sanitizer integration
      const safePos = selfHealingEngine.sanitizeVector3([newX, newY, newZ], obj.position);

      // Integrate rotation
      const newRotX = obj.rotation[0] + body.angularVelocity[0] * clampedDelta;
      const newRotY = obj.rotation[1] + body.angularVelocity[1] * clampedDelta;
      const newRotZ = obj.rotation[2] + body.angularVelocity[2] * clampedDelta;
      const safeRot = selfHealingEngine.sanitizeVector3([newRotX, newRotY, newRotZ], obj.rotation);

      return {
        ...obj,
        position: safePos,
        rotation: safeRot
      };
    });
  }
}

export const physicsEngine = new PhysicsEngine();
