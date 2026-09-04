import type { StoreInfo, StoreSlug } from "@/types/store";

/**
 * Canonical, human-verifiable metadata for every store we compare.
 *
 * This is the single source of truth for a store's real-world identity: its
 * official brand name (spelled exactly as the retailer spells it), the parent
 * company that operates it, and the links we can open ourselves to confirm the
 * products and prices the adapters return.
 *
 * Facts verified against the retailers' own sites and Wikipedia:
 * - Ralphs (no apostrophe) is a Kroger banner in Southern California.
 * - Vons is an Albertsons banner in Southern California and Southern Nevada.
 */
export const storeCatalog: Record<StoreSlug, StoreInfo> = {
  ralphs: {
    slug: "ralphs",
    // The retailer brands itself "Ralphs" with no apostrophe.
    name: "Ralphs",
    parentCompany: "Kroger",
    region: "Southern California",
    websiteUrl: "https://www.ralphs.com",
    weeklyAdUrl: "https://www.ralphs.com/weeklyad",
    storeLocatorUrl: "https://www.ralphs.com/stores",
    loyaltyProgram: "Ralphs Rewards"
  },
  vons: {
    slug: "vons",
    name: "Vons",
    parentCompany: "Albertsons",
    region: "Southern California & Southern Nevada",
    websiteUrl: "https://www.vons.com",
    weeklyAdUrl: "https://www.vons.com/weeklyad",
    storeLocatorUrl: "https://www.vons.com/stores",
    loyaltyProgram: "Vons for U"
  }
};

export function getStoreInfo(storeSlug: StoreSlug): StoreInfo {
  return storeCatalog[storeSlug];
}

export function getAllStoreInfo(): StoreInfo[] {
  return Object.values(storeCatalog);
}
