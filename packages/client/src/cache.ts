interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Simple in-memory TTL cache. */
export class Cache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    if (this.ttl <= 0) return;
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
