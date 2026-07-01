// Renders a representative still frame of the simulation to an SVG, so the
// README can show real output rather than a mock-up. It runs the actual
// Flock/Boid code headlessly (the simulation has no DOM dependency) and draws
// each boid with the same triangle geometry and palette as src/render.js.
//
// Usage: node scripts/render-sample.js > docs/sample-frame.svg
//
// Math.random is seeded below so re-running produces the same frame, keeping
// the committed asset reproducible.

import { Flock } from '../src/flock.js';
import { applyPreset } from '../src/presets.js';

// Deterministic PRNG (mulberry32) so the spawned frame is reproducible.
function seeded(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = seeded(1986); // the year Reynolds published "boids"

const WIDTH = 800;
const HEIGHT = 600;
const BOID_SIZE = 6;
const BG_COLOR = '#020617';
const BOID_COLOR = '#7dd3fc';
const OBSTACLE_COLOR = '#f87171';

const bounds = { width: WIDTH, height: HEIGHT };
const params = applyPreset({}, 'loose-starlings');
const flock = new Flock(140, bounds, params);
flock.addObstacle(260, 220, 28);
flock.addObstacle(560, 380, 34);

for (let i = 0; i < 600; i += 1) flock.step(null);

function boidPolygon(boid) {
  const angleDeg = (Math.atan2(boid.velocity.y, boid.velocity.x) * 180) / Math.PI;
  const points = `${BOID_SIZE},0 ${-BOID_SIZE},${BOID_SIZE / 2} ${-BOID_SIZE},${-BOID_SIZE / 2}`;
  const x = boid.position.x.toFixed(2);
  const y = boid.position.y.toFixed(2);
  return `  <polygon points="${points}" fill="${BOID_COLOR}" transform="translate(${x} ${y}) rotate(${angleDeg.toFixed(2)})" />`;
}

function obstacleCircle(obstacle) {
  return `  <circle cx="${obstacle.x}" cy="${obstacle.y}" r="${obstacle.radius}" fill="${OBSTACLE_COLOR}" />`;
}

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="A frame of the boids flocking simulation">`,
  `  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_COLOR}" />`,
  ...flock.obstacles.map(obstacleCircle),
  ...flock.boids.map(boidPolygon),
  '</svg>',
].join('\n');

process.stdout.write(svg + '\n');
