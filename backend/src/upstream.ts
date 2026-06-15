import { config } from "./config.js";
import { TtlCache } from "./cache.js";
import { ApiError } from "./middleware/errorHandler.js";

/**
 * Thin client around the upstream JSONPlaceholder API.
 *
 * - All GETs go through a shared TTL cache (keyed by full URL).
 * - Adds an abort-based timeout so a slow upstream can't hang our event loop.
 * - Translates upstream/network failures into a typed ApiError (502) so the
 *   error middleware can respond consistently.
 */
export const cache = new TtlCache(config.cacheTtlMs);

export async function fetchUpstream<T>(path: string): Promise<T> {
  const url = `${config.upstreamBaseUrl}${path}`;

  return cache.getOrSet<T>(url, async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new ApiError(
          502,
          `Upstream responded with ${res.status} for ${path}`,
          "UPSTREAM_ERROR",
        );
      }
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const reason = err instanceof Error && err.name === "AbortError" ? "timeout" : "network error";
      throw new ApiError(502, `Failed to reach upstream (${reason}) for ${path}`, "UPSTREAM_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  });
}
