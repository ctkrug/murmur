import { Flock, DEFAULT_PARAMS } from './flock.js';
import { drawFlock, drawDebugOverlay } from './render.js';
import { FpsCounter } from './fps.js';
import { loadParams, saveParams, loadSize, saveSize } from './storage.js';
import { PRESETS, applyPreset } from './presets.js';

const SIZE_STORAGE_KEY = 'boids-playground:size';
const DEFAULT_FLOCK_SIZE = 150;

const SLIDER_IDS = [
  'perceptionRadius',
  'maxSpeed',
  'maxForce',
  'separationWeight',
  'alignmentWeight',
  'cohesionWeight',
  'pointerWeight',
  'obstacleWeight',
];

/**
 * Writes the flock's current param values into the slider inputs/outputs
 * without touching their event listeners — used both at startup and after
 * a preset overwrites multiple params at once.
 */
function syncSliderInputs(state) {
  for (const id of SLIDER_IDS) {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Value`);
    if (!input) continue;

    input.value = state.flock.params[id];
    if (output) output.textContent = input.value;
  }
}

function bindSliders(state) {
  syncSliderInputs(state);

  for (const id of SLIDER_IDS) {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Value`);
    if (!input) continue;

    input.addEventListener('input', () => {
      state.flock.params[id] = Number(input.value);
      if (output) output.textContent = input.value;
      state.persist();
    });
  }
}

function bindPresets(state) {
  const select = document.getElementById('presetSelect');
  if (!select) return;

  for (const [key, preset] of Object.entries(PRESETS)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = preset.label;
    select.appendChild(option);
  }

  select.addEventListener('change', () => {
    if (!select.value) return;
    state.flock.params = applyPreset(state.flock.params, select.value);
    syncSliderInputs(state);
    state.persist();
    select.value = '';
  });
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
    state.persist();
  });
}

function bindWorldMode(state) {
  const input = document.getElementById('wrapToggle');
  if (!input) return;

  input.checked = state.flock.params.wrap;
  input.addEventListener('change', () => {
    state.flock.params.wrap = input.checked;
    state.persist();
  });
}

// Form controls (sliders, selects, the buttons themselves) already use Space
// for their own purpose, so the shortcut only fires when focus is elsewhere.
const SHORTCUT_EXEMPT_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON']);

function bindPlaybackControls(state, updateReadouts) {
  const pauseBtn = document.getElementById('pauseBtn');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');

  function togglePause() {
    state.running = !state.running;
    if (pauseBtn) pauseBtn.textContent = state.running ? 'Pause' : 'Resume';
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', togglePause);
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
      state.flock = new Flock(
        state.flock.boids.length,
        state.bounds,
        state.flock.params,
        state.flock.obstacles
      );
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    if (SHORTCUT_EXEMPT_TAGS.has(document.activeElement?.tagName)) return;
    event.preventDefault();
    togglePause();
  });
}

function bindObstacles(state, canvas) {
  const clearBtn = document.getElementById('clearObstaclesBtn');

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.flock.addObstacle(event.clientX - rect.left, event.clientY - rect.top);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.flock.clearObstacles();
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
    'touchstart',
    (event) => {
      if (event.touches.length === 0) return;
      event.preventDefault();
      setPosition(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length === 0) return;
      event.preventDefault();
      setPosition(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: false }
  );

  canvas.addEventListener('touchend', () => {
    state.pointer.active = false;
  });
}

function bindDebugOverlay(state) {
  const input = document.getElementById('debugOverlay');
  if (!input) return;

  state.debug = input.checked;
  input.addEventListener('change', () => {
    state.debug = input.checked;
  });
}

function bindReadouts(state) {
  const fpsReadout = document.getElementById('fpsReadout');
  const countReadout = document.getElementById('countReadout');
  const obstacleReadout = document.getElementById('obstacleReadout');
  const fpsCounter = new FpsCounter();

  return (timestampMs) => {
    const fps = fpsCounter.tick(timestampMs);
    if (fpsReadout) fpsReadout.textContent = String(fps);
    if (countReadout) countReadout.textContent = String(state.flock.boids.length);
    if (obstacleReadout) obstacleReadout.textContent = String(state.flock.obstacles.length);
  };
}

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const bounds = { width: canvas.width, height: canvas.height };

  const storedParams = loadParams(window.localStorage, DEFAULT_PARAMS);
  const storedSize = loadSize(window.localStorage, SIZE_STORAGE_KEY, DEFAULT_FLOCK_SIZE);

  const state = {
    bounds,
    flock: new Flock(storedSize, bounds, storedParams),
    running: true,
    debug: false,
    pointer: { active: false, mode: 'attract', position: { x: 0, y: 0 } },
    draw() {
      drawFlock(ctx, this.flock);
      if (this.debug) drawDebugOverlay(ctx, this.flock);
    },
    persist() {
      saveParams(window.localStorage, this.flock.params);
      saveSize(window.localStorage, SIZE_STORAGE_KEY, this.flock.boids.length);
    },
  };

  bindSliders(state);
  bindPresets(state);
  bindFlockSize(state);
  bindWorldMode(state);
  bindPointer(state, canvas);
  bindObstacles(state, canvas);
  bindDebugOverlay(state);
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
