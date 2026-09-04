/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ComparisonTotals } from "@/types/comparison";
import { StoreTotals } from "@/components/comparison/StoreTotals";

const totals: ComparisonTotals = {
  singleStore: { ralphs: 42.5, vons: 39.99 },
  splitStore: 35.25,
  bestSavings: 4.74
};

describe("StoreTotals", () => {
  it("labels each metric", () => {
    render(<StoreTotals totals={totals} />);

    expect(screen.getByText("Ralph's total")).toBeInTheDocument();
    expect(screen.getByText("Vons total")).toBeInTheDocument();
    expect(screen.getByText("Split total")).toBeInTheDocument();
    expect(screen.getByText("Best savings")).toBeInTheDocument();
  });

  it("formats each total as USD currency", () => {
    render(<StoreTotals totals={totals} />);

    expect(screen.getByText("$42.50")).toBeInTheDocument();
    expect(screen.getByText("$39.99")).toBeInTheDocument();
    expect(screen.getByText("$35.25")).toBeInTheDocument();
    expect(screen.getByText("$4.74")).toBeInTheDocument();
  });

  it("renders N/A when a store cannot supply the basket", () => {
    render(
      <StoreTotals
        totals={{ singleStore: { ralphs: 10, vons: null }, splitStore: 10, bestSavings: 0 }}
      />
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
