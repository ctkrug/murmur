import { Flock } from './flock.js';
import { drawFlock } from './render.js';
import { FpsCounter } from './fps.js';

const SLIDER_IDS = [
  'perceptionRadius',
  'maxSpeed',
  'maxForce',
  'separationWeight',
  'alignmentWeight',
  'cohesionWeight',
  'pointerWeight',
];

function bindSliders(state) {
  for (const id of SLIDER_IDS) {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Value`);
    if (!input) continue;

    input.value = state.flock.params[id];
    if (output) output.textContent = input.value;

    input.addEventListener('input', () => {
      state.flock.params[id] = Number(input.value);
      if (output) output.textContent = input.value;
    });
  }
}

function bindFlockSize(state) {
  const input = document.getElementById('flockSize');
  const output = document.getElementById('flockSizeValue');
  if (!input) return;

  input.value = state.flock.boids.length;
  if (output) output.textContent = input.value;

  input.addEventListener('input', () => {
    state.flock.setSize(Number(input.value));
    if (output) output.textContent = input.value;
  });
}

function bindPlaybackControls(state, updateReadouts) {
  const pauseBtn = document.getElementById('pauseBtn');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      state.running = !state.running;
      pauseBtn.textContent = state.running ? 'Pause' : 'Resume';
    });
  }

  if (stepBtn) {
    stepBtn.addEventListener('click', () => {
      state.flock.step(state.pointer);
      state.draw();
      updateReadouts(performance.now());
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.flock = new Flock(state.flock.boids.length, state.bounds, state.flock.params);
    });
  }
}

function bindPointer(state, canvas) {
  const modeSelect = document.getElementById('pointerMode');

  function setPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    state.pointer.position = { x: clientX - rect.left, y: clientY - rect.top };
    state.pointer.active = !modeSelect || modeSelect.value !== 'off';
  }

  if (modeSelect) {
    state.pointer.mode = modeSelect.value;
    modeSelect.addEventListener('change', () => {
      state.pointer.mode = modeSelect.value;
      state.pointer.active = modeSelect.value !== 'off' && state.pointer.active;
    });
  }

  canvas.addEventListener('mousemove', (event) => {
    setPosition(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseleave', () => {
    state.pointer.active = false;
  });

  canvas.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length === 0) return;
      setPosition(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: true }
  );

  canvas.addEventListener('touchend', () => {
    state.pointer.active = false;
  });
}

function bindReadouts(state) {
  const fpsReadout = document.getElementById('fpsReadout');
  const countReadout = document.getElementById('countReadout');
  const fpsCounter = new FpsCounter();

  return (timestampMs) => {
    const fps = fpsCounter.tick(timestampMs);
    if (fpsReadout) fpsReadout.textContent = String(fps);
    if (countReadout) countReadout.textContent = String(state.flock.boids.length);
  };
}

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const bounds = { width: canvas.width, height: canvas.height };

  const state = {
    bounds,
    flock: new Flock(150, bounds),
    running: true,
    pointer: { active: false, mode: 'attract', position: { x: 0, y: 0 } },
    draw() {
      drawFlock(ctx, this.flock);
    },
  };

  bindSliders(state);
  bindFlockSize(state);
  bindPointer(state, canvas);
  const updateReadouts = bindReadouts(state);
  bindPlaybackControls(state, updateReadouts);

  function loop(timestampMs) {
    if (state.running) state.flock.step(state.pointer);
    state.draw();
    updateReadouts(timestampMs);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
