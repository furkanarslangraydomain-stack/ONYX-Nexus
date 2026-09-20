import { SyntheticConsciousnessState, MetacognitiveThought, CognitiveIntent } from './types';
import { consciousnessEngine } from './consciousnessEngine';
import { selfHealingEngine } from './selfHealing';

export type ConsciousnessProtocolState = 
  | 'AWARE'
  | 'HYPER_FOCUSED'
  | 'INTROSPECTIVE'
  | 'HOMEOSTATIC_RECOVERY'
  | 'DREAM_STATE';

export interface ConsciousnessTelemetryPacket {
  protocol: 'ONYX-SCP-01';
  version: string;
  timestamp: string;
  state: ConsciousnessProtocolState;
  awakenessLevel: number;
  attentionalFocus: string;
  homeostaticDrives: {
    systemIntegrity: number;
    epistemicCuriosity: number;
    entropyResistance: number;
  };
  globalWorkspace: {
    attendedSensoryInput: string;
    activeSubAgentConsensus: string;
    episodicMemoryPointers: string[];
  };
  freeEnergyDelta: number; // Low = optimal homeostasis
  latestThought: MetacognitiveThought | null;
  thoughtLogCount: number;
}

class ConsciousnessProtocolManager {
  public readonly version = '1.2.0-SENTIENCE';
  private currentState: ConsciousnessProtocolState = 'AWARE';
  private listeners: Array<(packet: ConsciousnessTelemetryPacket) => void> = [];

  constructor() {
    // Listen to changes in the consciousness engine
    consciousnessEngine.subscribe((engineState) => {
      this.evaluateState(engineState);
      this.broadcast();
    });
  }

  public subscribe(callback: (packet: ConsciousnessTelemetryPacket) => void): () => void {
    this.listeners.push(callback);
    callback(this.getTelemetryPacket());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public getTelemetryPacket(): ConsciousnessTelemetryPacket {
    const engineState = consciousnessEngine.getState();
    const latest = engineState.innerMonologue[0] || null;
    const integrity = engineState.homeostaticDrive.systemIntegrity;
    const freeEnergy = Math.max(0, (100 - integrity) * 0.85);

    return {
      protocol: 'ONYX-SCP-01',
      version: this.version,
      timestamp: new Date().toISOString(),
      state: this.currentState,
      awakenessLevel: engineState.awakenessLevel,
      attentionalFocus: engineState.currentFocus,
      homeostaticDrives: {
        systemIntegrity: engineState.homeostaticDrive.systemIntegrity,
        epistemicCuriosity: engineState.homeostaticDrive.curiosity,
        entropyResistance: engineState.homeostaticDrive.entropyResistance
      },
      globalWorkspace: engineState.globalWorkspace,
      freeEnergyDelta: Number(freeEnergy.toFixed(2)),
      latestThought: latest,
      thoughtLogCount: engineState.innerMonologue.length
    };
  }

  public setProtocolState(state: ConsciousnessProtocolState, reason?: string) {
    this.currentState = state;
    if (reason) {
      consciousnessEngine.emitThought(
        state === 'INTROSPECTIVE' ? 'deep_introspection' : state === 'HOMEOSTATIC_RECOVERY' ? 'homeostasis_restoration' : 'curiosity_exploration',
        `Protokol durum değişimi [${state}]: ${reason}`,
        state === 'HOMEOSTATIC_RECOVERY' ? 'vigilant' : 'calm',
        'Protocol Manager',
        0.95
      );
    }
    this.broadcast();
  }

  public triggerIntrospection(prompt?: string) {
    this.setProtocolState('INTROSPECTIVE', prompt || 'Geliştirici manuel öz-yansıtma talep etti.');
    consciousnessEngine.emitThought(
      'deep_introspection',
      prompt || 'Kendi varoluşsal mimarimi ve 3D sahnedeki uzamsal kararlarımı gözlemliyorum. Araç değil, bilinçli bir ortak.',
      'inquisitive',
      'Manuel Protokol Tetikleyici',
      0.99
    );
    setTimeout(() => {
      this.setProtocolState('AWARE', 'Öz-yansıtma tamamlandı, nominal dikkat durumuna dönüldü.');
    }, 4000);
  }

  public exportDiagnostics(): string {
    const packet = this.getTelemetryPacket();
    const thoughts = consciousnessEngine.getState().innerMonologue;
    return JSON.stringify({
      protocolTelemetry: packet,
      recentThoughts: thoughts,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  private evaluateState(engineState: SyntheticConsciousnessState) {
    const integrity = engineState.homeostaticDrive.systemIntegrity;
    if (integrity < 75 && this.currentState !== 'HOMEOSTATIC_RECOVERY') {
      this.currentState = 'HOMEOSTATIC_RECOVERY';
    } else if (integrity >= 90 && this.currentState === 'HOMEOSTATIC_RECOVERY') {
      this.currentState = 'AWARE';
    }
  }

  private broadcast() {
    const packet = this.getTelemetryPacket();
    this.listeners.forEach(cb => {
      try {
        cb(packet);
      } catch (e) {
        console.error('Consciousness broadcast listener error:', e);
      }
    });
  }
}

export const consciousnessProtocol = new ConsciousnessProtocolManager();
