import { NextResponse } from "next/server";
import { z } from "zod";
import { defaultTripOptions, runComparison } from "@/lib/pricing/comparePrices";

const compareRequestSchema = z.object({
  items: z.array(z.string().min(1)).min(1),
  tripOptions: z
    .object({
      extraMinutes: z.number().nonnegative(),
      extraMiles: z.number().nonnegative(),
      valueOfTimeHourly: z.number().nonnegative(),
      gasCostPerMile: z.number().nonnegative()
    })
    .partial()
    .optional()
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = compareRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid grocery list." }, { status: 400 });
  }

  const tripOptions = { ...defaultTripOptions, ...result.data.tripOptions };
  const comparison = await runComparison(result.data.items, tripOptions);
  return NextResponse.json(comparison);
}
