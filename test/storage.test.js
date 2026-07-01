import { describe, it, expect } from 'vitest';
import { loadParams, saveParams, loadSize, saveSize } from '../src/storage.js';

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

  it('falls back to defaults when the stored value parses to null', () => {
    const storage = fakeStorage({ 'boids-playground:params': 'null' });
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('falls back to defaults when the stored value parses to a non-object', () => {
    const storage = fakeStorage({ 'boids-playground:params': '42' });
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('falls back to defaults when the stored value parses to an array', () => {
    const storage = fakeStorage({ 'boids-playground:params': '[1,2,3]' });
    expect(loadParams(storage, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('round-trips saved values through loadParams', () => {
    const storage = fakeStorage();
    saveParams(storage, { ...DEFAULTS, maxSpeed: 7 });
    expect(loadParams(storage, DEFAULTS)).toEqual({ ...DEFAULTS, maxSpeed: 7 });
  });

  it('does not throw when the storage backend rejects writes', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => saveParams(storage, DEFAULTS)).not.toThrow();
  });
});

describe('loadSize', () => {
  it('returns the fallback when nothing is stored', () => {
    const storage = fakeStorage();
    expect(loadSize(storage, 'size', 150)).toBe(150);
  });

  it('round-trips a saved size', () => {
    const storage = fakeStorage();
    saveSize(storage, 'size', 200);
    expect(loadSize(storage, 'size', 150)).toBe(200);
  });

  it('falls back for a negative stored size', () => {
    const storage = fakeStorage({ size: '-10' });
    expect(loadSize(storage, 'size', 150)).toBe(150);
  });

  it('falls back for a zero stored size', () => {
    const storage = fakeStorage({ size: '0' });
    expect(loadSize(storage, 'size', 150)).toBe(150);
  });

  it('falls back for a non-numeric stored size', () => {
    const storage = fakeStorage({ size: 'lots' });
    expect(loadSize(storage, 'size', 150)).toBe(150);
  });

  it('falls back when reading throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(loadSize(storage, 'size', 150)).toBe(150);
  });
});

describe('saveSize', () => {
  it('does not throw when the storage backend rejects writes', () => {
    const storage = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => saveSize(storage, 'size', 200)).not.toThrow();
  });
});
