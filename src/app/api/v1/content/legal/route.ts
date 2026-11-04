import { NextResponse } from "next/server";
import { getLegalDocuments, getLegalDocument, saveLegalDocument } from "@/lib/firebase/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = (searchParams.get("brand") as any) || undefined;
    const type = (searchParams.get("type") as any) || undefined;

    if (brand && type) {
      const doc = await getLegalDocument(brand, type);
      return NextResponse.json({ success: true, data: doc });
    }

    const docs = await getLegalDocuments(brand);
    return NextResponse.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    console.error("[API Legal GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch legal documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.brand || !body.type || !body.title) {
      return NextResponse.json({ success: false, error: "brand, type, and title required" }, { status: 400 });
    }

    const saved = await saveLegalDocument(body);
    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (error) {
    console.error("[API Legal POST Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save legal document" }, { status: 500 });
  }
}
