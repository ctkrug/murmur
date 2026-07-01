const BOID_SIZE = 6;
const OBSTACLE_COLOR = '#f87171';
const DEBUG_RADIUS_COLOR = 'rgba(125, 211, 252, 0.25)';
const DEBUG_VELOCITY_COLOR = '#fbbf24';
const DEBUG_VELOCITY_SCALE = 10;

export function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
  ctx.save();
  ctx.translate(boid.position.x, boid.position.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(BOID_SIZE, 0);
  ctx.lineTo(-BOID_SIZE, BOID_SIZE / 2);
  ctx.lineTo(-BOID_SIZE, -BOID_SIZE / 2);
  ctx.closePath();
  ctx.fillStyle = '#7dd3fc';
  ctx.fill();
  ctx.restore();
}

export function drawObstacle(ctx, obstacle) {
  ctx.beginPath();
  ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
  ctx.fillStyle = OBSTACLE_COLOR;
  ctx.fill();
}

/**
 * Renders each boid's perception radius (a faint circle) and velocity (a
 * line scaled up for visibility), so the rules driving the flock's behavior
 * can be inspected directly rather than inferred from the emergent motion.
 */
export function drawDebugOverlay(ctx, flock) {
  ctx.save();

  ctx.strokeStyle = DEBUG_RADIUS_COLOR;
  ctx.lineWidth = 1;
  for (const boid of flock.boids) {
    ctx.beginPath();
    ctx.arc(boid.position.x, boid.position.y, flock.params.perceptionRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = DEBUG_VELOCITY_COLOR;
  for (const boid of flock.boids) {
    ctx.beginPath();
    ctx.moveTo(boid.position.x, boid.position.y);
    ctx.lineTo(
      boid.position.x + boid.velocity.x * DEBUG_VELOCITY_SCALE,
      boid.position.y + boid.velocity.y * DEBUG_VELOCITY_SCALE
    );
    ctx.stroke();
  }

  ctx.restore();
}

export function drawFlock(ctx, flock) {
  ctx.clearRect(0, 0, flock.bounds.width, flock.bounds.height);
  for (const obstacle of flock.obstacles) {
    drawObstacle(ctx, obstacle);
  }
  for (const boid of flock.boids) {
    drawBoid(ctx, boid);
  }
}
