import { describe, expect, it, vi } from "vitest";
import {
  VonsBotBlockError,
  VonsCredentialsError,
  buildPdpUrl,
  docToStoreProduct,
  fetchVonsProduct,
  getVonsApiConfig,
  type VonsApiConfig,
  type VonsPdpResponse
} from "@/lib/stores/adapters/vonsApi";

const config: VonsApiConfig = {
  storeId: "2002",
  subscriptionKey: "test-key",
  cookies: "reese84=abc; incap_ses_1=xyz",
  userAgent: "test-agent"
};

// Mirrors the real `catalog.response.docs[0]` shape from the pdpdata API.
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
          basePricePer: 0.7,
          unitOfMeasure: "OZ",
          itemSizeQty: "20",
          promoDescription: "Club Card Price: $10.99 Save Up To: $3.0",
          promoEndDate: "2026-09-29T23:59:00",
          imageUrl: "https://images.albertsons-media.com/is/image/ABS/971137941"
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

describe("buildPdpUrl", () => {
  it("includes the product id, store id, and offer flag", () => {
    const url = new URL(buildPdpUrl("971137941", "2002"));
    expect(url.pathname).toBe("/abs/pub/xapi/product/v2/pdpdata");
    expect(url.searchParams.get("bpn")).toBe("971137941");
    expect(url.searchParams.get("storeId")).toBe("2002");
    expect(url.searchParams.get("includeOffer")).toBe("true");
    expect(url.searchParams.get("banner")).toBe("vons");
  });
});

describe("docToStoreProduct", () => {
  it("maps price fields from a pdp doc", () => {
    const doc = sampleResponse.catalog!.response!.docs![0];
    const product = docToStoreProduct(doc);
    expect(product).toMatchObject({
      externalId: "971137941",
      storeSlug: "vons",
      name: "Tyson Lightly Breaded Boneless Chicken Bites - 1.25 Lb",
      size: "20 oz",
      price: 10.99,
      unitPrice: 0.55
    });
    expect(product.productUrl).toContain("971137941");
  });
});

describe("getVonsApiConfig", () => {
  it("reads credentials from the environment", () => {
    const cfg = getVonsApiConfig({
      VONS_SUBSCRIPTION_KEY: "key",
      VONS_COOKIES: "reese84=abc",
      VONS_STORE_ID: "1234"
    });
    expect(cfg.subscriptionKey).toBe("key");
    expect(cfg.cookies).toBe("reese84=abc");
    expect(cfg.storeId).toBe("1234");
  });

  it("defaults the store id when unset", () => {
    const cfg = getVonsApiConfig({
      VONS_SUBSCRIPTION_KEY: "key",
      VONS_COOKIES: "reese84=abc"
    });
    expect(cfg.storeId).toBe("2002");
  });

  it("throws when credentials are missing", () => {
    expect(() => getVonsApiConfig({})).toThrow(VonsCredentialsError);
  });
});

describe("fetchVonsProduct", () => {
  it("returns a parsed product on success and sends auth headers", async () => {
    const fetchImpl = vi.fn(async () => mockJsonResponse(sampleResponse));
    const product = await fetchVonsProduct("971137941", config, fetchImpl as unknown as typeof fetch);

    expect(product?.price).toBe(10.99);
    expect(product?.externalId).toBe("971137941");

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["ocp-apim-subscription-key"]).toBe("test-key");
    expect(headers.cookie).toBe(config.cookies);
  });

  it("returns null when no product doc is present", async () => {
    const fetchImpl = vi.fn(async () =>
      mockJsonResponse({ catalog: { response: { docs: [] } } })
    );
    const product = await fetchVonsProduct("000", config, fetchImpl as unknown as typeof fetch);
    expect(product).toBeNull();
  });

  it("throws VonsBotBlockError on a 403", async () => {
    const fetchImpl = vi.fn(async () => mockJsonResponse("blocked", 403));
    await expect(
      fetchVonsProduct("971137941", config, fetchImpl as unknown as typeof fetch)
    ).rejects.toBeInstanceOf(VonsBotBlockError);
  });

  it("throws on other non-ok statuses", async () => {
    const fetchImpl = vi.fn(async () => mockJsonResponse("err", 500));
    await expect(
      fetchVonsProduct("971137941", config, fetchImpl as unknown as typeof fetch)
    ).rejects.toThrow(/HTTP 500/);
  });
});
