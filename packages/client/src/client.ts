import { Cache } from "./cache.js";
import { Dedup } from "./dedup.js";
import { EventTracker } from "./events.js";
import { Transport } from "./transport.js";
import type {
  LuneSearchConfig,
  SearchParams,
  SearchResponse,
  MultiSearchQuery,
  MultiSearchResponse,
  ClickEventParams,
  ConversionEventParams,
} from "./types.js";

const DEFAULT_CACHE_TTL = 5000;

export class LuneSearchClient {
  private readonly transport: Transport;
  private readonly cache: Cache;
  private readonly dedup: Dedup;
  private readonly events: EventTracker;
  private readonly basePath: string;

  constructor(config: LuneSearchConfig) {
    const fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);

    this.transport = new Transport({
      host: config.host.replace(/\/+$/, ""),
      apiKey: config.apiKey,
      fetchFn,
    });

    this.cache = new Cache(config.cacheTTL ?? DEFAULT_CACHE_TTL);
    this.dedup = new Dedup();
    this.basePath = `/api/v1/orgs/${config.orgSlug}/projects/${config.projectSlug}`;
    this.events = new EventTracker(this.transport, this.basePath);
  }

  /**
   * Search a collection.
   */
  async search<T = Record<string, unknown>>(
    collection: string,
    params: SearchParams,
  ): Promise<SearchResponse<T>> {
    const path = `${this.basePath}/collections/${collection}/search`;
    const cacheKey = `search:${collection}:${JSON.stringify(params)}`;

    const cached = this.cache.get<SearchResponse<T>>(cacheKey);
    if (cached) return cached;

    const result = await this.dedup.dedupe(cacheKey, () =>
      this.transport.post<SearchResponse<T>>(path, params),
    );

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Search multiple collections in a single request.
   */
  async multiSearch<T = Record<string, unknown>>(
    queries: MultiSearchQuery[],
  ): Promise<MultiSearchResponse<T>> {
    const path = `${this.basePath}/multi-search`;
    const cacheKey = `multi:${JSON.stringify(queries)}`;

    const cached = this.cache.get<MultiSearchResponse<T>>(cacheKey);
    if (cached) return cached;

    const result = await this.dedup.dedupe(cacheKey, () =>
      this.transport.post<MultiSearchResponse<T>>(path, { searches: queries }),
    );

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Get a single document by ID.
   */
  async getDocument<T = Record<string, unknown>>(
    collection: string,
    documentId: string,
  ): Promise<T> {
    const path = `${this.basePath}/collections/${collection}/documents/${documentId}`;
    const cacheKey = `doc:${collection}:${documentId}`;

    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const result = await this.dedup.dedupe(cacheKey, () =>
      this.transport.get<T>(path),
    );

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Track a click event (fire-and-forget).
   */
  trackClick(params: ClickEventParams): void {
    this.events.trackClick(params);
  }

  /**
   * Track a conversion event (fire-and-forget).
   */
  trackConversion(params: ConversionEventParams): void {
    this.events.trackConversion(params);
  }

  /**
   * Clear the request cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
