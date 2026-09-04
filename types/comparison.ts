import type { StoreProduct, StoreSlug } from "@/types/store";

export type ComparisonRow = {
  rawItem: string;
  normalizedName: string;
  storePrices: Partial<Record<StoreSlug, StoreProduct>>;
  cheapestStoreSlug: StoreSlug;
  cheapestStoreName: string;
  matchScore: number;
  matchNote: string;
};

export type ComparisonTotals = {
  // `null` for a store means it cannot supply the entire basket, so it is not a
  // valid single-store option.
  singleStore: Record<StoreSlug, number | null>;
  splitStore: number;
  bestSavings: number;
};

export type TripEvaluation = {
  grossSavings: number;
  extraMinutes: number;
  extraMiles: number;
  valueOfTimeHourly: number;
  gasCostPerMile: number;
  extraTripCost: number;
  netSavings: number;
  isWorthIt: boolean;
};

export type ComparisonRun = {
  rows: ComparisonRow[];
  totals: ComparisonTotals;
  tripEvaluation: TripEvaluation;
};
