# Grocery Compare

Mobile-first grocery price comparison for building a list, matching equivalent products across stores, and deciding whether splitting a trip is worth it.

## Stack

- Next.js
- React
- TypeScript
- Node route handlers
- Postgres-ready data model
- OpenAI API integration point for product matching

## First Milestone

This repo starts with mock Ralph's and Vons adapters so the comparison flow can be built and tested before real store data sources are finalized.

```bash
npm install
npm run dev
```

## Environment

Create `.env.local` when backend integrations are added:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/grocery_compare"
OPENAI_API_KEY="sk-..."
```

## Architecture Notes

Store integrations are isolated behind a shared adapter contract in `lib/stores/types.ts`. Adding another store should be a new adapter file plus one registry entry.

Price observations should be appended to `product_prices` over time, not overwritten, so price tracking can be added without changing the comparison flow.
