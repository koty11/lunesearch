/** Error thrown when the Lunexa API returns a non-2xx response. */
export class LuneSearchError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "LuneSearchError";
    this.status = status;
    this.body = body;
  }
}

/** Error thrown when the network request fails (no response received). */
export class LuneSearchNetworkError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "LuneSearchNetworkError";
    this.cause = cause;
  }
}
