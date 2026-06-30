# Vision

## The problem

Flocking is a fantastic, approachable example of emergent behavior — three local rules
produce convincing global motion with no central coordinator. But most boids demos on the
web fall into one of three traps:

1. **Static** — a screenshot or a fixed-parameter video, not something you can poke at.
2. **Opaque** — a game-engine project (Unity, p5.js sketch buried in a larger app) where the
   actual flocking code is hard to find or hard to read in isolation.
3. **Locked down** — a polished demo with no exposed controls, so you can look but not learn.

Boids Playground exists to be the opposite: open it, see the flock immediately, and have
every parameter that drives the behavior exposed as a slider — with a codebase small enough
to read end to end during a coffee break.

## Who it's for

- People learning about emergent/swarm behavior who want to *feel* the effect of each rule
  by nudging a slider, not just read about it.
- Developers curious about the implementation who want clean, dependency-free reference code
  for steering behaviors (separation/alignment/cohesion, seek/flee, obstacle avoidance).
- Anyone who wants a calming, oddly mesmerizing thing to leave open in a browser tab.

## The core idea

A `Flock` of `Boid`s, each independently computing an acceleration from its local
neighborhood once per frame, rendered to a single `<canvas>`. No physics engine, no
rendering framework — `requestAnimationFrame` driving plain 2D context calls. The control
panel is a thin layer of HTML range inputs bound directly to the simulation's params object;
there is no separate UI state to keep in sync.

## Key design decisions

- **Zero runtime dependencies.** The simulation and rendering are hand-rolled. This keeps
  the codebase legible as a *reference* implementation, not just a working demo — anyone
  reading `src/boid.js` sees the whole algorithm, not a library call.
- **Plain objects over classes for vectors.** `{x, y}` literals instead of a `Vector2`
  class avoid allocation/method-dispatch overhead in a loop that runs for every boid, every
  frame, and keep the math functions trivially unit-testable in isolation.
- **Compute-then-apply update order.** Every boid's acceleration is computed from a single
  shared snapshot of the flock before any boid's position is updated, so behavior doesn't
  depend on iteration order (a classic source of subtle bugs in flocking implementations).
- **Naive O(n²) neighbor search to start, spatial grid as a planned upgrade.** Correctness
  and readability come first; the `Flock`/`Boid` interface is designed so a grid-based
  neighbor query can replace the inner loop in `Flock.step()` without touching `Boid` at
  all.
- **No build step required to run it.** `src/index.html` works by double-clicking it or
  serving the repo with any static file server. A bundler isn't ruled out later, but v1
  ships without one.

## What "v1 done" looks like

- All three classic rules (separation, alignment, cohesion) implemented and independently
  weighted.
- A control panel where every weight, the perception radius, max speed/force, and flock
  size are live-adjustable sliders — no page reload needed to see the effect.
- Mouse/touch interaction: the cursor acts as an attractor or repeller the flock visibly
  reacts to.
- Both wrap-around and bounded world modes, selectable from the UI.
- Spatial-grid neighbor lookup so 300+ boids run smoothly (target: 60fps on a mid-range
  laptop).
- A handful of named presets (e.g. "schooling fish", "loose starlings") that set all
  sliders at once.
- Unit test coverage for the vector math and the three flocking rules in isolation.
- Deployed as a static site with no build step, runnable from a GitHub Pages URL.
