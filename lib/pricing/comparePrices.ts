import type { ComparisonRow, ComparisonRun } from "@/types/comparison";
import type { StoreProduct, StoreSlug } from "@/types/store";
import { getEnabledStoreAdapters } from "@/lib/stores/registry";
import { calculateTotals } from "@/lib/pricing/calculateTotals";
import { evaluateTripSavings } from "@/lib/pricing/evaluateTripSavings";

export async function runComparison(rawItems: string[]): Promise<ComparisonRun> {
  const adapters = getEnabledStoreAdapters();
  const rows: ComparisonRow[] = [];

  for (const rawItem of rawItems) {
    const normalizedName = normalizeItem(rawItem);
    const storePrices = Object.fromEntries(
      await Promise.all(
        adapters.map(async (adapter) => {
          const [match] = await adapter.searchProducts(normalizedName, { limit: 1 });
          return [adapter.storeSlug, match];
        })
      )
    ) as Partial<Record<StoreSlug, StoreProduct>>;
    const availableProducts = adapters
      .map((adapter) => storePrices[adapter.storeSlug])
      .filter((product): product is StoreProduct => Boolean(product));

    if (availableProducts.length === 0) {
      continue;
    }

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
      matchScore: 0.87,
      matchNote: `${cheapest.brand ? `${cheapest.brand}, ` : ""}${cheapest.size ?? "standard size"}`
    });
  }

  const totals = calculateTotals(rows);
  const tripEvaluation = evaluateTripSavings({
    grossSavings: totals.bestSavings,
    extraMinutes: 18,
    extraMiles: 5.2,
    valueOfTimeHourly: 20,
    gasCostPerMile: 0.24
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
