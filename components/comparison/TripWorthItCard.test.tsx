/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TripEvaluation } from "@/types/comparison";
import { TripWorthItCard } from "@/components/comparison/TripWorthItCard";

function evaluation(overrides: Partial<TripEvaluation> = {}): TripEvaluation {
  return {
    grossSavings: 6.5,
    extraMinutes: 18,
    extraMiles: 4,
    valueOfTimeHourly: 20,
    gasCostPerMile: 0.2,
    extraTripCost: 6.8,
    netSavings: -0.3,
    isWorthIt: false,
    ...overrides
  };
}

describe("TripWorthItCard", () => {
  it("recommends splitting when the trip is worth it", () => {
    render(<TripWorthItCard evaluation={evaluation({ isWorthIt: true, netSavings: 2.5 })} />);

    expect(screen.getByText("Split the trip")).toBeInTheDocument();
  });

  it("recommends a single store when the trip is not worth it", () => {
    render(<TripWorthItCard evaluation={evaluation({ isWorthIt: false })} />);

    expect(screen.getByText("Single store is better")).toBeInTheDocument();
  });

  it("shows the gross savings, trip cost, and net value as currency", () => {
    render(
      <TripWorthItCard
        evaluation={evaluation({ grossSavings: 6.5, extraTripCost: 6.8, netSavings: -0.3 })}
      />
    );

    const paragraph = screen.getByText(/Splitting saves/);
    expect(paragraph).toHaveTextContent("$6.50");
    expect(paragraph).toHaveTextContent("$6.80");
    expect(paragraph).toHaveTextContent("-$0.30");
  });
});
