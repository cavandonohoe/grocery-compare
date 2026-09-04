import { describe, expect, it } from "vitest";
import { defaultTripOptions, runComparison } from "@/lib/pricing/comparePrices";

describe("runComparison", () => {
  it("builds a row per matched item and picks the cheapest store", async () => {
    const result = await runComparison(["milk", "eggs"]);

    expect(result.rows).toHaveLength(2);

    const milk = result.rows.find((r) => r.rawItem === "milk");
    // Ralphs milk (4.49) is cheaper than Vons (4.79)
    expect(milk?.cheapestStoreSlug).toBe("ralphs");

    const eggs = result.rows.find((r) => r.rawItem === "eggs");
    // Vons eggs (3.49) is cheaper than Ralphs (3.99)
    expect(eggs?.cheapestStoreSlug).toBe("vons");
  });

  it("skips items with no matching product", async () => {
    const result = await runComparison(["milk", "nonexistent-product-xyz"]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].rawItem).toBe("milk");
  });

  it("returns an empty run for an empty list", async () => {
    const result = await runComparison([]);
    expect(result.rows).toHaveLength(0);
    expect(result.totals.splitStore).toBe(0);
  });

  it("uses default trip options when none are provided", async () => {
    const result = await runComparison(["milk"]);
    expect(result.tripEvaluation.extraMinutes).toBe(defaultTripOptions.extraMinutes);
    expect(result.tripEvaluation.valueOfTimeHourly).toBe(defaultTripOptions.valueOfTimeHourly);
  });

  it("flows custom trip options into the evaluation", async () => {
    const result = await runComparison(["milk"], {
      extraMinutes: 45,
      extraMiles: 12,
      valueOfTimeHourly: 40,
      gasCostPerMile: 0.5
    });

    expect(result.tripEvaluation.extraMinutes).toBe(45);
    expect(result.tripEvaluation.valueOfTimeHourly).toBe(40);
    // time: (45/60)*40 = 30; mileage: 12*0.5 = 6; total = 36
    expect(result.tripEvaluation.extraTripCost).toBe(36);
  });
});
