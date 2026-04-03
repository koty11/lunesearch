import { describe, it, expect, vi } from "vitest";
import { Dedup } from "../src/dedup.js";

describe("Dedup", () => {
  it("deduplicates concurrent identical requests", async () => {
    const dedup = new Dedup();
    const factory = vi.fn().mockResolvedValue("result");

    const [r1, r2, r3] = await Promise.all([
      dedup.dedupe("key", factory),
      dedup.dedupe("key", factory),
      dedup.dedupe("key", factory),
    ]);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(r1).toBe("result");
    expect(r2).toBe("result");
    expect(r3).toBe("result");
  });

  it("allows new requests after the previous one settles", async () => {
    const dedup = new Dedup();
    const factory = vi.fn().mockResolvedValue("result");

    await dedup.dedupe("key", factory);
    await dedup.dedupe("key", factory);

    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("cleans up after rejection", async () => {
    const dedup = new Dedup();
    const error = new Error("fail");
    const factory = vi.fn().mockRejectedValue(error);

    await expect(dedup.dedupe("key", factory)).rejects.toThrow("fail");
    expect(dedup.size).toBe(0);

    // New request should go through
    const successFactory = vi.fn().mockResolvedValue("ok");
    const result = await dedup.dedupe("key", successFactory);
    expect(result).toBe("ok");
    expect(successFactory).toHaveBeenCalledTimes(1);
  });

  it("handles different keys independently", async () => {
    const dedup = new Dedup();
    const f1 = vi.fn().mockResolvedValue("a");
    const f2 = vi.fn().mockResolvedValue("b");

    const [r1, r2] = await Promise.all([
      dedup.dedupe("key1", f1),
      dedup.dedupe("key2", f2),
    ]);

    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(r1).toBe("a");
    expect(r2).toBe("b");
  });
});
