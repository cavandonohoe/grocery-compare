import type { StoreAdapter } from "@/lib/stores/types";
import type { StoreProduct, StoreSlug } from "@/types/store";
import { mockProducts } from "@/lib/stores/adapters/mockData";
import { getStoreInfo } from "@/lib/stores/storeCatalog";

export function createMockAdapter(storeSlug: StoreSlug): StoreAdapter {
  const products = mockProducts.filter((product) => product.storeSlug === storeSlug);
  const info = getStoreInfo(storeSlug);

  return {
    storeSlug,
    displayName: info.name,
    info,
    async searchProducts(query, options) {
      const normalizedQuery = normalize(query);
      return products
        .map((product) => ({ product, score: scoreProduct(product, normalizedQuery) }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, options?.limit)
        .map((candidate) => candidate.product);
    },
    async getProductPrice(externalId) {
      return products.find((product) => product.externalId === externalId) ?? null;
    }
  };
}

function scoreProduct(product: StoreProduct, normalizedQuery: string) {
  const haystack = normalize([product.name, product.brand, product.category].filter(Boolean).join(" "));
  const terms = normalizedQuery.split(" ").filter(Boolean);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
