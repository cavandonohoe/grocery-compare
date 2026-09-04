import type { TripEvaluation } from "@/types/comparison";
import { formatCurrency } from "@/lib/pricing/money";

type TripWorthItCardProps = {
  evaluation: TripEvaluation;
};

export function TripWorthItCard({ evaluation }: TripWorthItCardProps) {
  return (
    <div className="trip-card">
      <strong>{evaluation.isWorthIt ? "Split the trip" : "Single store is better"}</strong>
      <p>
        Splitting saves {formatCurrency(evaluation.grossSavings)}, with an estimated trip cost of{" "}
        {formatCurrency(evaluation.extraTripCost)}. Net value:{" "}
        {formatCurrency(evaluation.netSavings)}.
      </p>
    </div>
  );
}
