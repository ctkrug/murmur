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
  obstacleWeight: 3,
  wrap: true,
};

const DEFAULT_OBSTACLE_RADIUS = 20;

function spawnBoid(bounds) {
  const x = Math.random() * bounds.width;
  const y = Math.random() * bounds.height;
  const angle = Math.random() * Math.PI * 2;
  return new Boid(x, y, Math.cos(angle), Math.sin(angle));
}

export class Flock {
  constructor(count, bounds, params = {}, obstacles = []) {
    this.bounds = bounds;
    this.params = { ...DEFAULT_PARAMS, ...params };
    this.boids = Array.from({ length: count }, () => spawnBoid(bounds));
    this.obstacles = obstacles.map((obstacle) => ({ ...obstacle }));
  }

  /**
   * Drops a static obstacle at (x, y) for boids to steer around (see
   * Boid#_applyObstacles). Obstacles persist until clearObstacles() is
   * called — they aren't reset by resizing or stepping the flock.
   */
  addObstacle(x, y, radius = DEFAULT_OBSTACLE_RADIUS) {
    this.obstacles.push({ x, y, radius });
  }

  clearObstacles() {
    this.obstacles.length = 0;
  }

  /**
   * Add or remove boids to match `count` without resetting the rest of the
   * flock, so a flock-size slider can be adjusted live. Non-finite input
   * (e.g. a stray NaN) is ignored; a negative or fractional count clamps to
   * a whole non-negative size rather than throwing when assigned to
   * `boids.length`.
   */
  setSize(count) {
    if (!Number.isFinite(count)) return;
    const target = Math.max(0, Math.floor(count));
    const diff = target - this.boids.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        this.boids.push(spawnBoid(this.bounds));
      }
    } else if (diff < 0) {
      this.boids.length = target;
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
      return boid.computeAcceleration(neighbors, this.params, pointer, this.obstacles);
    });
    this.boids.forEach((boid, i) => boid.update(accelerations[i], this.params, this.bounds));
  }
}
