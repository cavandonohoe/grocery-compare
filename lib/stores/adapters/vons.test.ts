import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVonsAdapter } from "@/lib/stores/adapters/vons";
import type { VonsPdpResponse } from "@/lib/stores/adapters/vonsApi";

const sampleResponse: VonsPdpResponse = {
  catalog: {
    response: {
      docs: [
        {
          pid: "971137941",
          name: "Tyson Lightly Breaded Boneless Chicken Bites - 1.25 Lb",
          price: 10.99,
          basePrice: 13.99,
          pricePer: 0.55,
          unitOfMeasure: "OZ",
          itemSizeQty: "20"
        }
      ]
    }
  }
};

function mockJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response;
}

const ORIGINAL_ENV = { ...process.env };

describe("createVonsAdapter", () => {
  beforeEach(() => {
    process.env.VONS_SUBSCRIPTION_KEY = "test-key";
    process.env.VONS_COOKIES = "reese84=abc";
    process.env.VONS_STORE_ID = "2002";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("exposes verifiable store metadata", () => {
    const adapter = createVonsAdapter();
    expect(adapter.storeSlug).toBe("vons");
    expect(adapter.info.parentCompany).toBe("Albertsons");
  });

  it("fetches live pricing via the API for getProductPrice", async () => {
    const fetchImpl = vi.fn(async () => mockJsonResponse(sampleResponse));
    const adapter = createVonsAdapter(fetchImpl as unknown as typeof fetch);
    const product = await adapter.getProductPrice("971137941");
    expect(product?.price).toBe(10.99);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to mock pricing when credentials are missing", async () => {
    delete process.env.VONS_SUBSCRIPTION_KEY;
    delete process.env.VONS_COOKIES;
    const fetchImpl = vi.fn(async () => mockJsonResponse(sampleResponse));
    const adapter = createVonsAdapter(fetchImpl as unknown as typeof fetch);
    const product = await adapter.getProductPrice("vons-synergy-1");
    expect(product?.externalId).toBe("vons-synergy-1");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to mock pricing on a bot block (403)", async () => {
    const fetchImpl = vi.fn(async () => mockJsonResponse("blocked", 403));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const adapter = createVonsAdapter(fetchImpl as unknown as typeof fetch);
    const product = await adapter.getProductPrice("vons-milk-1");
    expect(product?.externalId).toBe("vons-milk-1");
  });

  it("delegates search to mock data", async () => {
    const adapter = createVonsAdapter();
    const results = await adapter.searchProducts("kombucha");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.storeSlug === "vons")).toBe(true);
  });
});
