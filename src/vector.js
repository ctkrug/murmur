// Minimal 2D vector helpers used throughout the simulation. Vectors are plain
// {x, y} objects rather than a class so they stay cheap to allocate per-frame.

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

export function length(v) {
  return Math.hypot(v.x, v.y);
}

export function normalize(v) {
  const len = length(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function limit(v, max) {
  const len = length(v);
  if (len <= max || len === 0) return { x: v.x, y: v.y };
  return scale(v, max / len);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
