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
  singleStore: Record<StoreSlug, number>;
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
