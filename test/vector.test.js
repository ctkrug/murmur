import { describe, it, expect } from 'vitest';
import { add, sub, scale, length, normalize, limit, distance } from '../src/vector.js';

describe('vector', () => {
  it('adds two vectors', () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it('subtracts two vectors', () => {
    expect(sub({ x: 5, y: 5 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 4 });
  });

  it('scales a vector', () => {
    expect(scale({ x: 2, y: -3 }, 2)).toEqual({ x: 4, y: -6 });
  });

  it('computes length', () => {
    expect(length({ x: 3, y: 4 })).toBe(5);
  });

  it('normalizes a vector to unit length', () => {
    const n = normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
  });

  it('normalize returns zero vector for zero-length input', () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('limit leaves vectors under the cap unchanged', () => {
    expect(limit({ x: 1, y: 0 }, 5)).toEqual({ x: 1, y: 0 });
  });

  it('limit clamps vectors over the cap to the max length', () => {
    const limited = limit({ x: 10, y: 0 }, 5);
    expect(length(limited)).toBeCloseTo(5);
  });

  it('limit leaves a vector exactly at the cap unchanged', () => {
    expect(limit({ x: 5, y: 0 }, 5)).toEqual({ x: 5, y: 0 });
  });

  it('limit leaves a zero vector unchanged regardless of max', () => {
    expect(limit({ x: 0, y: 0 }, 5)).toEqual({ x: 0, y: 0 });
  });

  it('computes distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
