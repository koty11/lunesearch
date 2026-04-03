import { LuneSearchError, LuneSearchNetworkError } from "./errors.js";
import type { ApiErrorResponse } from "./types.js";

export interface TransportConfig {
  host: string;
  apiKey: string;
  fetchFn: typeof globalThis.fetch;
}

export class Transport {
  private readonly config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.config.host}${path}`;
    const headers: Record<string, string> = {
      "X-LUNEXA-API-KEY": this.config.apiKey,
      "Content-Type": "application/json",
    };

    let response: Response;
    try {
      response = await this.config.fetchFn(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new LuneSearchNetworkError(
        `Network request failed: ${method} ${path}`,
        err,
      );
    }

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text().catch(() => null);
      }

      const message =
        errorBody && typeof errorBody === "object" && "error" in errorBody
          ? (errorBody as ApiErrorResponse).error
          : `HTTP ${response.status}`;

      throw new LuneSearchError(message, response.status, errorBody);
    }

    return (await response.json()) as T;
  }
}
