import { describe, it, expect } from 'vitest';
import { loadParams, saveParams } from '../src/storage.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const DEFAULTS = { maxSpeed: 3, maxForce: 0.1, wrap: true };

describe('storage', () => {
  it('returns defaults when nothing is stored', () => {
    const storage = fakeStorage();
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('merges stored values over defaults', () => {
    const storage = fakeStorage({ 'boids-playground:params': JSON.stringify({ maxSpeed: 5 }) });
    expect(loadParams(storage, DEFAULTS)).toEqual({ ...DEFAULTS, maxSpeed: 5 });
  });

  it('falls back to defaults for keys with the wrong type', () => {
    const storage = fakeStorage({
      'boids-playground:params': JSON.stringify({ maxSpeed: 'fast' }),
    });
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('falls back to defaults on unparseable JSON', () => {
    const storage = fakeStorage({ 'boids-playground:params': 'not json' });
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('round-trips saved values through loadParams', () => {
    const storage = fakeStorage();
    saveParams(storage, { ...DEFAULTS, maxSpeed: 7 });
    expect(loadParams(storage, DEFAULTS)).toEqual({ ...DEFAULTS, maxSpeed: 7 });
  });
});
