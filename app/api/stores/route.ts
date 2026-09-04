import { NextResponse } from "next/server";
import { getEnabledStoreAdapters } from "@/lib/stores/registry";

export function GET() {
  return NextResponse.json(
    getEnabledStoreAdapters().map((adapter) => ({
      slug: adapter.storeSlug,
      name: adapter.displayName,
      parentCompany: adapter.info.parentCompany,
      region: adapter.info.region,
      websiteUrl: adapter.info.websiteUrl,
      weeklyAdUrl: adapter.info.weeklyAdUrl,
      storeLocatorUrl: adapter.info.storeLocatorUrl,
      loyaltyProgram: adapter.info.loyaltyProgram
    }))
  );
}
