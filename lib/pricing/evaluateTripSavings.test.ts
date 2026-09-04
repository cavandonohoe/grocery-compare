import { describe, expect, it } from "vitest";
import { evaluateTripSavings } from "@/lib/pricing/evaluateTripSavings";

const baseInput = {
  grossSavings: 20,
  extraMinutes: 30,
  extraMiles: 10,
  valueOfTimeHourly: 20,
  gasCostPerMile: 0.25
};

describe("evaluateTripSavings", () => {
  it("computes trip cost from time and mileage", () => {
    // time: (30/60) * 20 = 10; mileage: 10 * 0.25 = 2.5; total = 12.5
    const result = evaluateTripSavings(baseInput);
    expect(result.extraTripCost).toBe(12.5);
    expect(result.netSavings).toBe(7.5);
    expect(result.isWorthIt).toBe(true);
  });

  it("is not worth it when trip cost exceeds gross savings", () => {
    const result = evaluateTripSavings({ ...baseInput, grossSavings: 5 });
    expect(result.netSavings).toBe(-7.5);
    expect(result.isWorthIt).toBe(false);
  });

  it("treats a net of exactly zero as not worth it", () => {
    // trip cost is 12.5, so gross of 12.5 gives net 0
    const result = evaluateTripSavings({ ...baseInput, grossSavings: 12.5 });
    expect(result.netSavings).toBe(0);
    expect(result.isWorthIt).toBe(false);
  });

  it("echoes the input parameters back on the result", () => {
    const result = evaluateTripSavings(baseInput);
    expect(result.extraMinutes).toBe(30);
    expect(result.valueOfTimeHourly).toBe(20);
  });
});
