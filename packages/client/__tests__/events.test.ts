import { describe, it, expect, vi } from "vitest";
import { EventTracker } from "../src/events.js";
import type { Transport } from "../src/transport.js";

function createMockTransport() {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
  } as unknown as Transport;
}

describe("EventTracker", () => {
  it("sends click events with correct payload", () => {
    const transport = createMockTransport();
    const tracker = new EventTracker(transport, "/api/v1/orgs/acme/projects/store");

    tracker.trackClick({
      query: "shoes",
      documentId: "doc-123",
      position: 1,
      collection: "products",
    });

    expect(transport.post).toHaveBeenCalledWith(
      "/api/v1/orgs/acme/projects/store/events",
      {
        type: "click",
        query: "shoes",
        document_id: "doc-123",
        position: 1,
        collection: "products",
      },
    );
  });

  it("sends conversion events with correct payload", () => {
    const transport = createMockTransport();
    const tracker = new EventTracker(transport, "/api/v1/orgs/acme/projects/store");

    tracker.trackConversion({
      query: "shoes",
      documentId: "doc-123",
      collection: "products",
      type: "purchase",
    });

    expect(transport.post).toHaveBeenCalledWith(
      "/api/v1/orgs/acme/projects/store/events",
      {
        type: "conversion",
        query: "shoes",
        document_id: "doc-123",
        collection: "products",
        conversion_type: "purchase",
      },
    );
  });

  it("does not throw when event tracking fails", () => {
    const transport = createMockTransport();
    (transport.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    const tracker = new EventTracker(transport, "/base");

    // Should not throw
    expect(() => {
      tracker.trackClick({ query: "q", documentId: "d", position: 1 });
    }).not.toThrow();
  });
});
