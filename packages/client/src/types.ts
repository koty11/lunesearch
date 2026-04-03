/** Configuration for the LuneSearch client. */
export interface LuneSearchConfig {
  /** Search-only API key (safe for browser usage). */
  apiKey: string;
  /** Lunexa API host, e.g. "https://api.ailunexa.com". */
  host: string;
  /** Organization slug. */
  orgSlug: string;
  /** Project slug. */
  projectSlug: string;
  /** Cache TTL in milliseconds. Set to 0 to disable. Default: 5000. */
  cacheTTL?: number;
  /** Custom fetch implementation. Defaults to globalThis.fetch. */
  fetchFn?: typeof globalThis.fetch;
}

/** Parameters for a search request. */
export interface SearchParams {
  /** Query string. Use "*" for match-all. */
  q?: string;
  /** Comma-separated list of fields to search. */
  query_by: string;
  /** Filter expression, e.g. "price:<100 && in_stock:true". */
  filter_by?: string;
  /** Sort expression, e.g. "price:asc". */
  sort_by?: string;
  /** Comma-separated list of facet fields. */
  facet_by?: string;
  /** Page number (1-indexed). */
  page?: number;
  /** Results per page. */
  per_page?: number;
  /** Comma-separated list of fields to highlight. */
  highlight_fields?: string;
  /** Number of highlight snippet tokens. */
  highlight_affix_num_tokens?: number;
  /** Additional search parameters passed through to the API. */
  [key: string]: unknown;
}

/** A single search hit. */
export interface SearchHit<T = Record<string, unknown>> {
  /** The document data. */
  document: T;
  /** Relevance score. */
  text_match: number;
  /** Highlighted field values. */
  highlights?: Array<{
    field: string;
    snippet?: string;
    matched_tokens?: string[];
    snippets?: string[];
  }>;
}

/** Facet count entry. */
export interface FacetCount {
  value: string;
  count: number;
  highlighted?: string;
}

/** Facet counts for a field. */
export interface FacetCounts {
  field_name: string;
  counts: FacetCount[];
  stats?: {
    min?: number;
    max?: number;
    sum?: number;
    avg?: number;
    total_values?: number;
  };
}

/** Response from a search request. */
export interface SearchResponse<T = Record<string, unknown>> {
  /** Total number of matching documents. */
  found: number;
  /** Array of search hits. */
  hits: SearchHit<T>[];
  /** Facet counts (if facet_by was specified). */
  facet_counts?: FacetCounts[];
  /** Current page number. */
  page: number;
  /** Number of results in this page. */
  out_of: number;
  /** Time taken in milliseconds. */
  search_time_ms: number;
}

/** Parameters for a single query in a multi-search request. */
export interface MultiSearchQuery extends SearchParams {
  /** The collection to search. */
  collection: string;
}

/** Response from a multi-search request. */
export interface MultiSearchResponse<T = Record<string, unknown>> {
  results: SearchResponse<T>[];
}

/** Parameters for tracking a click event. */
export interface ClickEventParams {
  /** The original search query. */
  query: string;
  /** The ID of the clicked document. */
  documentId: string;
  /** The position of the clicked result (1-indexed). */
  position: number;
  /** The collection the document belongs to. */
  collection?: string;
}

/** Parameters for tracking a conversion event. */
export interface ConversionEventParams {
  /** The original search query. */
  query: string;
  /** The ID of the converted document. */
  documentId: string;
  /** The collection the document belongs to. */
  collection?: string;
  /** Custom conversion type (e.g. "purchase", "add_to_cart"). */
  type?: string;
}

/** Error response from the Lunexa API. */
export interface ApiErrorResponse {
  error: string;
  status?: number;
}
