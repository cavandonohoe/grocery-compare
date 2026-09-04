import { describe, expect, it } from "vitest";
import { compareRequestSchema } from "@/app/api/compare/route";

describe("compareRequestSchema", () => {
  it("accepts a valid body with items only", () => {
    const result = compareRequestSchema.safeParse({ items: ["milk", "eggs"] });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toEqual(["milk", "eggs"]);
      expect(result.data.tripOptions).toBeUndefined();
    }
  });

  it("accepts a valid body with partial tripOptions", () => {
    const result = compareRequestSchema.safeParse({
      items: ["milk"],
      tripOptions: { extraMinutes: 10 }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tripOptions).toEqual({ extraMinutes: 10 });
    }
  });

  it("accepts a valid body with full tripOptions", () => {
    const result = compareRequestSchema.safeParse({
      items: ["milk"],
      tripOptions: {
        extraMinutes: 15,
        extraMiles: 4,
        valueOfTimeHourly: 25,
        gasCostPerMile: 0.3
      }
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty items array", () => {
    const result = compareRequestSchema.safeParse({ items: [] });

    expect(result.success).toBe(false);
  });

  it("rejects items with empty strings", () => {
    const result = compareRequestSchema.safeParse({ items: [""] });

    expect(result.success).toBe(false);
  });

  it("rejects non-string items", () => {
    const result = compareRequestSchema.safeParse({ items: [123] });

    expect(result.success).toBe(false);
  });

  it("rejects a missing body", () => {
    const result = compareRequestSchema.safeParse(undefined);

    expect(result.success).toBe(false);
  });

  it("rejects a body without items", () => {
    const result = compareRequestSchema.safeParse({ tripOptions: { extraMiles: 2 } });

    expect(result.success).toBe(false);
  });

  it("rejects negative tripOptions values", () => {
    const result = compareRequestSchema.safeParse({
      items: ["milk"],
      tripOptions: { extraMiles: -1 }
    });

    expect(result.success).toBe(false);
  });
});
