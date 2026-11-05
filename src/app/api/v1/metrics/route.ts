import { NextResponse } from "next/server";
import { getCRMMetrics } from "@/lib/db";
import type { TenantBrand } from "@/types/crm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand") as TenantBrand | null;
    const metrics = await getCRMMetrics(brand || undefined);
    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") throw error;
    console.error("[API Metrics Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch metrics" }, { status: 500 });
  }
}

