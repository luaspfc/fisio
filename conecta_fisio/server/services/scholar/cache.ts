/**
 * Minimal in-memory TTL cache used to avoid hammering the free public APIs
 * (CrossRef, OpenAlex, Semantic Scholar, PubMed, Europe PMC, arXiv, Open Library,
 * Google Books all impose informal or hard rate limits for unauthenticated use).
 *
 * Deliberately simple: a Map with lazy expiry + a hard size cap (evicts the
 * oldest entry). No external dependency needed for a single-process server.
 *
 * `wrap` is generic per-call (not fixed to one value type at construction) so
 * a single cache instance can be shared across endpoints that return
 * different shapes (search results, single lookups, etc) without losing type
 * information at the call site.
 */

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 500;

export class TtlCache {
  private store = new Map<string, CacheEntry>();

  constructor(private ttlMs: number = DEFAULT_TTL_MS) {}

  private get(key: string): unknown | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private set(key: string, value: unknown): void {
    if (this.store.size >= MAX_ENTRIES) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Fetches from cache, or computes + stores on miss. */
  async wrap<T>(key: string, compute: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached as T;
    const value = await compute();
    this.set(key, value);
    return value;
  }
}

export const scholarSearchCache = new TtlCache(10 * 60 * 1000);
export const scholarLookupCache = new TtlCache(60 * 60 * 1000);
