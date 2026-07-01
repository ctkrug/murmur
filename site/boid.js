import { add, sub, scale, length, limit, normalize, distance } from './vector.js';

// Extra clearance added around an obstacle's own radius before a boid starts
// steering away from it, so boids visibly curve around rather than grazing
// the edge.
const OBSTACLE_MARGIN = 30;

export class Boid {
  constructor(x, y, vx, vy) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
  }

  /**
   * Steer away from boids that are too close (separation), match the average
   * heading of nearby boids (alignment), and move toward the average position
   * of nearby boids (cohesion). Each rule only considers neighbors within
   * `params.perceptionRadius` and is weighted independently.
   */
  computeAcceleration(neighbors, params, pointer, obstacles = []) {
    const separation = { x: 0, y: 0 };
    const alignment = { x: 0, y: 0 };
    const cohesion = { x: 0, y: 0 };
    let count = 0;

    for (const other of neighbors) {
      if (other === this) continue;
      const d = distance(this.position, other.position);
      if (d === 0 || d > params.perceptionRadius) continue;

      count += 1;
      const away = scale(normalize(sub(this.position, other.position)), 1 / d);
      separation.x += away.x;
      separation.y += away.y;
      alignment.x += other.velocity.x;
      alignment.y += other.velocity.y;
      cohesion.x += other.position.x;
      cohesion.y += other.position.y;
    }

    const steer = { x: 0, y: 0 };

    if (count > 0) {
      const avgAlignment = scale(alignment, 1 / count);
      const avgCohesionTarget = scale(cohesion, 1 / count);
      const cohesionForce = sub(avgCohesionTarget, this.position);

      steer.x =
        separation.x * params.separationWeight +
        avgAlignment.x * params.alignmentWeight +
        cohesionForce.x * params.cohesionWeight;
      steer.y =
        separation.y * params.separationWeight +
        avgAlignment.y * params.alignmentWeight +
        cohesionForce.y * params.cohesionWeight;
    }

    this._applyPointer(steer, params, pointer);
    this._applyObstacles(steer, params, obstacles);

    return limit(steer, params.maxForce);
  }

  /**
   * Steers toward (attract) or away from (repel) an active pointer target,
   * mutating `steer` in place. A no-op when there is no active pointer.
   */
  _applyPointer(steer, params, pointer) {
    if (!pointer || !pointer.active) return;

    const toPointer = sub(pointer.position, this.position);
    const d = length(toPointer);
    if (d === 0) return;

    const sign = pointer.mode === 'repel' ? -1 : 1;
    const dir = normalize(toPointer);
    steer.x += dir.x * params.pointerWeight * sign;
    steer.y += dir.y * params.pointerWeight * sign;
  }

  /**
   * Pushes away from each obstacle whose avoidance radius (its own radius
   * plus a fixed margin) the boid has entered, scaled by how deep into that
   * radius it is — stronger the closer it gets — mutating `steer` in place.
   */
  _applyObstacles(steer, params, obstacles) {
    for (const obstacle of obstacles) {
      const away = sub(this.position, { x: obstacle.x, y: obstacle.y });
      const d = length(away);
      const avoidRadius = obstacle.radius + OBSTACLE_MARGIN;
      if (d === 0 || d > avoidRadius) continue;

      const dir = normalize(away);
      const strength = ((avoidRadius - d) / avoidRadius) * params.obstacleWeight;
      steer.x += dir.x * strength;
      steer.y += dir.y * strength;
    }
  }

  update(acceleration, params, bounds) {
    this.velocity = limit(add(this.velocity, acceleration), params.maxSpeed);
    this.position = add(this.position, this.velocity);

    if (params.wrap) {
      this.position.x =
        bounds.width > 0 ? ((this.position.x % bounds.width) + bounds.width) % bounds.width : 0;
      this.position.y =
        bounds.height > 0
          ? ((this.position.y % bounds.height) + bounds.height) % bounds.height
          : 0;
    } else {
      if (this.position.x < 0 || this.position.x > bounds.width) this.velocity.x *= -1;
      if (this.position.y < 0 || this.position.y > bounds.height) this.velocity.y *= -1;
      this.position.x = Math.min(Math.max(this.position.x, 0), bounds.width);
      this.position.y = Math.min(Math.max(this.position.y, 0), bounds.height);
    }
  }
}
