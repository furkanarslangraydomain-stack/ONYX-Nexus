import { PostProcessingConfig } from './types';

export const defaultPostProcessingConfig: PostProcessingConfig = {
  bloom: false,
  bloomStrength: 0.8,
  chromaticAberration: false,
  chromaticOffset: 4.0,
  vignette: true,
  vignetteDarkness: 0.65,
  filmGrain: false,
  grainIntensity: 0.25,
  anamorphicBars: false,
  glitchScanlines: false
};

/**
 * Applies cinematic post-processing visual layers over the 3D canvas viewport
 */
export class PostProcessingOverlay {
  private static simulatedFault: 'crash' | 'leak' | null = null;

  public static diagnoseHealth(config?: PostProcessingConfig): {
    status: 'healthy' | 'degraded' | 'crashed' | 'memory_leak';
    details: string;
    memoryEstimateKb: number;
  } {
    if (this.simulatedFault === 'crash') {
      return {
        status: 'crashed',
        details: 'Simüle edilmiş post-processing çökmesi: CSS GLSL shader filtre derleyicisi çöktü.',
        memoryEstimateKb: 120
      };
    }
    if (this.simulatedFault === 'leak') {
      return {
        status: 'memory_leak',
        details: 'Simüle edilmiş bellek sızıntısı: Tekrarlayan drop-shadow DOM katman taşması.',
        memoryEstimateKb: 3400
      };
    }

    if (config) {
      if (!Number.isFinite(config.bloomStrength) || config.bloomStrength < 0 || config.bloomStrength > 5) {
        return {
          status: 'degraded',
          details: `Bloom ışıltı katsayısı sınır dışı (${config.bloomStrength}).`,
          memoryEstimateKb: 64
        };
      }
      if (!Number.isFinite(config.chromaticOffset) || config.chromaticOffset < 0 || config.chromaticOffset > 30) {
        return {
          status: 'degraded',
          details: `Kromatik sapma ofseti anormal (${config.chromaticOffset}).`,
          memoryEstimateKb: 64
        };
      }
    }

    return {
      status: 'healthy',
      details: 'Sinematik Post-Processing boru hattı nominal (Bloom, Vignette, 2.39:1 barlar aktif).',
      memoryEstimateKb: 80
    };
  }

  public static reinitialize(): PostProcessingConfig {
    this.simulatedFault = null;
    return { ...defaultPostProcessingConfig };
  }

  public static simulateFault(type: 'crash' | 'leak') {
    this.simulatedFault = type;
  }

  public static getOverlayStyles(config: PostProcessingConfig): {
    containerClass: string;
    filterStyle: string;
  } {
    const filters: string[] = [];

    if (config.bloom) {
      filters.push(`drop-shadow(0 0 ${12 * config.bloomStrength}px rgba(56, 189, 248, 0.45))`);
    }

    if (config.chromaticAberration) {
      // Chromatic effect via subtle blur/contrast shift
      filters.push(`contrast(115%) saturate(120%)`);
    }

    return {
      containerClass: config.vignette ? 'vignette-active' : '',
      filterStyle: filters.length > 0 ? filters.join(' ') : 'none'
    };
  }
}
