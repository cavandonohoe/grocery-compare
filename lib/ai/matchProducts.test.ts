import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoreProduct } from "@/types/store";

const createMock = vi.fn();

vi.mock("openai", () => {
  return {
    default: class {
      responses = {
        create: createMock
      };
    }
  };
});

function candidate(externalId: string, price: number): StoreProduct {
  return {
    externalId,
    storeSlug: "ralphs",
    name: `product ${externalId}`,
    price
  };
}

const candidates: StoreProduct[] = [candidate("a", 3), candidate("b", 5)];

describe("matchProductsWithAi", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("returns { raw: null, candidates } and skips OpenAI when no API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const { matchProductsWithAi } = await import("@/lib/ai/matchProducts");

    const result = await matchProductsWithAi({ item: "milk", candidates });

    expect(result).toEqual({ raw: null, candidates });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns the mocked output_text and candidates when the API key is set", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    createMock.mockResolvedValue({ output_text: "ranked result" });
    const { matchProductsWithAi } = await import("@/lib/ai/matchProducts");

    const result = await matchProductsWithAi({ item: "milk", candidates });

    expect(result).toEqual({ raw: "ranked result", candidates });
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("reorders candidates when OpenAI returns known external ids", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    createMock.mockResolvedValue({ output_text: JSON.stringify({ externalIds: ["b", "a"] }) });
    const { matchProductsWithAi } = await import("@/lib/ai/matchProducts");

    const result = await matchProductsWithAi({ item: "milk", candidates });

    expect(result.candidates.map((candidate) => candidate.externalId)).toEqual(["b", "a"]);
  });
});
