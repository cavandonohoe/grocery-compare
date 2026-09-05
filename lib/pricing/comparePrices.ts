import type { ComparisonRow, ComparisonRun } from "@/types/comparison";
import type { StoreProduct, StoreSlug } from "@/types/store";
import { matchProductsWithAi } from "@/lib/ai/matchProducts";
import { getEnabledStoreAdapters } from "@/lib/stores/registry";
import { calculateTotals } from "@/lib/pricing/calculateTotals";
import { evaluateTripSavings } from "@/lib/pricing/evaluateTripSavings";

export type TripOptions = {
  extraMinutes: number;
  extraMiles: number;
  valueOfTimeHourly: number;
  gasCostPerMile: number;
};

export const defaultTripOptions: TripOptions = {
  extraMinutes: 18,
  extraMiles: 5.2,
  valueOfTimeHourly: 20,
  gasCostPerMile: 0.24
};

export async function runComparison(
  rawItems: string[],
  tripOptions: TripOptions = defaultTripOptions
): Promise<ComparisonRun> {
  const adapters = getEnabledStoreAdapters();
  const rows: ComparisonRow[] = [];

  for (const rawItem of rawItems) {
    const normalizedName = normalizeItem(rawItem);
    const candidatesByStore = await Promise.all(
      adapters.map(async (adapter) => adapter.searchProducts(normalizedName, { limit: 3 }))
    );
    const candidates = candidatesByStore.flat();

    if (candidates.length === 0) {
      continue;
    }

    const ranked = await matchProductsWithAi({ item: normalizedName, candidates });
    const storePrices = Object.fromEntries(
      adapters.map((adapter) => [
        adapter.storeSlug,
        ranked.candidates.find((candidate) => candidate.storeSlug === adapter.storeSlug)
      ])
    ) as Partial<Record<StoreSlug, StoreProduct>>;
    const availableProducts = adapters
      .map((adapter) => storePrices[adapter.storeSlug])
      .filter((product): product is StoreProduct => Boolean(product));

    const cheapest = availableProducts.reduce((best, product) =>
      product.price < best.price ? product : best
    );
    const cheapestAdapter = adapters.find((adapter) => adapter.storeSlug === cheapest.storeSlug);

    rows.push({
      rawItem,
      normalizedName,
      storePrices,
      cheapestStoreSlug: cheapest.storeSlug,
      cheapestStoreName: cheapestAdapter?.displayName ?? cheapest.storeSlug,
      matchScore: ranked.raw ? 0.92 : 0.87,
      matchNote: `${cheapest.brand ? `${cheapest.brand}, ` : ""}${cheapest.size ?? "standard size"}`
    });
  }

  const totals = calculateTotals(rows);
  const tripEvaluation = evaluateTripSavings({
    grossSavings: totals.bestSavings,
    ...tripOptions
  });

  return {
    rows,
    totals,
    tripEvaluation
  };
}

function normalizeItem(rawItem: string) {
  return rawItem.trim().toLowerCase();
}
