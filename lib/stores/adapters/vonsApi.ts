import type { StoreProduct } from "@/types/store";

/**
 * Low-level client for the Vons/Albertsons product detail API (`pdpdata`).
 *
 * Vons renders prices client-side and gates this endpoint behind Imperva
 * (Incapsula) bot protection, so a plain server-side request without the
 * browser's anti-bot cookies is rejected with a 403. We replay the captured
 * cookies plus the public API subscription key.
 *
 * Credentials are read from the environment because the Incapsula cookies
 * rotate (roughly daily) and must be refreshed by re-capturing them from a
 * logged-in browser session:
 *
 * - `VONS_SUBSCRIPTION_KEY` the `ocp-apim-subscription-key` header value.
 * - `VONS_COOKIES` the full `Cookie` header (at minimum the Incapsula
 *   cookies `visid_incap_*`, `incap_ses_*`, `reese84` and the store session
 *   cookie).
 * - `VONS_STORE_ID` the numeric store id a ZIP resolves to (e.g. `2002`).
 */

const PDP_ENDPOINT = "https://www.vons.com/abs/pub/xapi/product/v2/pdpdata";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";

export type VonsApiConfig = {
  storeId: string;
  subscriptionKey: string;
  cookies: string;
  userAgent: string;
};

export class VonsCredentialsError extends Error {}

export class VonsBotBlockError extends Error {
  constructor(message = "Vons API returned 403 (bot block); refresh VONS_COOKIES") {
    super(message);
    this.name = "VonsBotBlockError";
  }
}

/**
 * Read Vons API config from the environment. Throws {@link VonsCredentialsError}
 * when the required secrets are missing so callers can degrade gracefully.
 */
export function getVonsApiConfig(
  env: Record<string, string | undefined> = process.env
): VonsApiConfig {
  const subscriptionKey = env.VONS_SUBSCRIPTION_KEY?.trim();
  const cookies = env.VONS_COOKIES?.trim();
  const storeId = env.VONS_STORE_ID?.trim() || "2002";

  if (!subscriptionKey || !cookies) {
    throw new VonsCredentialsError(
      "Missing Vons API credentials. Set VONS_SUBSCRIPTION_KEY and VONS_COOKIES."
    );
  }

  return {
    storeId,
    subscriptionKey,
    cookies,
    userAgent: env.VONS_USER_AGENT?.trim() || DEFAULT_USER_AGENT
  };
}

export function buildPdpUrl(bpn: string, storeId: string): string {
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
  return `${PDP_ENDPOINT}?${params.toString()}`;
}

/** Minimal shape of the fields we consume from the `pdpdata` response. */
export type VonsPdpDoc = {
  pid?: string;
  name?: string;
  price?: number;
  basePrice?: number;
  pricePer?: number;
  basePricePer?: number;
  unitOfMeasure?: string;
  itemSizeQty?: string;
  promoDescription?: string;
  promoEndDate?: string;
  imageUrl?: string;
};

export type VonsPdpResponse = {
  catalog?: {
    response?: {
      docs?: VonsPdpDoc[];
    };
  };
};

/** Map a raw pdp doc into the shared {@link StoreProduct} shape. */
export function docToStoreProduct(doc: VonsPdpDoc): StoreProduct {
  const unit = doc.unitOfMeasure ? doc.unitOfMeasure.toLowerCase() : undefined;
  const size = doc.itemSizeQty && unit ? `${doc.itemSizeQty} ${unit}` : undefined;
  return {
    externalId: String(doc.pid ?? ""),
    storeSlug: "vons",
    name: doc.name ?? "",
    size,
    price: typeof doc.price === "number" ? doc.price : NaN,
    unitPrice: typeof doc.pricePer === "number" ? doc.pricePer : undefined,
    imageUrl: doc.imageUrl,
    productUrl: doc.pid ? `https://www.vons.com/shop/pd/x/${doc.pid}` : undefined
  };
}

/**
 * Fetch a single product's live pricing by its Vons product id (`bpn`).
 * Returns `null` when the product is not found. Throws
 * {@link VonsBotBlockError} on a 403 so callers can prompt a cookie refresh.
 */
export async function fetchVonsProduct(
  bpn: string,
  config: VonsApiConfig,
  fetchImpl: typeof fetch = fetch
): Promise<StoreProduct | null> {
  const res = await fetchImpl(buildPdpUrl(bpn, config.storeId), {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "ocp-apim-subscription-key": config.subscriptionKey,
      platform: "web",
      referer: `https://www.vons.com/shop/pd/x/${bpn}`,
      "user-agent": config.userAgent,
      cookie: config.cookies
    }
  });

  if (res.status === 403) {
    throw new VonsBotBlockError();
  }
  if (!res.ok) {
    throw new Error(`Vons API returned HTTP ${res.status} for product ${bpn}`);
  }

  const data = (await res.json()) as VonsPdpResponse;
  const doc = data.catalog?.response?.docs?.[0];
  // Treat a missing product, or one without a usable numeric price, as
  // "not found" so the caller can fall back to mock data rather than
  // propagate a NaN price into the comparison math.
  if (!doc || !doc.pid || typeof doc.price !== "number" || !Number.isFinite(doc.price)) {
    return null;
  }
  return docToStoreProduct(doc);
}
