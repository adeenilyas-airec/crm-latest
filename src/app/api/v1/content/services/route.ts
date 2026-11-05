import { NextResponse } from "next/server";
import { getServices, saveService } from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  tagline: z.string().optional(),
  body: z.string().optional(),
  capabilities: z.array(z.any()).optional(),
  meta: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json({ success: true, count: services.length, data: services });
  } catch (error) {
    console.error("[API Services GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const saved = await saveService(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("[API Services POST Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save service" }, { status: 500 });
  }
}
