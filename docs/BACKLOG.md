# Backlog

High-level epic/story breakdown to guide build runs. Stories are intentionally coarse —
each should be small enough to land as one focused PR.

## Epic 1: Interactive controls

- [x] Build a control panel (HTML range inputs) for perception radius, max speed, max
      force, and the three rule weights, bound live to the running simulation's params.
- [x] Add a flock-size slider that adds/removes boids without resetting the simulation.
- [x] Add pause / step-one-frame / reset buttons.
- [x] Add an FPS readout and a boid-count readout.
- [x] Persist the current slider values to `localStorage` so a reload restores the last
      configuration.

## Epic 2: World interaction and modes

- [x] Add mouse/touch tracking and an "attract" mode where the flock steers toward the
      cursor.
- [x] Add a "repel" mode (and a way to toggle attract/repel) where the flock steers away
      from the cursor.
- [x] Add a toggle between toroidal (wrap-around) and bounded (steer-away-from-edge) world
      modes.
- [x] Add click-to-drop static obstacles that boids steer around.

## Epic 3: Performance and presets

- [x] Replace the naive O(n²) neighbor search in `Flock.step()` with a spatial grid,
      keeping the `Boid`/`Flock` public interface unchanged.
- [x] Benchmark and tune for 300+ boids at a steady 60fps on a mid-range laptop.
- [ ] Add a debug overlay that optionally renders each boid's perception radius and
      velocity vector.
- [ ] Add named presets (e.g. "tight schooling fish", "loose starlings", "chaotic swarm")
      that set all sliders at once via a dropdown.
- [ ] Add unit tests for alignment and cohesion edge cases (single neighbor, all neighbors
      at the same position, neighbors exactly at the perception-radius boundary).
