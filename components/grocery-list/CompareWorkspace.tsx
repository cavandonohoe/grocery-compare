"use client";

import { useMemo, useState } from "react";
import { PriceComparisonTable } from "@/components/comparison/PriceComparisonTable";
import { StoreTotals } from "@/components/comparison/StoreTotals";
import { TripWorthItCard } from "@/components/comparison/TripWorthItCard";
import type { ComparisonRun } from "@/types/comparison";

type CompareWorkspaceProps = {
  initialItems: string[];
  initialComparison: ComparisonRun;
};

export function CompareWorkspace({ initialItems, initialComparison }: CompareWorkspaceProps) {
  const [itemsText, setItemsText] = useState(initialItems.join("\n"));
  const [valueOfTimeHourly, setValueOfTimeHourly] = useState("20");
  const [extraMinutes, setExtraMinutes] = useState("18");
  const [comparison, setComparison] = useState(initialComparison);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(
    () => itemsText.split("\n").map((item) => item.trim()).filter(Boolean),
    [itemsText]
  );

  async function handleCompare(event: React.FormEvent) {
    event.preventDefault();

    if (items.length === 0) {
      setError("Add at least one grocery item.");
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          tripOptions: {
            valueOfTimeHourly: Number(valueOfTimeHourly) || 0,
            extraMinutes: Number(extraMinutes) || 0
          }
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Comparison failed.");
      }

      setComparison((await response.json()) as ComparisonRun);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Comparison failed.");
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <section className="workspace">
      <aside className="panel">
        <div className="panel-header">
          <h2>Your List</h2>
          <p>Add one grocery item per line, then compare across stores.</p>
        </div>
        <form className="list-editor" onSubmit={handleCompare}>
          <textarea
            aria-label="Grocery list items"
            value={itemsText}
            onChange={(event) => setItemsText(event.target.value)}
          />
          <div className="control-row">
            <div className="field">
              <label htmlFor="time-value">Time value ($/hr)</label>
              <input
                id="time-value"
                inputMode="decimal"
                value={valueOfTimeHourly}
                onChange={(event) => setValueOfTimeHourly(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="extra-minutes">Extra minutes</label>
              <input
                id="extra-minutes"
                inputMode="numeric"
                value={extraMinutes}
                onChange={(event) => setExtraMinutes(event.target.value)}
              />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={isComparing}>
            {isComparing ? "Comparing…" : `Compare ${items.length} Items`}
          </button>
          {error ? <p role="alert">{error}</p> : null}
        </form>
      </aside>

      <div className="panel">
        <div className="panel-header">
          <h2>Best Basket</h2>
          <p>Equivalent products are matched through the shared store adapter flow.</p>
        </div>
        <StoreTotals totals={comparison.totals} />
        <PriceComparisonTable rows={comparison.rows} />
        <TripWorthItCard evaluation={comparison.tripEvaluation} />
      </div>
    </section>
  );
}
