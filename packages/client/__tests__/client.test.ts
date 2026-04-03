import { describe, it, expect, vi, beforeEach } from "vitest";
import { LuneSearchClient } from "../src/client.js";
import { LuneSearchError } from "../src/errors.js";
import type { SearchResponse, MultiSearchResponse } from "../src/types.js";

const SEARCH_RESPONSE: SearchResponse = {
  found: 2,
  hits: [
    { document: { id: "1", name: "Running Shoes" }, text_match: 100 },
    { document: { id: "2", name: "Trail Shoes" }, text_match: 90 },
  ],
  page: 1,
  out_of: 2,
  search_time_ms: 5,
};

const MULTI_RESPONSE: MultiSearchResponse = {
  results: [SEARCH_RESPONSE],
};

function createMockFetch(response: unknown = SEARCH_RESPONSE, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
}

function createClient(fetchFn: typeof fetch) {
  return new LuneSearchClient({
    apiKey: "test-key",
    host: "https://api.example.com",
    orgSlug: "acme",
    projectSlug: "store",
    cacheTTL: 5000,
    fetchFn,
  });
}

describe("LuneSearchClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: LuneSearchClient;

  beforeEach(() => {
    mockFetch = createMockFetch();
    client = createClient(mockFetch as typeof fetch);
  });

  describe("search()", () => {
    it("sends a search request to the correct endpoint", async () => {
      const result = await client.search("products", {
        q: "shoes",
        query_by: "name",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/orgs/acme/projects/store/collections/products/search",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ q: "shoes", query_by: "name" }),
        }),
      );
      expect(result.found).toBe(2);
      expect(result.hits).toHaveLength(2);
    });

    it("returns cached results on subsequent identical calls", async () => {
      const params = { q: "shoes", query_by: "name" };

      await client.search("products", params);
      await client.search("products", params);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("makes a new request for different params", async () => {
      await client.search("products", { q: "shoes", query_by: "name" });
      await client.search("products", { q: "boots", query_by: "name" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("throws LuneSearchError on API error", async () => {
      const errorFetch = createMockFetch({ error: "Not found" }, false, 404);
      const errorClient = createClient(errorFetch as typeof fetch);

      await expect(
        errorClient.search("products", { q: "x", query_by: "name" }),
      ).rejects.toThrow(LuneSearchError);
    });
  });

  describe("multiSearch()", () => {
    it("sends multi-search request with correct body", async () => {
      mockFetch = createMockFetch(MULTI_RESPONSE);
      client = createClient(mockFetch as typeof fetch);

      const queries = [
        { collection: "products", q: "shoes", query_by: "name" },
      ];

      const result = await client.multiSearch(queries);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/orgs/acme/projects/store/multi-search",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ searches: queries }),
        }),
      );
      expect(result.results).toHaveLength(1);
    });
  });

  describe("getDocument()", () => {
    it("fetches a document by ID", async () => {
      const doc = { id: "123", name: "Product" };
      mockFetch = createMockFetch(doc);
      client = createClient(mockFetch as typeof fetch);

      const result = await client.getDocument("products", "123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/orgs/acme/projects/store/collections/products/documents/123",
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(doc);
    });

    it("caches document results", async () => {
      const doc = { id: "123", name: "Product" };
      mockFetch = createMockFetch(doc);
      client = createClient(mockFetch as typeof fetch);

      await client.getDocument("products", "123");
      await client.getDocument("products", "123");

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearCache()", () => {
    it("clears cached responses", async () => {
      await client.search("products", { q: "shoes", query_by: "name" });
      client.clearCache();
      await client.search("products", { q: "shoes", query_by: "name" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("trackClick()", () => {
    it("does not throw", () => {
      expect(() => {
        client.trackClick({
          query: "shoes",
          documentId: "123",
          position: 1,
        });
      }).not.toThrow();
    });
  });

  describe("host trailing slash", () => {
    it("strips trailing slashes from host", async () => {
      const fetch = createMockFetch();
      const c = new LuneSearchClient({
        apiKey: "key",
        host: "https://api.example.com///",
        orgSlug: "o",
        projectSlug: "p",
        fetchFn: fetch as typeof globalThis.fetch,
      });

      await c.search("col", { q: "*", query_by: "f" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/api\.example\.com\/api\//),
        expect.anything(),
      );
    });
  });
});
