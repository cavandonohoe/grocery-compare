import type { StoreProduct, StoreInfo, StoreSearchOptions, StoreSlug } from "@/types/store";

export interface StoreAdapter {
  storeSlug: StoreSlug;
  displayName: string;
  info: StoreInfo;
  searchProducts(query: string, options?: StoreSearchOptions): Promise<StoreProduct[]>;
  getProductPrice(externalId: string): Promise<StoreProduct | null>;
}
