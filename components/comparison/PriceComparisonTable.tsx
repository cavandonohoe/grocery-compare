import type { ComparisonRow } from "@/types/comparison";
import { formatCurrency } from "@/lib/pricing/money";

type PriceComparisonTableProps = {
  rows: ComparisonRow[];
};

export function PriceComparisonTable({ rows }: PriceComparisonTableProps) {
  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Ralph&apos;s</th>
          <th>Vons</th>
          <th>Cheapest</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.normalizedName}>
            <td>
              <strong>{row.normalizedName}</strong>
              <br />
              <span>{row.matchNote}</span>
            </td>
            <td className="price">{formatCurrency(row.storePrices.ralphs?.price)}</td>
            <td className="price">{formatCurrency(row.storePrices.vons?.price)}</td>
            <td>
              <span className="store-badge">{row.cheapestStoreName}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
