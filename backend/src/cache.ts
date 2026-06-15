/**
 * Minimal in-memory TTL cache. A Map keyed by URL with per-entry expiry,
 * with a get/set surface that maps 1:1 onto Redis if we ever need to scale out.
 */
interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache {
  private store = new Map<string, Entry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(private defaultTtlMs: number) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      // Lazy eviction on read.
      this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  /** Returns the cached value or computes, stores and returns it. */
  async getOrSet<T>(key: string, producer: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    this.set(key, value, ttlMs);
    return value;
  }

  stats() {
    return { size: this.store.size, hits: this.hits, misses: this.misses };
  }

  clear() {
    this.store.clear();
  }
}
