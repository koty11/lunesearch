import { describe, it, expect, vi, beforeEach } from "vitest";
import { Cache } from "../src/cache.js";

describe("Cache", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined for missing keys", () => {
    const cache = new Cache(5000);
    expect(cache.get("missing")).toBeUndefined();
  });

  it("stores and retrieves values", () => {
    const cache = new Cache(5000);
    cache.set("key", { data: "hello" });
    expect(cache.get("key")).toEqual({ data: "hello" });
  });

  it("expires entries after TTL", () => {
    const cache = new Cache(100);
    cache.set("key", "value");
    expect(cache.get("key")).toBe("value");

    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 200);
    expect(cache.get("key")).toBeUndefined();
  });

  it("does not store when TTL is 0", () => {
    const cache = new Cache(0);
    cache.set("key", "value");
    expect(cache.get("key")).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("clears all entries", () => {
    const cache = new Cache(5000);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });

  it("has() returns true for valid entries and false for expired", () => {
    const cache = new Cache(100);
    cache.set("key", "value");
    expect(cache.has("key")).toBe(true);

    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 200);
    expect(cache.has("key")).toBe(false);
  });
});
