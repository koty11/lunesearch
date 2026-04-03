import type { Transport } from "./transport.js";
import type { ClickEventParams, ConversionEventParams } from "./types.js";

export class EventTracker {
  private readonly transport: Transport;
  private readonly basePath: string;

  constructor(transport: Transport, basePath: string) {
    this.transport = transport;
    this.basePath = basePath;
  }

  /**
   * Track a click event. Fire-and-forget — does not throw on failure.
   */
  trackClick(params: ClickEventParams): void {
    const body = {
      type: "click",
      query: params.query,
      document_id: params.documentId,
      position: params.position,
      collection: params.collection,
    };

    this.transport
      .post(`${this.basePath}/events`, body)
      .catch(() => {
        // Fire-and-forget: swallow errors to avoid disrupting the user's app.
      });
  }

  /**
   * Track a conversion event. Fire-and-forget — does not throw on failure.
   */
  trackConversion(params: ConversionEventParams): void {
    const body = {
      type: "conversion",
      query: params.query,
      document_id: params.documentId,
      collection: params.collection,
      conversion_type: params.type,
    };

    this.transport
      .post(`${this.basePath}/events`, body)
      .catch(() => {
        // Fire-and-forget: swallow errors.
      });
  }
}
