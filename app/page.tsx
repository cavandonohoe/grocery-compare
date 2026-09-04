import { CompareWorkspace } from "@/components/grocery-list/CompareWorkspace";
import { runComparison } from "@/lib/pricing/comparePrices";

const starterItems = ["milk", "eggs", "sourdough bread", "bananas", "greek yogurt", "synergy kombucha"];

export default async function Home() {
  const initialComparison = await runComparison(starterItems);

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

        <CompareWorkspace initialItems={starterItems} initialComparison={initialComparison} />
      </div>
    </main>
  );
}
