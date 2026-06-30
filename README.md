# Boids Playground

An interactive flocking-simulation playground that runs entirely in the browser on a plain
HTML5 Canvas — no frameworks, no build step, no dependencies. Tune the classic separation,
alignment, and cohesion weights live and watch hundreds of agents reorganize themselves into
flocks, streams, and swirling vortices in real time.

## Why

Craig Reynolds' 1986 "boids" model is one of the cleanest demonstrations of emergent behavior
in computer science: three simple local rules, applied to every agent independently, produce
flocking that looks deliberate and alive. Most boids demos online are either static screenshots,
locked-down toys with no controls, or buried inside a game-engine project. This one is a single
page you can open, drag some sliders, and immediately see cause and effect — and the entire
simulation is small enough to read end to end in one sitting.

## Planned features

- Classic three-rule flocking: separation, alignment, cohesion, each independently weighted.
- Live tunable parameters (sliders): perception radius, max speed, max force, per-rule weights,
  flock size.
- Mouse/touch interaction: attract, repel, or drop obstacles the flock must steer around.
- Toroidal (wrap-around) and bounded (steer-away) world modes.
- Spatial partitioning (grid) for neighbor queries so the simulation stays smooth at high
  flock counts.
- Visual debug overlay: optional rendering of each boid's perception radius and velocity vector.
- Preset configurations (e.g. "tight schooling fish", "loose starlings", "chaotic swarm").
- Pause/step/reset controls and an FPS readout.

## Stack

- Plain JavaScript (ES modules) and the Canvas 2D API — zero runtime dependencies.
- Vanilla HTML/CSS for the control panel.
- [Vitest](https://vitest.dev/) for unit tests of the vector math and flocking rules.
- [ESLint](https://eslint.org/) for linting.
- Deployed as a static site (GitHub Pages / any static host) — no server, no build step required
  to run it.

## Status

Core simulation and control panel are functional — see [`docs/VISION.md`](docs/VISION.md) for
the design and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the remaining build order.

## Running locally

Open `src/index.html` directly in a browser, or serve the repo root with any static file
server:

```sh
npx serve .
```

## Using the control panel

- **Rules** — perception radius, max speed, max force, and the separation/alignment/cohesion
  weights are all live sliders; changes apply on the next simulation frame.
- **Flock** — the flock-size slider grows or shrinks the population without resetting existing
  boids, and "Wrap around edges" toggles between toroidal and bounded world modes.
- **Pointer** — hover (or touch) the canvas to attract or repel the flock toward the cursor;
  switch modes (or turn it off) from the dropdown, and tune the pull/push strength with the
  pointer-strength slider.
- **Playback** — Pause/Resume stops and restarts the simulation loop, Step advances exactly one
  frame while paused, and Reset rebuilds the flock at the current size and params.
- All control panel values persist to `localStorage`, so a reload restores your last
  configuration.

## Running tests

```sh
npm install
npm test
```

## License

MIT — see [LICENSE](LICENSE).
