import { describe, it, expect, vi } from "vitest";
import { Transport } from "../src/transport.js";
import { LuneSearchError, LuneSearchNetworkError } from "../src/errors.js";

function createMockFetch(response: Partial<Response>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(""),
    ...response,
  });
}

describe("Transport", () => {
  it("sends GET requests with correct headers", async () => {
    const mockFetch = createMockFetch({
      json: vi.fn().mockResolvedValue({ id: "123" }),
    });

    const transport = new Transport({
      host: "https://api.example.com",
      apiKey: "test-key",
      fetchFn: mockFetch as typeof fetch,
    });

    const result = await transport.get("/test/path");

    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test/path", {
      method: "GET",
      headers: {
        "X-LUNEXA-API-KEY": "test-key",
        "Content-Type": "application/json",
      },
      body: undefined,
    });
    expect(result).toEqual({ id: "123" });
  });

  it("sends POST requests with JSON body", async () => {
    const mockFetch = createMockFetch({
      json: vi.fn().mockResolvedValue({ found: 10 }),
    });

    const transport = new Transport({
      host: "https://api.example.com",
      apiKey: "test-key",
      fetchFn: mockFetch as typeof fetch,
    });

    const body = { q: "shoes", query_by: "name" };
    const result = await transport.post("/search", body);

    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/search", {
      method: "POST",
      headers: {
        "X-LUNEXA-API-KEY": "test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    expect(result).toEqual({ found: 10 });
  });

  it("throws LuneSearchError on non-2xx with JSON error body", async () => {
    const mockFetch = createMockFetch({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ error: "Invalid API key" }),
    });

    const transport = new Transport({
      host: "https://api.example.com",
      apiKey: "bad-key",
      fetchFn: mockFetch as typeof fetch,
    });

    await expect(transport.get("/test")).rejects.toThrow(LuneSearchError);
    await expect(transport.get("/test")).rejects.toMatchObject({
      message: "Invalid API key",
      status: 401,
    });
  });

  it("throws LuneSearchError with status message when body is not JSON", async () => {
    const mockFetch = createMockFetch({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("not json")),
      text: vi.fn().mockResolvedValue("Internal Server Error"),
    });

    const transport = new Transport({
      host: "https://api.example.com",
      apiKey: "test-key",
      fetchFn: mockFetch as typeof fetch,
    });

    await expect(transport.get("/test")).rejects.toThrow(LuneSearchError);
    await expect(transport.get("/test")).rejects.toMatchObject({
      message: "HTTP 500",
      status: 500,
    });
  });

  it("throws LuneSearchNetworkError when fetch fails", async () => {
    const networkError = new TypeError("Failed to fetch");
    const mockFetch = vi.fn().mockRejectedValue(networkError);

    const transport = new Transport({
      host: "https://api.example.com",
      apiKey: "test-key",
      fetchFn: mockFetch as typeof fetch,
    });

    await expect(transport.get("/test")).rejects.toThrow(LuneSearchNetworkError);
    await expect(transport.get("/test")).rejects.toMatchObject({
      message: "Network request failed: GET /test",
    });
  });
});
