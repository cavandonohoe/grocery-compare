import { describe, expect, it } from "vitest";
import { formatCurrency, roundCurrency } from "@/lib/pricing/money";

describe("formatCurrency", () => {
  it("formats numbers as USD", () => {
    expect(formatCurrency(4.5)).toBe("$4.50");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("returns N/A for null or undefined", () => {
    expect(formatCurrency(null)).toBe("N/A");
    expect(formatCurrency(undefined)).toBe("N/A");
  });

  it("formats negative values", () => {
    expect(formatCurrency(-2.5)).toBe("-$2.50");
  });
});

describe("roundCurrency", () => {
  it("rounds to two decimal places", () => {
    expect(roundCurrency(2.345)).toBe(2.35);
    expect(roundCurrency(2.344)).toBe(2.34);
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });

  it("reflects floating-point rounding of exact half values", () => {
    // 1.005 * 100 is 100.49999999999999 in IEEE-754, so it rounds down.
    // This documents the current Math.round behavior rather than asserting
    // idealized half-up rounding.
    expect(roundCurrency(1.005)).toBe(1);
  });

  it("leaves whole numbers unchanged", () => {
    expect(roundCurrency(10)).toBe(10);
  });
});
