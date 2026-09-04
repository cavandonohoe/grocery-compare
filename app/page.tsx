import { GroceryListEditor } from "@/components/grocery-list/GroceryListEditor";
import { PriceComparisonTable } from "@/components/comparison/PriceComparisonTable";
import { StoreTotals } from "@/components/comparison/StoreTotals";
import { TripWorthItCard } from "@/components/comparison/TripWorthItCard";
import { runComparison } from "@/lib/pricing/comparePrices";

const starterItems = ["milk", "eggs", "sourdough bread", "bananas", "greek yogurt"];
const comparison = await runComparison(starterItems);

export default function Home() {
  return (
    <main className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="brand">
            <h1>Grocery Compare</h1>
            <span>Ralph&apos;s vs Vons, built to add more stores.</span>
          </div>
          <span className="pill">Mock pricing</span>
        </header>

        <section className="workspace">
          <GroceryListEditor initialItems={starterItems} />
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
      </div>
    </main>
  );
}
