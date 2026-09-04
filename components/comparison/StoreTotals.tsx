import type { ComparisonTotals } from "@/types/comparison";
import { formatCurrency } from "@/lib/pricing/money";

type StoreTotalsProps = {
  totals: ComparisonTotals;
};

export function StoreTotals({ totals }: StoreTotalsProps) {
  return (
    <div className="summary-grid">
      <div className="metric">
        <span>Ralph&apos;s total</span>
        <strong>{formatCurrency(totals.singleStore.ralphs)}</strong>
      </div>
      <div className="metric">
        <span>Vons total</span>
        <strong>{formatCurrency(totals.singleStore.vons)}</strong>
      </div>
      <div className="metric">
        <span>Split total</span>
        <strong>{formatCurrency(totals.splitStore)}</strong>
      </div>
      <div className="metric">
        <span>Best savings</span>
        <strong>{formatCurrency(totals.bestSavings)}</strong>
      </div>
    </div>
  );
}
