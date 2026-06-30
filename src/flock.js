import { Boid } from './boid.js';

const DEFAULT_PARAMS = {
  perceptionRadius: 50,
  maxSpeed: 3,
  maxForce: 0.1,
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
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
   * Naive O(n^2) neighbor search. Fine up to a few hundred boids; the
   * spatial-grid optimization in the backlog replaces this without changing
   * the Boid/Flock interface.
   */
  step() {
    const accelerations = this.boids.map((boid) =>
      boid.computeAcceleration(this.boids, this.params)
    );
    this.boids.forEach((boid, i) => boid.update(accelerations[i], this.params, this.bounds));
  }
}
