import type { TripEvaluation } from "@/types/comparison";
import { roundCurrency } from "@/lib/pricing/money";

type TripSavingsInput = {
  grossSavings: number;
  extraMinutes: number;
  extraMiles: number;
  valueOfTimeHourly: number;
  gasCostPerMile: number;
};

export function evaluateTripSavings(input: TripSavingsInput): TripEvaluation {
  const timeCost = (input.extraMinutes / 60) * input.valueOfTimeHourly;
  const mileageCost = input.extraMiles * input.gasCostPerMile;
  const extraTripCost = roundCurrency(timeCost + mileageCost);
  const netSavings = roundCurrency(input.grossSavings - extraTripCost);

  return {
    ...input,
    extraTripCost,
    netSavings,
    isWorthIt: netSavings > 0
  };
}
