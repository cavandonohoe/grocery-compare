import type { StoreProduct, StoreSearchOptions, StoreSlug } from "@/types/store";

export interface StoreAdapter {
  storeSlug: StoreSlug;
  displayName: string;
  searchProducts(query: string, options?: StoreSearchOptions): Promise<StoreProduct[]>;
  getProductPrice(externalId: string): Promise<StoreProduct | null>;
}
