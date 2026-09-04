import type { ComparisonRow, ComparisonTotals } from "@/types/comparison";
import type { StoreSlug } from "@/types/store";
import { roundCurrency } from "@/lib/pricing/money";

const storeSlugs: StoreSlug[] = ["ralphs", "vons"];

export function calculateTotals(rows: ComparisonRow[]): ComparisonTotals {
  const singleStore = storeSlugs.reduce(
    (totals, storeSlug) => {
      // A store is only a valid single-store option if it can supply every item
      // in the basket. If it is missing any item, its total is meaningless (a
      // missing item would otherwise count as $0 and make the store look
      // artificially cheap), so we represent it as `null`.
      const suppliesEntireBasket = rows.every(
        (row) => row.storePrices[storeSlug] !== undefined
      );
      totals[storeSlug] = suppliesEntireBasket
        ? roundCurrency(
            rows.reduce((sum, row) => sum + (row.storePrices[storeSlug]?.price ?? 0), 0)
          )
        : null;
      return totals;
    },
    {} as Record<StoreSlug, number | null>
  );

  const splitStore = roundCurrency(
    rows.reduce((sum, row) => sum + (row.storePrices[row.cheapestStoreSlug]?.price ?? 0), 0)
  );

  // Only consider stores that can supply the entire basket (non-null totals).
  const validSingleStoreTotals = Object.values(singleStore).filter(
    (total): total is number => total !== null
  );
  // If no store can supply the whole basket, there is no valid single-store
  // baseline to beat, so best savings defaults to 0.
  const bestSavings =
    validSingleStoreTotals.length === 0
      ? 0
      : roundCurrency(Math.min(...validSingleStoreTotals) - splitStore);

  return {
    singleStore,
    splitStore,
    bestSavings
  };
}
