// Uniform spatial hash used to narrow the neighbor candidates a boid has to
// consider each frame. Buckets are keyed by integer cell coordinates rather
// than a 2D array, so the world doesn't need a fixed size up front.

export class SpatialGrid {
  constructor(cellSize) {
    // A non-positive or non-finite cellSize would divide-by-zero (or
    // NaN-out) every cell lookup below, so clamp to a sane minimum here
    // rather than trusting every caller to pass a valid size.
    this.cellSize = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 1;
    this.cells = new Map();
  }

  static buildFor(boids, cellSize) {
    const grid = new SpatialGrid(cellSize);
    for (const boid of boids) grid.insert(boid);
    return grid;
  }

  _cellOf(position) {
    return [Math.floor(position.x / this.cellSize), Math.floor(position.y / this.cellSize)];
  }

  _key(cx, cy) {
    return `${cx},${cy}`;
  }

  insert(boid) {
    const [cx, cy] = this._cellOf(boid.position);
    const key = this._key(cx, cy);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push(boid);
  }

  /**
   * Returns every boid in the block of cells covering `radius` around
   * `position` — a superset of boids actually within `radius`, since it
   * doesn't crop to a circle. Callers (Boid#computeAcceleration) already
   * filter by exact distance, so this only needs to avoid false negatives.
   */
  queryNear(position, radius) {
    const [cx, cy] = this._cellOf(position);
    const span = Math.max(1, Math.ceil(radius / this.cellSize));
    const result = [];

    for (let dx = -span; dx <= span; dx += 1) {
      for (let dy = -span; dy <= span; dy += 1) {
        const bucket = this.cells.get(this._key(cx + dx, cy + dy));
        if (bucket) result.push(...bucket);
      }
    }

    return result;
  }
}
