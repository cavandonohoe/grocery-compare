/**
 * Refresh Vons API credentials from a REAL, trusted Chrome session over CDP,
 * and optionally print live prices.
 *
 * Why CDP instead of a launched headless browser: Vons's `pdpdata` API is
 * behind Imperva/Incapsula bot protection that scores freshly-automated
 * browser sessions as bots and refuses the pricing endpoint (even the site's
 * own request 403s under automation). Cookies minted by a launched browser are
 * therefore not trusted enough. Attaching over CDP to a Chrome you already use
 * like a human inherits that session's trust score, so `pdpdata` succeeds.
 *
 * IMPORTANT: this does NOT work on a managed/corporate machine where browser
 * policy disables remote debugging (no DevToolsActivePort is written). Use a
 * personal/unmanaged machine. See docs/vons-cdp-refresh.md.
 *
 * Prerequisites (one time):
 *   1. Quit Chrome, then launch it with remote debugging + a dedicated profile:
 *        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *          --remote-debugging-port=9222 \
 *          --user-data-dir="$HOME/.vons-chrome"
 *   2. In that Chrome, open vons.com, set your store, and browse a little so
 *      the session is trust-scored (sign in for member prices if desired).
 *
 * Then (repeatable):
 *   pnpm vons:refresh                       # write VONS_* to .env.local
 *   pnpm vons:refresh --price 970463282     # also print a live price
 *   pnpm vons:refresh --port 9222 --json    # machine-readable
 *
 * Requires the optional `playwright` dependency:
 *   pnpm add -D playwright && pnpm exec playwright install chromium
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PDP_ENDPOINT = "/abs/pub/xapi/product/v2/pdpdata";
const DEFAULT_SUBSCRIPTION_KEY = "6c21edb7bcda4f0e918348db16147431";
const ENV_FILE = path.join(process.cwd(), ".env.local");

type Args = {
  port: number;
  price: string[];
  json: boolean;
  noWrite: boolean;
  subscriptionKey: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    port: 9222,
    price: [],
    json: false,
    noWrite: false,
    subscriptionKey: process.env.VONS_SUBSCRIPTION_KEY?.trim() || DEFAULT_SUBSCRIPTION_KEY
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port") {
      args.port = Number(argv[++i]);
    } else if (arg === "--price") {
      args.price.push(argv[++i]);
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--no-write") {
      args.noWrite = true;
    }
  }
  return args;
}

type PriceResult = {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  basePrice?: unknown;
  pricePer?: unknown;
  unit?: unknown;
  storeId?: unknown;
  promo?: unknown;
  promoEnd?: unknown;
  error?: string;
};

/** Upsert VONS_* keys into .env.local without clobbering other entries. */
async function upsertEnv(updates: Record<string, string>): Promise<void> {
  let existing = "";
  try {
    existing = await readFile(ENV_FILE, "utf8");
  } catch {
    existing = "";
  }
  const lines = existing.length ? existing.split("\n") : [];
  const seen = new Set<string>();
  const next = lines.map((line) => {
    const key = line.split("=")[0]?.trim();
    if (key && key in updates) {
      seen.add(key);
      return `${key}="${updates[key]}"`;
    }
    return line;
  });
  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) {
      next.push(`${key}="${value}"`);
    }
  }
  const out = next.join("\n").replace(/\n{3,}/g, "\n\n");
  await writeFile(ENV_FILE, out.endsWith("\n") ? out : `${out}\n`, "utf8");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Import Playwright lazily so the core app doesn't require it.
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "This script needs Playwright. Install it:\n" +
        "  pnpm add -D playwright && pnpm exec playwright install chromium"
    );
    process.exit(1);
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://localhost:${args.port}`);
  } catch {
    console.error(
      `Could not connect to Chrome on CDP port ${args.port}.\n` +
        "Launch Chrome with remote debugging first (see docs/vons-cdp-refresh.md):\n" +
        '  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\\n' +
        `    --remote-debugging-port=${args.port} --user-data-dir="$HOME/.vons-chrome"\n` +
        "On a managed/corporate machine this port is often policy-disabled; use a personal machine."
    );
    process.exit(1);
  }

  try {
    const contexts = browser.contexts();
    const ctx = contexts[0];
    if (!ctx) {
      throw new Error("No browser context found over CDP.");
    }

    // Find a Vons tab, or open one so cookies exist for the domain.
    const pages = ctx.pages();
    let page = pages.find((p) => p.url().includes("vons.com"));
    if (!page) {
      page = await ctx.newPage();
      await page.goto("https://www.vons.com/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
    }

    const cookies = await ctx.cookies("https://www.vons.com");
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const storeMatch = cookieHeader.match(/%22storeId%22%3A%22(\d+)%22/);
    const storeId = storeMatch ? storeMatch[1] : process.env.VONS_STORE_ID || "2002";

    // Fetch prices from inside the trusted page context.
    const prices: PriceResult[] = [];
    for (const bpn of args.price) {
      const result = (await page.evaluate(
        async ({ bpn, storeId, endpoint, key }) => {
          const params = new URLSearchParams({
            bpn,
            banner: "vons",
            storeId,
            bannerId: "2",
            includeProductRating: "true",
            realTimeReviewRating: "true",
            guest: "true",
            includeOffer: "true",
            pgm: "abs"
          });
          const r = await fetch(`${endpoint}?${params.toString()}`, {
            headers: { "ocp-apim-subscription-key": key, platform: "web" }
          });
          if (!r.ok) {
            return { id: bpn, error: `HTTP ${r.status}` };
          }
          const j = (await r.json()) as {
            catalog?: { response?: { docs?: Record<string, unknown>[] } };
          };
          const doc = j?.catalog?.response?.docs?.[0];
          if (!doc) {
            return { id: bpn, error: "not found" };
          }
          return {
            id: doc.pid,
            name: doc.name,
            price: doc.price,
            basePrice: doc.basePrice,
            pricePer: doc.pricePer,
            unit: doc.unitOfMeasure,
            storeId: doc.storeId,
            promo: doc.promoDescription,
            promoEnd: doc.promoEndDate
          };
        },
        { bpn, storeId, endpoint: PDP_ENDPOINT, key: args.subscriptionKey }
      )) as PriceResult;
      prices.push(result);
    }

    if (!args.noWrite) {
      await upsertEnv({ VONS_COOKIES: cookieHeader, VONS_STORE_ID: storeId });
    }

    if (args.json) {
      console.log(JSON.stringify({ storeId, cookies: cookieHeader, prices }, null, 2));
    } else {
      console.log(`# Vons credentials refreshed from trusted Chrome (store ${storeId})`);
      if (!args.noWrite) {
        console.log(`Wrote VONS_COOKIES and VONS_STORE_ID to ${ENV_FILE}`);
      }
      for (const p of prices) {
        if (p.error) {
          console.log(`\n${p.id}: ${p.error}`);
          continue;
        }
        const price = p.price as number;
        const base = p.basePrice as number;
        const savings =
          typeof price === "number" && typeof base === "number" && base > price
            ? `  (reg $${base.toFixed(2)}, save $${(base - price).toFixed(2)})`
            : "";
        console.log(`\n${p.name}  [${p.id}]`);
        console.log(`  $${price.toFixed(2)}${savings}  $${p.pricePer}/${String(p.unit).toLowerCase()}`);
        if (p.promoEnd) {
          console.log(`  deal ends ${String(p.promoEnd).slice(0, 10)}`);
        }
      }
    }
  } finally {
    // Detach only; never close the user's real browser.
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
