import { describe, it, expect } from 'vitest';
import { Boid } from '../src/boid.js';

const PARAMS = {
  perceptionRadius: 50,
  maxSpeed: 3,
  maxForce: 0.5,
  separationWeight: 1.5,
  alignmentWeight: 1,
  cohesionWeight: 1,
  wrap: true,
};

describe('Boid', () => {
  it('returns zero acceleration with no neighbors in range', () => {
    const boid = new Boid(0, 0, 1, 0);
    const accel = boid.computeAcceleration([boid], PARAMS);
    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('steers away from a very close neighbor (separation)', () => {
    const boid = new Boid(0, 0, 0, 0);
    const neighbor = new Boid(1, 0, 0, 0);
    const accel = boid.computeAcceleration([boid, neighbor], PARAMS);
    expect(accel.x).toBeLessThan(0);
  });

  it('steers toward the average position of distant neighbors (cohesion)', () => {
    const boid = new Boid(0, 0, 0, 0);
    const far = new Boid(20, 0, 0, 0);
    const accel = boid.computeAcceleration([boid, far], PARAMS);
    expect(accel.x).toBeGreaterThan(0);
  });

  it('update() respects maxSpeed', () => {
    const boid = new Boid(0, 0, 0, 0);
    boid.update({ x: 10, y: 10 }, PARAMS, { width: 800, height: 600 });
    const speed = Math.hypot(boid.velocity.x, boid.velocity.y);
    expect(speed).toBeLessThanOrEqual(PARAMS.maxSpeed + 1e-9);
  });

  it('update() wraps position across bounds when wrap is true', () => {
    const boid = new Boid(799, 300, 5, 0);
    boid.update({ x: 0, y: 0 }, PARAMS, { width: 800, height: 600 });
    expect(boid.position.x).toBeLessThan(800);
    expect(boid.position.x).toBeGreaterThanOrEqual(0);
  });
});
