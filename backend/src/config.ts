/**
 * Centralised configuration. Reads from environment variables with sane
 * defaults so the app runs out-of-the-box but stays configurable in Docker/CI.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  upstreamBaseUrl: process.env.UPSTREAM_BASE_URL ?? "https://jsonplaceholder.typicode.com",
  // Cache time-to-live in milliseconds (default 5 minutes).
  cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 5 * 60 * 1000),
  // Timeout for upstream HTTP calls.
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS ?? 8000),
};
