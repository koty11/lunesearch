/** Deduplicates in-flight requests with the same key. */
export class Dedup {
  private readonly inflight = new Map<string, Promise<unknown>>();

  /**
   * If a request with the same key is already in-flight, returns its promise.
   * Otherwise, calls the factory, stores the promise, and cleans up when it settles.
   */
  async dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = factory().finally(() => {
      this.inflight.delete(key);
    });

    this.inflight.set(key, promise);
    return promise;
  }

  get size(): number {
    return this.inflight.size;
  }
}
