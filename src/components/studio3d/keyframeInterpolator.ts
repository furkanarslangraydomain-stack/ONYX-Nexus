import { ObjectKeyframeTrack, TransformKeyframe, SceneObject } from './types';
import { selfHealingEngine } from './selfHealing';

export class KeyframeInterpolator {
  private static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  public static evaluateTracks(
    objects: SceneObject[],
    tracks: ObjectKeyframeTrack[],
    time: number
  ): SceneObject[] {
    if (!tracks || tracks.length === 0) return objects;

    return objects.map(obj => {
      const track = tracks.find(t => t.objectId === obj.id);
      if (!track || track.keyframes.length === 0) return obj;

      const kfs = [...track.keyframes].sort((a, b) => a.time - b.time);

      // Before first keyframe
      if (time <= kfs[0].time) {
        return {
          ...obj,
          position: kfs[0].position,
          rotation: kfs[0].rotation,
          scale: kfs[0].scale
        };
      }

      // After last keyframe
      if (time >= kfs[kfs.length - 1].time) {
        const last = kfs[kfs.length - 1];
        return {
          ...obj,
          position: last.position,
          rotation: last.rotation,
          scale: last.scale
        };
      }

      // Find segment
      for (let i = 0; i < kfs.length - 1; i++) {
        const kfA = kfs[i];
        const kfB = kfs[i + 1];

        if (time >= kfA.time && time <= kfB.time) {
          const rawAlpha = (time - kfA.time) / (kfB.time - kfA.time);
          const alpha = kfB.interpolation === 'bezier'
            ? this.easeInOutCubic(rawAlpha)
            : kfB.interpolation === 'step'
              ? 0
              : rawAlpha;

          const newPos: [number, number, number] = [
            this.lerp(kfA.position[0], kfB.position[0], alpha),
            this.lerp(kfA.position[1], kfB.position[1], alpha),
            this.lerp(kfA.position[2], kfB.position[2], alpha)
          ];

          const newRot: [number, number, number] = [
            this.lerp(kfA.rotation[0], kfB.rotation[0], alpha),
            this.lerp(kfA.rotation[1], kfB.rotation[1], alpha),
            this.lerp(kfA.rotation[2], kfB.rotation[2], alpha)
          ];

          const newScale: [number, number, number] = [
            this.lerp(kfA.scale[0], kfB.scale[0], alpha),
            this.lerp(kfA.scale[1], kfB.scale[1], alpha),
            this.lerp(kfA.scale[2], kfB.scale[2], alpha)
          ];

          return {
            ...obj,
            position: selfHealingEngine.sanitizeVector3(newPos, obj.position),
            rotation: selfHealingEngine.sanitizeVector3(newRot, obj.rotation),
            scale: selfHealingEngine.sanitizeVector3(newScale, obj.scale)
          };
        }
      }

      return obj;
    });
  }
}
