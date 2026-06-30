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

  for (const key of Object.keys(defaults)) {
    if (typeof parsed[key] === typeof defaults[key]) {
      result[key] = parsed[key];
    }
  }

  return result;
}

export function saveParams(storage, params) {
  storage.setItem(STORAGE_KEY, JSON.stringify(params));
}
