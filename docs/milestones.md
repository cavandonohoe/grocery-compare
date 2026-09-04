# Milestones

## 1. Repo and Mobile UI

- Next.js app shell
- Grocery list editor
- Mock comparison table
- Summary totals
- Trip-worth-it card

## 2. Grocery List Persistence

- Add Postgres migrations
- Implement list CRUD endpoints
- Persist parsed grocery items

## 3. Store Adapter Layer

- Keep mock adapters as test fixtures
- Add external API or scraping-backed adapters only after data source review
- Normalize all store products into the shared `StoreProduct` shape

## 4. AI Matching

- Parse raw list text into structured grocery items
- Rank equivalent products across stores
- Store match scores and reasoning

## 5. Price Tracking

- Append observations to `product_prices`
- Add product price history views
- Alert when frequent items drop below historical average
