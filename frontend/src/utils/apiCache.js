import api from "../api/axios";

/**
 * Lightweight in-memory GET cache for the axios instance.
 *
 * Goals (issue #11):
 *  - Reuse responses across page navigations instead of refetching on every mount.
 *  - De-duplicate concurrent identical requests (two components mounting at once
 *    share a single in-flight request).
 *  - Stay simple — no external libraries. Writes invalidate the relevant keys so
 *    we never serve stale data after a mutation.
 *
 * Use `cachedGet` for read endpoints and call `invalidate(prefix)` after any
 * mutation that changes the underlying data. `clearCache()` wipes everything
 * (e.g. on logout).
 */

const DEFAULT_TTL = 60_000; // 60s — long enough to cover a navigation round-trip

const cache = new Map(); // key -> { response, time }
const pending = new Map(); // key -> Promise (in-flight de-duplication)

// Build a stable cache key from url + sorted query params.
const buildKey = (url, params) => {
  if (!params) return url;
  const query = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return query ? `${url}?${query}` : url;
};

/**
 * Cached GET. Returns the axios response (so callers keep using `res.data`).
 * @param {string} url
 * @param {object} config axios config (only `params` participates in the key)
 * @param {{ ttl?: number, force?: boolean }} opts
 */
export const cachedGet = (url, config = {}, opts = {}) => {
  const { ttl = DEFAULT_TTL, force = false } = opts;
  const key = buildKey(url, config.params);
  const now = Date.now();

  if (!force) {
    const hit = cache.get(key);
    if (hit && now - hit.time < ttl) {
      return Promise.resolve(hit.response);
    }
    const inflight = pending.get(key);
    if (inflight) return inflight;
  }

  const request = api
    .get(url, config)
    .then((response) => {
      cache.set(key, { response, time: Date.now() });
      pending.delete(key);
      return response;
    })
    .catch((error) => {
      pending.delete(key);
      throw error;
    });

  pending.set(key, request);
  return request;
};

/**
 * Drop every cached/in-flight entry whose key starts with `prefix`.
 * e.g. invalidate("/tasks") clears "/tasks?page=1&limit=100" too.
 */
export const invalidate = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of pending.keys()) {
    if (key.startsWith(prefix)) pending.delete(key);
  }
};

/** Wipe the whole cache (e.g. on logout, so the next user starts clean). */
export const clearCache = () => {
  cache.clear();
  pending.clear();
};
