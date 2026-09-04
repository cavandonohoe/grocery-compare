import { describe, expect, it } from "vitest";
import type { ComparisonRow } from "@/types/comparison";
import type { StoreProduct, StoreSlug } from "@/types/store";
import { calculateTotals } from "@/lib/pricing/calculateTotals";

function product(storeSlug: StoreSlug, price: number): StoreProduct {
  return {
    externalId: `${storeSlug}-${price}`,
    storeSlug,
    name: `${storeSlug} product`,
    price
  };
}

function row(
  rawItem: string,
  storePrices: Partial<Record<StoreSlug, StoreProduct>>
): ComparisonRow {
  const entries = Object.values(storePrices).filter(
    (value): value is StoreProduct => Boolean(value)
  );
  const cheapest = entries.reduce((best, current) =>
    current.price < best.price ? current : best
  );

  return {
    rawItem,
    normalizedName: rawItem.toLowerCase(),
    storePrices,
    cheapestStoreSlug: cheapest.storeSlug,
    cheapestStoreName: cheapest.storeSlug,
    matchScore: 0.9,
    matchNote: "test"
  };
}

describe("calculateTotals", () => {
  it("returns zeros for an empty basket", () => {
    const totals = calculateTotals([]);

    expect(totals.singleStore).toEqual({ ralphs: 0, vons: 0 });
    expect(totals.splitStore).toBe(0);
    expect(totals.bestSavings).toBe(0);
  });

  it("computes single-store, split, and savings when both stores stock everything", () => {
    const rows = [
      row("milk", { ralphs: product("ralphs", 3), vons: product("vons", 4) }),
      row("eggs", { ralphs: product("ralphs", 5), vons: product("vons", 2) })
    ];

    const totals = calculateTotals(rows);

    expect(totals.singleStore).toEqual({ ralphs: 8, vons: 6 });
    // split takes the cheapest per row: 3 (ralphs milk) + 2 (vons eggs) = 5
    expect(totals.splitStore).toBe(5);
    // best single store is vons at 6, savings vs split = 6 - 5 = 1
    expect(totals.bestSavings).toBe(1);
  });

  it("marks a store missing an item as null and excludes it from best savings", () => {
    const rows = [
      row("milk", { ralphs: product("ralphs", 3), vons: product("vons", 4) }),
      // vons does not stock eggs
      row("eggs", { ralphs: product("ralphs", 5) })
    ];

    const totals = calculateTotals(rows);

    // vons is missing an item, so it is not a valid single-store option
    expect(totals.singleStore.vons).toBeNull();
    expect(totals.singleStore.ralphs).toBe(8);
    // split: 3 (ralphs milk) + 5 (ralphs eggs) = 8; only ralphs is valid
    expect(totals.splitStore).toBe(8);
    // best single store is ralphs (8) vs split (8) => 0 savings
    expect(totals.bestSavings).toBe(0);
  });

  it("computes best savings against the only store that supplies everything", () => {
    const rows = [
      // vons missing this item
      row("milk", { ralphs: product("ralphs", 3) }),
      row("eggs", { ralphs: product("ralphs", 5), vons: product("vons", 1) })
    ];

    const totals = calculateTotals(rows);

    expect(totals.singleStore.vons).toBeNull();
    expect(totals.singleStore.ralphs).toBe(8);
    // split: 3 (ralphs milk) + 1 (vons eggs) = 4
    expect(totals.splitStore).toBe(4);
    // only ralphs is valid: 8 - 4 = 4
    expect(totals.bestSavings).toBe(4);
  });

  it("returns bestSavings 0 when no store can supply the whole basket", () => {
    const rows = [
      // only ralphs stocks milk
      row("milk", { ralphs: product("ralphs", 3) }),
      // only vons stocks eggs
      row("eggs", { vons: product("vons", 2) })
    ];

    const totals = calculateTotals(rows);

    expect(totals.singleStore.ralphs).toBeNull();
    expect(totals.singleStore.vons).toBeNull();
    // split still uses the cheapest available product per row: 3 + 2 = 5
    expect(totals.splitStore).toBe(5);
    // no valid single-store baseline => savings defaults to 0
    expect(totals.bestSavings).toBe(0);
  });
});
