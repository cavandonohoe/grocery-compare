# Grocery Compare

Mobile-first grocery price comparison. Build a shopping list, match equivalent
products across stores, compare totals, and decide whether splitting a trip
between stores is actually worth it once you account for extra time, distance,
and gas.

## Stack

- Next.js (App Router)
- React
- TypeScript
- Node route handlers under `app/api/`
- Postgres-ready data model (via `pg`)
- Optional OpenAI integration for product matching

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open the app at the URL printed by Next.js (defaults to
`http://localhost:3000`).

### Environment

Copy the example env file and fill in values as needed:

```bash
cp .env.example .env.local
```

The app runs out of the box without any environment variables because it
ships with mock store data (see Architecture). Environment variables are only
needed when you wire up real integrations:

- `DATABASE_URL` (required for database access) Postgres connection string.
  The app throws if it is missing at the point the database is queried.
- `OPENAI_API_KEY` (optional) enables OpenAI-based product matching. When
  unset, matching falls back to term-overlap matching.
- `OPENAI_MATCH_MODEL` (optional) model used for matching. Defaults to
  `gpt-5-mini`. Only used when `OPENAI_API_KEY` is set.

## Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `next dev` | Start the development server. |
| `npm run build` | `next build` | Build the production bundle. |
| `npm run start` | `next start` | Serve the production build. |
| `npm run lint` | `eslint .` | Lint the codebase. |
| `npm run typecheck` | `tsc --noEmit` | Type-check without emitting output. |
| `npm test` | `vitest run` | Run the test suite once. |
| `npm run test:watch` | `vitest` | Run tests in watch mode. |

## Testing

Tests use [vitest](https://vitest.dev/). Run the full suite with:

```bash
npm test
```

Use `npm run test:watch` for an interactive watch mode during development.

Tests require Node.js >= 20 (vitest 4 runs on rolldown, which does not
support Node 18).

## Architecture Notes

### Store adapters

Store integrations are isolated behind a shared adapter contract in
`lib/stores/types.ts` and wired up through the registry in
`lib/stores/registry.ts`. Adding another store is a new adapter file plus one
registry entry, with no changes to the comparison flow.

The app currently ships with mock Ralph's and Vons adapters
(`lib/stores/adapters/ralphs.ts`, `lib/stores/adapters/vons.ts`) built on top
of shared seed data (`lib/stores/adapters/mockData.ts`). This lets the full
comparison flow work end to end without real store data sources.

### Pricing

Pricing logic lives in `lib/pricing/`:

- `comparePrices.ts` runs a comparison across the enabled stores for a list.
- `calculateTotals.ts` sums per-store totals.
- `evaluateTripSavings.ts` decides whether splitting a trip is worth it after
  accounting for extra time, distance, and gas.
- `money.ts` money helpers.

### Product matching

`lib/ai/matchProducts.ts` matches list items to store products. When
`OPENAI_API_KEY` is set it uses OpenAI (model from `OPENAI_MATCH_MODEL`,
default `gpt-5-mini`); otherwise it falls back to term-overlap matching so the
app works without any API key.

### API routes

- `POST /api/compare` accepts a grocery list (and optional trip options) and
  returns a comparison. See `app/api/compare/route.ts`.
- `GET /api/stores` returns the enabled stores. See
  `app/api/stores/route.ts`.

### Data model

Price observations are appended to `product_prices` over time rather than
overwritten, so historical price tracking can be added later without changing
the comparison flow.
