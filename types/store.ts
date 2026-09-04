export type StoreSlug = "ralphs" | "vons";

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
