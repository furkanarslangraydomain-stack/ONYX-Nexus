import { AudioBandLevels, AudioReactiveConfig } from './types';
import { selfHealingEngine } from './selfHealing';

export class AudioReactiveEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private synthInterval: any = null;
  private isSynthPlaying = false;
  private micStream: MediaStream | null = null;
  private simulatedFault: 'crash' | 'leak' | null = null;

  public config: AudioReactiveConfig = {
    enabled: false,
    source: 'none',
    bassTarget: 'scale',
    trebleTarget: 'emissive',
    intensity: 1.0
  };

  public diagnoseHealth(): {
    status: 'healthy' | 'degraded' | 'crashed' | 'memory_leak';
    details: string;
    memoryEstimateKb: number;
  } {
    if (this.simulatedFault === 'crash') {
      return {
        status: 'crashed',
        details: 'Simüle edilmiş ses motoru çökmesi: Web AudioContext donanım kilitlenmesi.',
        memoryEstimateKb: 120
      };
    }
    if (this.simulatedFault === 'leak') {
      return {
        status: 'memory_leak',
        details: 'Simüle edilmiş bellek sızıntısı: Kapatılmayan 64x osilatör ve analizer tamponu.',
        memoryEstimateKb: 3800
      };
    }

    // Real diagnostic checks
    if (this.config.enabled && this.audioCtx && this.audioCtx.state === 'closed') {
      return {
        status: 'crashed',
        details: 'Web AudioContext beklenmedik şekilde "closed" durumuna geçti.',
        memoryEstimateKb: 64
      };
    }

    if (!this.isSynthPlaying && this.synthInterval) {
      return {
        status: 'memory_leak',
        details: 'Yetim kalan procedural synthwave zamanlayıcısı bellek tüketiyor.',
        memoryEstimateKb: 1500
      };
    }

    if (this.config.enabled && this.audioCtx && this.audioCtx.state === 'suspended') {
      return {
        status: 'degraded',
        details: 'Web AudioContext tarayıcı ses politikası nedeniyle askıya alındı (Suspended).',
        memoryEstimateKb: 120
      };
    }

    return {
      status: 'healthy',
      details: this.config.enabled
        ? `Web Audio VJ aktif (${this.config.source === 'synth' ? 'Synthwave' : 'Mikrofon'}), FFT 256 tamponu stabil.`
        : 'Web Audio VJ beklemede (Kaynak: Boşta).',
      memoryEstimateKb: this.config.enabled ? 240 : 32
    };
  }

  public reinitialize() {
    this.simulatedFault = null;
    this.stopAudio();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
      this.analyser = null;
      this.dataArray = null;
    }
  }

  public simulateFault(type: 'crash' | 'leak') {
    this.simulatedFault = type;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Starts procedural synthwave VJ generator (algorithmic arpeggio & kicks)
   */
  public startSynthwave() {
    this.stopAudio();
    this.initContext();
    if (!this.audioCtx || !this.analyser) return;

    this.isSynthPlaying = true;
    this.config.enabled = true;
    this.config.source = 'synth';

    const ctx = this.audioCtx;
    const analyser = this.analyser;

    let step = 0;
    const notes = [110, 130.81, 146.83, 164.81, 196, 220, 261.63]; // A minor scale

    this.synthInterval = setInterval(() => {
      if (!this.isSynthPlaying || ctx.state === 'suspended') return;
      const now = ctx.currentTime;

      // Bass Kick on beats 0, 2, 4, 6
      if (step % 2 === 0) {
        const oscKick = ctx.createOscillator();
        const gainKick = ctx.createGain();
        oscKick.type = 'sine';
        oscKick.frequency.setValueAtTime(140, now);
        oscKick.frequency.exponentialRampToValueAtTime(35, now + 0.18);
        gainKick.gain.setValueAtTime(0.4, now);
        gainKick.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscKick.connect(gainKick);
        gainKick.connect(analyser);
        gainKick.connect(ctx.destination);

        oscKick.start(now);
        oscKick.stop(now + 0.22);
      }

      // Arpeggiated Lead Synth
      const oscLead = ctx.createOscillator();
      const gainLead = ctx.createGain();
      const noteFreq = notes[step % notes.length];
      oscLead.type = step % 4 === 0 ? 'sawtooth' : 'triangle';
      oscLead.frequency.setValueAtTime(noteFreq * (step % 3 === 0 ? 2 : 1), now);

      gainLead.gain.setValueAtTime(0.15, now);
      gainLead.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      oscLead.connect(gainLead);
      gainLead.connect(analyser);
      gainLead.connect(ctx.destination);

      oscLead.start(now);
      oscLead.stop(now + 0.16);

      step = (step + 1) % 16;
    }, 130); // ~115 BPM
  }

  /**
   * Starts microphone input
   */
  public async startMicrophone(): Promise<boolean> {
    this.stopAudio();
    this.initContext();
    if (!this.audioCtx || !this.analyser) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      source.connect(this.analyser);
      this.config.enabled = true;
      this.config.source = 'microphone';
      return true;
    } catch (e) {
      selfHealingEngine.recordIncident(
        'circuit_breaker_trip',
        'low',
        'Mikrofon erişim izni reddedildi, synth moduna dönülüyor.'
      );
      this.startSynthwave();
      return false;
    }
  }

  public stopAudio() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    this.isSynthPlaying = false;
    this.config.enabled = false;
    this.config.source = 'none';
  }

  /**
   * Calculates real-time frequency bands for 3D meshes
   */
  public getLevels(): AudioBandLevels {
    if (!this.config.enabled || !this.analyser || !this.dataArray) {
      return { bass: 0, mid: 0, treble: 0, peak: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);
    const count = this.dataArray.length;

    // Bass: bins 0 to 12 (~0-400Hz)
    let bassSum = 0;
    for (let i = 0; i < 12; i++) bassSum += this.dataArray[i];
    const bass = (bassSum / (12 * 255)) * this.config.intensity;

    // Mid: bins 12 to 50 (~400-1800Hz)
    let midSum = 0;
    for (let i = 12; i < 50; i++) midSum += this.dataArray[i];
    const mid = (midSum / (38 * 255)) * this.config.intensity;

    // Treble: bins 50 to count (~1800Hz+)
    let trebleSum = 0;
    for (let i = 50; i < count; i++) trebleSum += this.dataArray[i];
    const treble = (trebleSum / ((count - 50) * 255)) * this.config.intensity;

    const peak = Math.max(bass, mid, treble);

    return {
      bass: Math.min(bass, 1.5),
      mid: Math.min(mid, 1.5),
      treble: Math.min(treble, 1.5),
      peak: Math.min(peak, 1.5)
    };
  }
}

export const audioReactiveEngine = new AudioReactiveEngine();
