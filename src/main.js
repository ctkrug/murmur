import { Flock } from './flock.js';
import { drawFlock } from './render.js';

const SLIDER_IDS = [
  'perceptionRadius',
  'maxSpeed',
  'maxForce',
  'separationWeight',
  'alignmentWeight',
  'cohesionWeight',
  'pointerWeight',
];

function bindSliders(flock) {
  for (const id of SLIDER_IDS) {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Value`);
    if (!input) continue;

    input.value = flock.params[id];
    if (output) output.textContent = input.value;

    input.addEventListener('input', () => {
      flock.params[id] = Number(input.value);
      if (output) output.textContent = input.value;
    });
  }
}

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const bounds = { width: canvas.width, height: canvas.height };

  const flock = new Flock(150, bounds);
  bindSliders(flock);

  function loop() {
    flock.step();
    drawFlock(ctx, flock);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
