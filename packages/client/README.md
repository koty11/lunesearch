# @lunesearch/client

Lightweight search client for [Lunexa](https://ailunexa.com). Works in browser, Node.js 18+, and edge runtimes (Cloudflare Workers, Vercel Edge).

- Zero dependencies (native `fetch`)
- TypeScript-first with full type definitions
- Built-in request caching and deduplication
- < 5KB gzipped

## Installation

```bash
npm install @lunesearch/client
# or
pnpm add @lunesearch/client
# or
yarn add @lunesearch/client
```

## Usage

```ts
import { LuneSearchClient } from "@lunesearch/client";

const client = new LuneSearchClient({
  apiKey: "your-search-api-key",
  host: "https://api.ailunexa.com",
  orgSlug: "your-org",
  projectSlug: "your-project",
});

// Search a collection
const results = await client.search("products", {
  q: "running shoes",
  query_by: "name,description",
  filter_by: "price:<100",
  facet_by: "brand,category",
});

// Multi-collection search
const multi = await client.multiSearch([
  { collection: "products", q: "shoes", query_by: "name" },
  { collection: "articles", q: "shoes", query_by: "title" },
]);

// Get a single document
const doc = await client.getDocument("products", "doc-123");

// Track click events (for relevance feedback)
client.trackClick({
  query: "shoes",
  documentId: "doc-123",
  position: 1,
});
```

## Configuration

```ts
const client = new LuneSearchClient({
  apiKey: "your-search-api-key",   // Required: search-only API key
  host: "https://api.ailunexa.com", // Required: Lunexa API host
  orgSlug: "your-org",              // Required: organization slug
  projectSlug: "your-project",      // Required: project slug
  cacheTTL: 5000,                   // Optional: cache TTL in ms (default: 5000)
});
```

## License

MIT
