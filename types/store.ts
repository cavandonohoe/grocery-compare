export type StoreSlug = "ralphs" | "vons";

/**
 * Real-world, verifiable metadata for a store banner. `websiteUrl` and
 * `weeklyAdUrl` let us open the retailer ourselves to confirm the products and
 * prices our adapters return.
 */
export type StoreInfo = {
  slug: StoreSlug;
  name: string;
  parentCompany: string;
  region: string;
  websiteUrl: string;
  weeklyAdUrl: string;
  storeLocatorUrl: string;
  loyaltyProgram: string;
};

export type Store = {
  id: string;
  name: string;
  slug: StoreSlug;
  isActive: boolean;
};

export type StoreSearchOptions = {
  limit?: number;
  locationId?: string;
};

export type StoreProduct = {
  externalId: string;
  storeSlug: StoreSlug;
  name: string;
  brand?: string;
  size?: string;
  category?: string;
  imageUrl?: string;
  productUrl?: string;
  price: number;
  unitPrice?: number;
};
