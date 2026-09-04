import { describe, expect, it } from "vitest";
import { calculateTotals } from "@/lib/pricing/calculateTotals";
import type { ComparisonRow } from "@/types/comparison";
import type { StoreProduct, StoreSlug } from "@/types/store";

function product(storeSlug: StoreSlug, price: number): StoreProduct {
  return {
    externalId: `${storeSlug}-${price}`,
    storeSlug,
    name: "test product",
    price,
    unitPrice: price
  };
}

function row(overrides: Partial<ComparisonRow> & Pick<ComparisonRow, "storePrices">): ComparisonRow {
  const cheapestStoreSlug = overrides.cheapestStoreSlug ?? "ralphs";
  return {
    rawItem: "item",
    normalizedName: "item",
    cheapestStoreSlug,
    cheapestStoreName: cheapestStoreSlug,
    matchScore: 1,
    matchNote: "",
    ...overrides
  };
}

describe("calculateTotals", () => {
  it("sums per-store totals and computes split + savings", () => {
    const rows: ComparisonRow[] = [
      row({
        storePrices: { ralphs: product("ralphs", 4), vons: product("vons", 5) },
        cheapestStoreSlug: "ralphs"
      }),
      row({
        storePrices: { ralphs: product("ralphs", 3), vons: product("vons", 2) },
        cheapestStoreSlug: "vons"
      })
    ];

    const totals = calculateTotals(rows);

    expect(totals.singleStore.ralphs).toBe(7);
    expect(totals.singleStore.vons).toBe(7);
    // split takes cheapest of each row: 4 (ralphs) + 2 (vons) = 6
    expect(totals.splitStore).toBe(6);
    // best single store is 7, split is 6, savings = 1
    expect(totals.bestSavings).toBe(1);
  });

  it("treats a missing store product as zero in that store's total", () => {
    const rows: ComparisonRow[] = [
      row({
        storePrices: { ralphs: product("ralphs", 4) },
        cheapestStoreSlug: "ralphs"
      })
    ];

    const totals = calculateTotals(rows);
    expect(totals.singleStore.ralphs).toBe(4);
    expect(totals.singleStore.vons).toBe(0);
  });

  it("returns zero totals for an empty basket", () => {
    const totals = calculateTotals([]);
    expect(totals.singleStore.ralphs).toBe(0);
    expect(totals.singleStore.vons).toBe(0);
    expect(totals.splitStore).toBe(0);
    expect(totals.bestSavings).toBe(0);
  });
});
