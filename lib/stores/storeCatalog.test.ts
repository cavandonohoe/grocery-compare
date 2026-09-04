import { describe, expect, it } from "vitest";
import {
  getAllStoreInfo,
  getStoreInfo,
  storeCatalog
} from "@/lib/stores/storeCatalog";
import type { StoreSlug } from "@/types/store";

const slugs: StoreSlug[] = ["ralphs", "vons"];

describe("storeCatalog", () => {
  it("uses the retailers' real brand names (Ralphs has no apostrophe)", () => {
    expect(getStoreInfo("ralphs").name).toBe("Ralphs");
    expect(getStoreInfo("vons").name).toBe("Vons");
  });

  it("maps each store to the correct parent company", () => {
    expect(getStoreInfo("ralphs").parentCompany).toBe("Kroger");
    expect(getStoreInfo("vons").parentCompany).toBe("Albertsons");
  });

  it("has an entry for every known store slug", () => {
    slugs.forEach((slug) => {
      expect(storeCatalog[slug]).toBeDefined();
      expect(storeCatalog[slug].slug).toBe(slug);
    });
    expect(getAllStoreInfo()).toHaveLength(slugs.length);
  });

  it("exposes https links we can open to verify prices ourselves", () => {
    getAllStoreInfo().forEach((info) => {
      [info.websiteUrl, info.weeklyAdUrl, info.storeLocatorUrl].forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
        expect(() => new URL(url)).not.toThrow();
      });
    });
  });

  it("names a loyalty program for every store", () => {
    getAllStoreInfo().forEach((info) => {
      expect(info.loyaltyProgram.length).toBeGreaterThan(0);
    });
  });
});
