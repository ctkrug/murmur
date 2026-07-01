import { describe, it, expect } from 'vitest';
import { PRESETS, applyPreset } from '../src/presets.js';

const BASE_PARAMS = {
  perceptionRadius: 50,
  maxSpeed: 3,
  maxForce: 0.1,
  separationWeight: 1.5,
  alignmentWeight: 1,
  cohesionWeight: 1,
  pointerWeight: 0.05,
  wrap: true,
};

describe('applyPreset', () => {
  it('merges a known preset\'s params over the existing params', () => {
    const result = applyPreset(BASE_PARAMS, 'tight-schooling-fish');
    expect(result).toMatchObject(PRESETS['tight-schooling-fish'].params);
  });

  it('leaves params not covered by the preset untouched', () => {
    const result = applyPreset(BASE_PARAMS, 'chaotic-swarm');
    expect(result.pointerWeight).toBe(BASE_PARAMS.pointerWeight);
    expect(result.wrap).toBe(BASE_PARAMS.wrap);
  });

  it('returns the params unchanged for an unknown preset key', () => {
    expect(applyPreset(BASE_PARAMS, 'does-not-exist')).toBe(BASE_PARAMS);
  });

  it('does not mutate the input params object', () => {
    const original = { ...BASE_PARAMS };
    applyPreset(BASE_PARAMS, 'loose-starlings');
    expect(BASE_PARAMS).toEqual(original);
  });

  it.each(Object.keys(PRESETS))('every value in the %s preset is a finite number', (key) => {
    for (const value of Object.values(PRESETS[key].params)) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it.each(Object.keys(PRESETS))(
    'the %s preset never overrides world mode or pointer strength',
    (key) => {
      expect(PRESETS[key].params).not.toHaveProperty('wrap');
      expect(PRESETS[key].params).not.toHaveProperty('pointerWeight');
    }
  );
});
