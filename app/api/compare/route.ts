import { NextResponse } from "next/server";
import { z } from "zod";
import { runComparison } from "@/lib/pricing/comparePrices";

const compareRequestSchema = z.object({
  items: z.array(z.string().min(1)).min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = compareRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid grocery list." }, { status: 400 });
  }

  const comparison = await runComparison(result.data.items);
  return NextResponse.json(comparison);
}
