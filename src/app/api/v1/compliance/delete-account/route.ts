export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createDeletion, getDeletions } from "@/lib/firebase/db";
import { z } from "zod";

const deletionSchema = z.object({
  email: z.string().email(),
  reason: z.string().max(2000).optional(),
  company: z.string().optional(), // Honeypot
});

export async function GET() {
  try {
    const list = await getDeletions();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("[API Deletions GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch deletion requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot check
    if (body.company && typeof body.company === "string" && body.company.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Deletion request submitted" });
    }

    const parsed = deletionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";

    const request = await createDeletion(parsed.data.email, parsed.data.reason, ip);

    return NextResponse.json({
      success: true,
      message: "Deletion request registered in CRM compliance desk",
      ticketId: request.id,
      gracePeriodEndsAt: request.gracePeriodEndsAt,
    }, { status: 201 });
  } catch (error) {
    console.error("[API Deletion Request Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
