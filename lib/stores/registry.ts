import type { StoreAdapter } from "@/lib/stores/types";
import type { StoreSlug } from "@/types/store";
import { ralphsAdapter } from "@/lib/stores/adapters/ralphs";
import { vonsAdapter } from "@/lib/stores/adapters/vons";

const adapters: Record<StoreSlug, StoreAdapter> = {
  ralphs: ralphsAdapter,
  vons: vonsAdapter
};

export function getEnabledStoreAdapters() {
  return Object.values(adapters);
}

export function getStoreAdapter(storeSlug: StoreSlug) {
  return adapters[storeSlug];
}
