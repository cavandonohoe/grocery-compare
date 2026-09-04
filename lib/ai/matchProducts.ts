import OpenAI from "openai";
import type { StoreProduct } from "@/types/store";

type MatchProductsInput = {
  item: string;
  candidates: StoreProduct[];
};

type MatchProductsResult = {
  raw: string | null;
  candidates: StoreProduct[];
};

export async function matchProductsWithAi(
  { item, candidates }: MatchProductsInput
): Promise<MatchProductsResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { raw: null, candidates };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MATCH_MODEL ?? "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "Rank grocery products by equivalence to the requested item. Prefer same category, size, and usage."
      },
      {
        role: "user",
        content: JSON.stringify({ item, candidates })
      }
    ]
  });

  return {
    raw: response.output_text ?? null,
    candidates
  };
}
