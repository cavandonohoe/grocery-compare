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
          "Rank grocery products by equivalence to the requested item. Prefer same category, size, and usage. Return only JSON in this shape: {\"externalIds\":[\"id\"]}."
      },
      {
        role: "user",
        content: JSON.stringify({ item, candidates })
      }
    ]
  });

  return {
    raw: response.output_text ?? null,
    candidates: rankCandidatesFromResponse(response.output_text, candidates)
  };
}

function rankCandidatesFromResponse(raw: string | undefined, candidates: StoreProduct[]) {
  if (!raw) {
    return candidates;
  }

  const ids = parseExternalIds(raw);
  if (ids.length === 0) {
    return candidates;
  }

  const byId = new Map(candidates.map((candidate) => [candidate.externalId, candidate]));
  const ranked: StoreProduct[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    const candidate = byId.get(id);
    if (candidate && !seen.has(id)) {
      ranked.push(candidate);
      seen.add(id);
    }
  }

  return [...ranked, ...candidates.filter((candidate) => !seen.has(candidate.externalId))];
}

function parseExternalIds(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "externalIds" in parsed &&
      Array.isArray(parsed.externalIds)
    ) {
      return parsed.externalIds.filter((id): id is string => typeof id === "string");
    }
  } catch {
    return [];
  }

  return [];
}
