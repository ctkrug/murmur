// Named parameter bundles that set every rule slider at once, so a user can
// jump straight to a recognizable flocking style instead of hand-tuning six
// sliders from scratch.

export const PRESETS = {
  'tight-schooling-fish': {
    label: 'Tight schooling fish',
    params: {
      perceptionRadius: 40,
      maxSpeed: 3.5,
      maxForce: 0.15,
      separationWeight: 1.8,
      alignmentWeight: 1.4,
      cohesionWeight: 1.6,
    },
  },
  'loose-starlings': {
    label: 'Loose starlings',
    params: {
      perceptionRadius: 90,
      maxSpeed: 4.5,
      maxForce: 0.12,
      separationWeight: 1.0,
      alignmentWeight: 1.6,
      cohesionWeight: 0.8,
    },
  },
  'chaotic-swarm': {
    label: 'Chaotic swarm',
    params: {
      perceptionRadius: 60,
      maxSpeed: 6,
      maxForce: 0.4,
      separationWeight: 0.4,
      alignmentWeight: 0.2,
      cohesionWeight: 0.3,
    },
  },
};

/**
 * Returns a new params object with a preset's values merged over `params`,
 * leaving unrelated params (e.g. wrap, pointerWeight) untouched. Returns
 * `params` unchanged for an unknown key.
 */
export function applyPreset(params, presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return params;
  return { ...params, ...preset.params };
}
