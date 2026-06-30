import { Boid } from './boid.js';
import { SpatialGrid } from './grid.js';

export const DEFAULT_PARAMS = {
  perceptionRadius: 50,
  maxSpeed: 3,
  maxForce: 0.1,
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  pointerWeight: 0.05,
  wrap: true,
};

function spawnBoid(bounds) {
  const x = Math.random() * bounds.width;
  const y = Math.random() * bounds.height;
  const angle = Math.random() * Math.PI * 2;
  return new Boid(x, y, Math.cos(angle), Math.sin(angle));
}

export class Flock {
  constructor(count, bounds, params = {}) {
    this.bounds = bounds;
    this.params = { ...DEFAULT_PARAMS, ...params };
    this.boids = Array.from({ length: count }, () => spawnBoid(bounds));
  }

  /**
   * Add or remove boids to match `count` without resetting the rest of the
   * flock, so a flock-size slider can be adjusted live.
   */
  setSize(count) {
    const diff = count - this.boids.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        this.boids.push(spawnBoid(this.bounds));
      }
    } else if (diff < 0) {
      this.boids.length = count;
    }
  }

  /**
   * Buckets boids into a spatial grid sized to the current perception
   * radius so each boid only scans nearby cells instead of the whole flock
   * (was a naive O(n^2) scan). `Boid#computeAcceleration` still does the
   * exact-distance filtering, so the Boid/Flock interface is unchanged.
   * `pointer`, if active, additionally steers every boid toward or away
   * from it (see Boid#_applyPointer).
   */
  step(pointer) {
    const cellSize = Math.max(this.params.perceptionRadius, 1);
    const grid = SpatialGrid.buildFor(this.boids, cellSize);

    const accelerations = this.boids.map((boid) => {
      const neighbors = grid.queryNear(boid.position, this.params.perceptionRadius);
      return boid.computeAcceleration(neighbors, this.params, pointer);
    });
    this.boids.forEach((boid, i) => boid.update(accelerations[i], this.params, this.bounds));
  }
}
