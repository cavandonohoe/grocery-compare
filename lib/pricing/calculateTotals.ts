import type { ComparisonRow, ComparisonTotals } from "@/types/comparison";
import type { StoreSlug } from "@/types/store";
import { roundCurrency } from "@/lib/pricing/money";

const storeSlugs: StoreSlug[] = ["ralphs", "vons"];

export function calculateTotals(rows: ComparisonRow[]): ComparisonTotals {
  const singleStore = storeSlugs.reduce(
    (totals, storeSlug) => {
      totals[storeSlug] = roundCurrency(
        rows.reduce((sum, row) => sum + (row.storePrices[storeSlug]?.price ?? 0), 0)
      );
      return totals;
    },
    {} as Record<StoreSlug, number>
  );

  const splitStore = roundCurrency(
    rows.reduce((sum, row) => sum + (row.storePrices[row.cheapestStoreSlug]?.price ?? 0), 0)
  );
  const bestSingleStore = Math.min(...Object.values(singleStore));
  const bestSavings = roundCurrency(bestSingleStore - splitStore);

  return {
    singleStore,
    splitStore,
    bestSavings
  };
}
