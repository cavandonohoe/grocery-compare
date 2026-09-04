/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ComparisonRow } from "@/types/comparison";
import type { StoreProduct, StoreSlug } from "@/types/store";
import { PriceComparisonTable } from "@/components/comparison/PriceComparisonTable";

function product(storeSlug: StoreSlug, price: number): StoreProduct {
  return {
    externalId: `${storeSlug}-${price}`,
    storeSlug,
    name: `${storeSlug} product`,
    price
  };
}

const rows: ComparisonRow[] = [
  {
    rawItem: "milk",
    normalizedName: "Whole Milk",
    storePrices: { ralphs: product("ralphs", 3.49), vons: product("vons", 3.99) },
    cheapestStoreSlug: "ralphs",
    cheapestStoreName: "Ralph's",
    matchScore: 0.95,
    matchNote: "Exact match"
  },
  {
    rawItem: "eggs",
    normalizedName: "Large Eggs",
    storePrices: { vons: product("vons", 2.25) },
    cheapestStoreSlug: "vons",
    cheapestStoreName: "Vons",
    matchScore: 0.8,
    matchNote: "Only at Vons"
  }
];

describe("PriceComparisonTable", () => {
  it("renders a column header for each store", () => {
    render(<PriceComparisonTable rows={rows} />);

    expect(screen.getByRole("columnheader", { name: "Item" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Ralph's" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Vons" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Cheapest" })).toBeInTheDocument();
  });

  it("renders one row per item with its name and match note", () => {
    render(<PriceComparisonTable rows={rows} />);

    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Exact match")).toBeInTheDocument();
    expect(screen.getByText("Large Eggs")).toBeInTheDocument();
    expect(screen.getByText("Only at Vons")).toBeInTheDocument();
  });

  it("shows N/A for a store that does not carry the item", () => {
    render(<PriceComparisonTable rows={rows} />);

    const eggsRow = screen.getByText("Large Eggs").closest("tr");
    expect(eggsRow).not.toBeNull();
    expect(within(eggsRow as HTMLTableRowElement).getByText("N/A")).toBeInTheDocument();
    expect(within(eggsRow as HTMLTableRowElement).getByText("$2.25")).toBeInTheDocument();
  });
});
