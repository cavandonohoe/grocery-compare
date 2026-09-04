import { NextResponse } from "next/server";
import { getEnabledStoreAdapters } from "@/lib/stores/registry";

export function GET() {
  return NextResponse.json(
    getEnabledStoreAdapters().map((adapter) => ({
      slug: adapter.storeSlug,
      name: adapter.displayName
    }))
  );
}
