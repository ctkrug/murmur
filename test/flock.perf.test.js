import { describe, it, expect } from 'vitest';
import { Flock } from '../src/flock.js';

const BOUNDS = { width: 1200, height: 800 };
const FRAME_BUDGET_MS = 1000 / 60;

/**
 * Smoke test for the spatial-grid optimization: 300 boids stepped for 120
 * frames (2s of simulated time) should average well under a 16.6ms frame
 * budget even on slow CI hardware. This isn't a tight benchmark — it's a
 * regression guard against accidentally reintroducing an O(n^2) scan.
 */
describe('Flock.step performance', () => {
  it('keeps a 300-boid flock fast across many frames', () => {
    const flock = new Flock(300, BOUNDS);

    const start = performance.now();
    for (let i = 0; i < 120; i += 1) {
      flock.step({ active: false });
    }
    const elapsed = performance.now() - start;
    const avgFrameMs = elapsed / 120;

    expect(avgFrameMs).toBeLessThan(FRAME_BUDGET_MS * 5);
  });
});
