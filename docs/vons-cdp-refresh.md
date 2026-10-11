# Refreshing Vons credentials on a personal machine (CDP)

The Vons `pdpdata` price API is behind Imperva/Incapsula bot protection.
Freshly-automated browser sessions are scored as bots and get a `403` on the
price endpoint, so a launched headless browser cannot fetch prices. The
reliable way to refresh credentials is to attach over the Chrome DevTools
Protocol (CDP) to a Chrome you already use like a human: that session is
trust-scored, so `pdpdata` succeeds.

> This does **not** work on a managed/corporate machine, where browser policy
> disables remote debugging (Chrome starts but never writes a
> `DevToolsActivePort`, so nothing listens on the port). Use a personal /
> unmanaged machine.

## One-time setup

1. Install the optional Playwright dependency and its browser:

   ```bash
   pnpm add -D playwright
   pnpm exec playwright install chromium
   ```

2. Fully quit Chrome, then launch it with remote debugging and a dedicated
   profile (so it does not disturb your normal profile):

   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --remote-debugging-port=9222 \
     --user-data-dir="$HOME/.vons-chrome"
   ```

   Confirm the port is live (should print a Chrome version):

   ```bash
   curl -s http://localhost:9222/json/version | python3 -m json.tool
   ```

3. In that Chrome window, go to [vons.com](https://www.vons.com), set your
   store (ZIP), and browse a little. Sign in if you want member prices. This
   builds the human trust score the price endpoint checks.

## Refresh (repeatable)

With that Chrome still running:

```bash
# Write fresh VONS_COOKIES + VONS_STORE_ID into .env.local
pnpm vons:refresh

# Also print one or more live prices (product id = number at end of the URL)
pnpm vons:refresh --price 970463282 --price 960071217

# Machine-readable output; do not write .env.local
pnpm vons:refresh --json --no-write
```

The script:

- attaches to the running Chrome over CDP (never launches or closes your
  browser),
- reads the Vons cookies and resolves the store id from the session,
- fetches any requested prices from inside the trusted page context, and
- upserts `VONS_COOKIES` / `VONS_STORE_ID` into `.env.local` (other keys are
  left untouched).

The Incapsula cookies rotate (roughly daily). When the app starts returning
`403` for Vons prices, re-run `pnpm vons:refresh` (the Chrome from setup can
stay open and reused).

## How this relates to the adapter

`lib/stores/adapters/vons.ts` reads `VONS_COOKIES` / `VONS_STORE_ID` /
`VONS_SUBSCRIPTION_KEY` from the environment and falls back to mock data when
they are missing or a `403` occurs. This script is just the convenient,
trusted way to keep those values fresh.
