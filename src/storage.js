const STORAGE_KEY = 'boids-playground:params';

/**
 * Reads persisted params from `storage`, falling back to `defaults` for any
 * key that's missing, the wrong type, or unparseable — so a corrupted or
 * stale localStorage entry never crashes the app.
 */
export function loadParams(storage, defaults) {
  const result = { ...defaults };

  let parsed;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return result;
    parsed = JSON.parse(raw);
  } catch {
    return result;
  }

  if (typeof parsed !== 'object' || parsed === null) return result;

  for (const key of Object.keys(defaults)) {
    if (typeof parsed[key] === typeof defaults[key]) {
      result[key] = parsed[key];
    }
  }

  return result;
}

/**
 * Persists `params` to `storage`, swallowing write failures (e.g. Safari
 * private browsing throws on `setItem` even for tiny payloads) so a slider
 * drag never surfaces an uncaught error — losing persistence is acceptable,
 * crashing the control isn't.
 */
export function saveParams(storage, params) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // Persistence is best-effort; the simulation still runs without it.
  }
}

/**
 * Reads a positive integer stored under `key`, falling back to `fallback`
 * for anything missing, unparseable, zero, negative, or non-finite (e.g. a
 * hand-edited or corrupted localStorage entry).
 */
export function loadSize(storage, key, fallback) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Persists an integer size under `key`, swallowing write failures the same
 * way saveParams does.
 */
export function saveSize(storage, key, size) {
  try {
    storage.setItem(key, String(size));
  } catch {
    // Persistence is best-effort; the simulation still runs without it.
  }
}
