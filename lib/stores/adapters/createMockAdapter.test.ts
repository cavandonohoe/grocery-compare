import { describe, expect, it } from "vitest";
import { createMockAdapter } from "@/lib/stores/adapters/createMockAdapter";

describe("createMockAdapter", () => {
  const adapter = createMockAdapter("ralphs");

  it("exposes the store slug and display name", () => {
    expect(adapter.storeSlug).toBe("ralphs");
    expect(adapter.displayName).toBe("Ralphs");
  });

  it("exposes verifiable store metadata", () => {
    expect(adapter.info.name).toBe("Ralphs");
    expect(adapter.info.parentCompany).toBe("Kroger");
    expect(adapter.info.websiteUrl).toBe("https://www.ralphs.com");
  });

  it("only returns products for its own store", async () => {
    const results = await adapter.searchProducts("milk");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.storeSlug === "ralphs")).toBe(true);
  });

  it("ranks better matches first by term overlap", async () => {
    const results = await adapter.searchProducts("greek yogurt");
    expect(results[0].name.toLowerCase()).toContain("greek yogurt");
  });

  it("honors the requested result limit", async () => {
    const results = await adapter.searchProducts("dairy", { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it("returns nothing when no term matches", async () => {
    const results = await adapter.searchProducts("nonexistent-product-xyz");
    expect(results).toHaveLength(0);
  });

  it("looks up a product by external id", async () => {
    const found = await adapter.getProductPrice("ralphs-milk-1");
    expect(found?.externalId).toBe("ralphs-milk-1");

    const missing = await adapter.getProductPrice("does-not-exist");
    expect(missing).toBeNull();
  });
});
