import { describe, it, expect } from 'vitest';
import { FpsCounter } from '../src/fps.js';

describe('FpsCounter', () => {
  it('reports 0 before the first sample interval elapses', () => {
    const counter = new FpsCounter(500);
    expect(counter.tick(0)).toBe(0);
    expect(counter.tick(100)).toBe(0);
  });

  it('samples fps once the interval elapses', () => {
    const counter = new FpsCounter(500);
    counter.tick(0);
    for (let t = 16; t < 500; t += 16) counter.tick(t);
    const fps = counter.tick(500);
    expect(fps).toBeGreaterThan(0);
    expect(fps).toBeCloseTo(63, -1);
  });

  it('resets the frame count after each sample', () => {
    const counter = new FpsCounter(100);
    counter.tick(0);
    counter.tick(50);
    counter.tick(100);
    expect(counter.frames).toBe(0);
  });
});
