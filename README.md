# LuneSearch

Official JavaScript/TypeScript SDK for [Lunexa](https://ailunexa.com) — search-as-a-service.

## Packages

| Package | Description | Status |
|---|---|---|
| [`@lunesearch/client`](./packages/client) | Lightweight search client for browser, Node.js, and edge runtimes | In development |
| `@lunesearch/react` | React components and hooks for building search UIs | Planned |
| `@lunesearch/autocomplete` | Standalone autocomplete/typeahead widget | Planned |

## Quick Start

```bash
npm install @lunesearch/client
```

```ts
import { LuneSearchClient } from "@lunesearch/client";

const client = new LuneSearchClient({
  apiKey: "your-search-api-key",
  host: "https://api.ailunexa.com",
  orgSlug: "your-org",
  projectSlug: "your-project",
});

const results = await client.search("products", {
  q: "running shoes",
  query_by: "name,description",
});

console.log(results.hits);
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## License

MIT
