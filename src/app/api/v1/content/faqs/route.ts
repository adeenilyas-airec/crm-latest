export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getFaqs, saveFaq, deleteFaq } from "@/lib/firebase/db";
import { z } from "zod";

const faqSchema = z.object({
  brand: z.enum(["airec", "metamindful"]),
  question: z.string().min(5),
  answer: z.string().min(5),
  location: z.string().optional(),
  serviceSlug: z.string().optional(),
  vectorTag: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = (searchParams.get("brand") as any) || undefined;
    const serviceSlug = searchParams.get("serviceSlug") || undefined;
    const faqs = await getFaqs(brand, serviceSlug);
    return NextResponse.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    console.error("[API FAQs GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const saved = await saveFaq(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("[API FAQs POST Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "FAQ id required" }, { status: 400 });
    const ok = await deleteFaq(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[API FAQs DELETE Error]", error);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ" }, { status: 500 });
  }
}
