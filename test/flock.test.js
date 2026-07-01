import { describe, it, expect } from 'vitest';
import { Flock } from '../src/flock.js';

const BOUNDS = { width: 800, height: 600 };

describe('Flock.setSize', () => {
  it('adds boids when growing', () => {
    const flock = new Flock(10, BOUNDS);
    flock.setSize(15);
    expect(flock.boids).toHaveLength(15);
  });

  it('removes boids when shrinking', () => {
    const flock = new Flock(10, BOUNDS);
    flock.setSize(4);
    expect(flock.boids).toHaveLength(4);
  });

  it('leaves existing boids untouched when growing', () => {
    const flock = new Flock(5, BOUNDS);
    const before = flock.boids.map((b) => ({ ...b.position }));
    flock.setSize(8);
    flock.boids.slice(0, 5).forEach((boid, i) => {
      expect(boid.position).toEqual(before[i]);
    });
  });

  it('is a no-op when the size is unchanged', () => {
    const flock = new Flock(6, BOUNDS);
    flock.setSize(6);
    expect(flock.boids).toHaveLength(6);
  });

  it('clamps a negative count to zero instead of throwing', () => {
    const flock = new Flock(6, BOUNDS);
    expect(() => flock.setSize(-3)).not.toThrow();
    expect(flock.boids).toHaveLength(0);
  });

  it('floors a fractional count', () => {
    const flock = new Flock(6, BOUNDS);
    flock.setSize(4.9);
    expect(flock.boids).toHaveLength(4);
  });

  it('ignores a non-finite count', () => {
    const flock = new Flock(6, BOUNDS);
    flock.setSize(NaN);
    expect(flock.boids).toHaveLength(6);
  });
});

describe('Flock.step', () => {
  it('steps without throwing when the flock has no boids', () => {
    const flock = new Flock(0, BOUNDS);
    expect(() => flock.step({ active: false })).not.toThrow();
    expect(flock.boids).toHaveLength(0);
  });

  it('steers a lone boid toward an active attract pointer', () => {
    const flock = new Flock(1, BOUNDS, { pointerWeight: 0.5 });
    const boid = flock.boids[0];
    boid.position = { x: 400, y: 300 };
    boid.velocity = { x: 0, y: 0 };
    const pointer = { active: true, mode: 'attract', position: { x: 500, y: 300 } };

    flock.step(pointer);

    expect(boid.velocity.x).toBeGreaterThan(0);
  });

  it('steers a lone boid away from a nearby obstacle', () => {
    const flock = new Flock(1, BOUNDS, { obstacleWeight: 5, maxForce: 1 });
    const boid = flock.boids[0];
    boid.position = { x: 400, y: 300 };
    boid.velocity = { x: 0, y: 0 };
    flock.addObstacle(415, 300, 10);

    flock.step({ active: false });

    expect(boid.velocity.x).toBeLessThan(0);
  });
});

describe('Flock obstacles', () => {
  it('starts with no obstacles by default', () => {
    const flock = new Flock(1, BOUNDS);
    expect(flock.obstacles).toEqual([]);
  });

  it('accepts initial obstacles in the constructor', () => {
    const flock = new Flock(1, BOUNDS, {}, [{ x: 1, y: 2, radius: 3 }]);
    expect(flock.obstacles).toEqual([{ x: 1, y: 2, radius: 3 }]);
  });

  it('addObstacle appends an obstacle with a default radius', () => {
    const flock = new Flock(1, BOUNDS);
    flock.addObstacle(100, 200);
    expect(flock.obstacles).toHaveLength(1);
    expect(flock.obstacles[0]).toMatchObject({ x: 100, y: 200 });
  });

  it('clearObstacles empties the obstacle list', () => {
    const flock = new Flock(1, BOUNDS);
    flock.addObstacle(100, 200);
    flock.clearObstacles();
    expect(flock.obstacles).toEqual([]);
  });
});
