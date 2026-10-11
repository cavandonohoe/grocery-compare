import type { StoreAdapter } from "@/lib/stores/types";
import type { StoreProduct } from "@/types/store";
import { createMockAdapter } from "@/lib/stores/adapters/createMockAdapter";
import { getStoreInfo } from "@/lib/stores/storeCatalog";
import {
  VonsBotBlockError,
  VonsCredentialsError,
  fetchVonsProduct,
  getVonsApiConfig,
  type VonsApiConfig
} from "@/lib/stores/adapters/vonsApi";

/**
 * Real Vons adapter.
 *
 * `getProductPrice` calls the live Vons `pdpdata` API when credentials are
 * configured (see `vonsApi.ts`). We do not have a captured public search
 * endpoint, so `searchProducts` delegates to the shared mock data, keeping the
 * end-to-end comparison flow working. When API credentials are missing, price
 * lookups fall back to mock data too, so the app still boots without secrets.
 */
export function createVonsAdapter(
  fetchImpl: typeof fetch = fetch
): StoreAdapter {
  const info = getStoreInfo("vons");
  const mock = createMockAdapter("vons");

  let config: VonsApiConfig | null = null;
  let configError = false;
  const getConfig = (): VonsApiConfig | null => {
    if (config) {
      return config;
    }
    if (configError) {
      return null;
    }
    try {
      config = getVonsApiConfig();
      return config;
    } catch (error) {
      if (error instanceof VonsCredentialsError) {
        configError = true;
        return null;
      }
      throw error;
    }
  };

  return {
    storeSlug: "vons",
    displayName: info.name,
    info,
    searchProducts(query, options) {
      // No captured public search endpoint yet; use shared mock data so the
      // comparison flow still works end to end.
      return mock.searchProducts(query, options);
    },
    async getProductPrice(externalId): Promise<StoreProduct | null> {
      const cfg = getConfig();
      if (!cfg) {
        return mock.getProductPrice(externalId);
      }
      try {
        return await fetchVonsProduct(externalId, cfg, fetchImpl);
      } catch (error) {
        if (error instanceof VonsBotBlockError) {
          // Cookies expired. Surface a clear, actionable message.
          console.warn(
            `[vons] ${error.message}. Falling back to mock price for ${externalId}.`
          );
          return mock.getProductPrice(externalId);
        }
        throw error;
      }
    }
  };
}

export const vonsAdapter = createVonsAdapter();
