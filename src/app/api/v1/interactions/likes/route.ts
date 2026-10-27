import { NextResponse } from "next/server";
import { likeBlog } from "@/lib/firebase/db";

export async function POST(req: Request) {
  try {
    const { blogSlug } = await req.json();
    if (!blogSlug) {
      return NextResponse.json({ success: false, error: "blogSlug required" }, { status: 400 });
    }

    const likesCount = await likeBlog(blogSlug);
    return NextResponse.json({ success: true, likesCount });
  } catch (error) {
    console.error("[API Likes Error]", error);
    return NextResponse.json({ success: false, error: "Failed to register like" }, { status: 500 });
  }
}
