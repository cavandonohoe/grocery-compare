"use client";

import { useMemo, useState } from "react";

type GroceryListEditorProps = {
  initialItems: string[];
};

export function GroceryListEditor({ initialItems }: GroceryListEditorProps) {
  const [itemsText, setItemsText] = useState(initialItems.join("\n"));
  const itemCount = useMemo(
    () => itemsText.split("\n").map((item) => item.trim()).filter(Boolean).length,
    [itemsText]
  );

  return (
    <aside className="panel">
      <div className="panel-header">
        <h2>Your List</h2>
        <p>Add one grocery item per line. API-backed comparison is the next milestone.</p>
      </div>
      <form className="list-editor">
        <textarea
          aria-label="Grocery list items"
          value={itemsText}
          onChange={(event) => setItemsText(event.target.value)}
        />
        <div className="control-row">
          <div className="field">
            <label htmlFor="time-value">Time value</label>
            <input id="time-value" inputMode="decimal" defaultValue="20" />
          </div>
          <div className="field">
            <label htmlFor="extra-minutes">Extra minutes</label>
            <input id="extra-minutes" inputMode="numeric" defaultValue="18" />
          </div>
        </div>
        <button className="primary-button" type="button">
          Compare {itemCount} Items
        </button>
      </form>
    </aside>
  );
}
