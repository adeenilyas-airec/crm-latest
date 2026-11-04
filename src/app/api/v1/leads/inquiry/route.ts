export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createInquiry, getInquiries, updateInquiryStatus } from "@/lib/firebase/db";
import { z } from "zod";
import type { TenantBrand, InquiryStatus } from "@/types/crm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand") as TenantBrand | null;
    const status = searchParams.get("status") as InquiryStatus | null;

    const data = await getInquiries(brand || undefined, status || undefined);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("[API Inquiries GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

const inquirySchema = z.object({
  brand: z.enum(["airec", "metamindful"]).default("airec"),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  organization: z.string().optional(),
  message: z.string().min(5).max(5000),
  serviceInterest: z.string().optional(),
  sourceUrl: z.string().optional(),
  botTrap: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.botTrap && typeof body.botTrap === "string" && body.botTrap.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Inquiry received" }, { status: 200 });
    }

    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const inquiry = await createInquiry(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Contact inquiry successfully registered in CRM",
      inquiryId: inquiry.id,
    }, { status: 201 });
  } catch (error) {
    console.error("[API Inquiries POST Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: "Missing inquiry ID or status" }, { status: 400 });
    }

    const updated = await updateInquiryStatus(body.id, body.status, body.notes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Inquiry updated successfully" });
  } catch (error) {
    console.error("[API Inquiries PATCH Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

